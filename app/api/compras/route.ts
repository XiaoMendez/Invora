import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { searchParams } = new URL(request.url)
    const estado = searchParams.get("estado")
    const proveedorId = searchParams.get("proveedor")
    const search = searchParams.get("search")

    let query = supabase
      .from("compra")
      .select(`
        id,
        numero,
        estado,
        subtotal,
        impuesto,
        monto_total,
        metodo_pago,
        creado_en,
        proveedor(id, nombre, correo, telefono),
        compra_detalle(id, id_producto, cantidad, precio_unitario, subtotal, producto(nombre, sku))
      `)
      .eq("id_empresa", empresaId)
      .order("creado_en", { ascending: false })

    if (estado) {
      query = query.eq("estado", estado)
    }

    if (proveedorId) {
      query = query.eq("id_proveedor", proveedorId)
    }

    if (search) {
      query = query.or(`numero.ilike.%${search}%,proveedor.nombre.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ compras: data || [] })
  } catch (error) {
    console.error("[compras GET]", error)
    return NextResponse.json({ error: "Error al obtener compras" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const body = await request.json()
    const { id_proveedor, metodo_pago = "efectivo", notas } = body

    if (!id_proveedor) {
      return NextResponse.json({ error: "El proveedor es requerido" }, { status: 400 })
    }

    // Validar que el proveedor existe
    const { data: proveedor, error: provError } = await supabase
      .from("proveedor")
      .select("id")
      .eq("id", id_proveedor)
      .eq("id_empresa", empresaId)
      .single()

    if (provError || !proveedor) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 })
    }

    // Obtener número de compra secuencial
    const { data: lastCompra } = await supabase
      .from("compra")
      .select("numero")
      .eq("id_empresa", empresaId)
      .order("numero", { ascending: false })
      .limit(1)
      .single()

    const numeroCompra = (lastCompra?.numero || 0) + 1

    // Crear compra
    const { data: compra, error: compraError } = await supabase
      .from("compra")
      .insert({
        id_empresa: empresaId,
        id_proveedor,
        numero: numeroCompra,
        estado: "pendiente",
        subtotal: 0,
        impuesto: 0,
        monto_total: 0,
        metodo_pago,
        notas: notas || null,
      })
      .select(
        `
        id,
        numero,
        estado,
        subtotal,
        impuesto,
        monto_total,
        metodo_pago,
        creado_en,
        proveedor(id, nombre),
        compra_detalle(id, id_producto, cantidad, precio_unitario, subtotal)
      `
      )
      .single()

    if (compraError) throw compraError

    return NextResponse.json({ compra })
  } catch (error) {
    console.error("[compras POST]", error)
    return NextResponse.json({ error: "Error al crear compra" }, { status: 500 })
  }
}

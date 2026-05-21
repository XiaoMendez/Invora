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
    const clienteId = searchParams.get("cliente")
    const search = searchParams.get("search")

    let query = supabase
      .from("venta")
      .select(`
        id,
        numero,
        estado,
        subtotal,
        descuento,
        impuesto,
        monto_total,
        metodo_pago,
        creado_en,
        cliente(id, nombre, correo, telefono),
        venta_detalle(id, id_producto, cantidad, precio_unitario, descuento, subtotal, producto(nombre, sku))
      `)
      .eq("id_empresa", empresaId)
      .order("creado_en", { ascending: false })

    if (estado) {
      query = query.eq("estado", estado)
    }

    if (clienteId) {
      query = query.eq("id_cliente", clienteId)
    }

    if (search) {
      query = query.or(`numero.ilike.%${search}%,cliente.nombre.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ ventas: data || [] })
  } catch (error) {
    console.error("[ventas GET]", error)
    return NextResponse.json({ error: "Error al obtener ventas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const body = await request.json()
    const { id_cliente, metodo_pago = "efectivo", notas } = body

    // id_cliente es opcional, proveedor es requerido en compras pero no aquí

    // Obtener número de venta secuencial
    const { data: lastVenta } = await supabase
      .from("venta")
      .select("numero")
      .eq("id_empresa", empresaId)
      .order("numero", { ascending: false })
      .limit(1)
      .single()

    const numeroVenta = (lastVenta?.numero || 0) + 1

    // Crear venta
    const { data: venta, error: ventaError } = await supabase
      .from("venta")
      .insert({
        id_empresa: empresaId,
        id_cliente: id_cliente || null,
        numero: numeroVenta,
        estado: "pendiente",
        subtotal: 0,
        descuento: 0,
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
        descuento,
        impuesto,
        monto_total,
        metodo_pago,
        creado_en,
        cliente(id, nombre),
        venta_detalle(id, id_producto, cantidad, precio_unitario, descuento, subtotal)
      `
      )
      .single()

    if (ventaError) throw ventaError

    return NextResponse.json({ venta })
  } catch (error) {
    console.error("[ventas POST]", error)
    return NextResponse.json({ error: "Error al crear venta" }, { status: 500 })
  }
}

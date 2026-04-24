import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { EmpresaNotConfiguredError, UserNotAuthenticatedError, getEmpresaId } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

type CompraItem = {
  id_producto: string
  cantidad: number
  precio_unitario: number
}

export async function GET() {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { data, error } = await supabase
      .from("compra")
      .select("id, numero, estado, monto_total, creado_en, proveedor:proveedor(nombre), compra_detalle(cantidad)")
      .eq("id_empresa", empresaId)
      .order("creado_en", { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({ compras: data || [] })
  } catch (error) {
    console.error("[compras GET]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al cargar compras" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const body = await request.json()
    const idProveedor = body.id_proveedor as string
    const items = (body.items || []) as CompraItem[]
    const notas = (body.notas as string | undefined)?.trim() || null

    if (!idProveedor) {
      return NextResponse.json({ error: "La compra requiere un proveedor" }, { status: 400 })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "La compra debe incluir al menos un producto" }, { status: 400 })
    }

    const productIds = items.map((item) => item.id_producto)
    const { data: productos, error: productosError } = await supabase
      .from("producto")
      .select("id")
      .eq("id_empresa", empresaId)
      .in("id", productIds)

    if (productosError) throw productosError

    if ((productos || []).length !== productIds.length) {
      return NextResponse.json({ error: "Uno o más productos no pertenecen a tu empresa" }, { status: 400 })
    }

    const { data: proveedor, error: proveedorError } = await supabase
      .from("proveedor")
      .select("id")
      .eq("id", idProveedor)
      .eq("id_empresa", empresaId)
      .single()

    if (proveedorError || !proveedor) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 })
    }

    const { data: compra, error: compraError } = await supabase
      .from("compra")
      .insert({
        id_empresa: empresaId,
        id_proveedor: idProveedor,
        estado: "recibida",
        notas,
      })
      .select("id")
      .single()

    if (compraError || !compra) throw compraError

    const detalles = items.map((item) => ({
      id_compra: compra.id,
      id_producto: item.id_producto,
      cantidad: Number(item.cantidad),
      precio_unitario: Number(item.precio_unitario),
    }))

    const { error: detalleError } = await supabase.from("compra_detalle").insert(detalles)
    if (detalleError) throw detalleError

    const relaciones = items.map((item) => ({
      id_producto: item.id_producto,
      id_proveedor: idProveedor,
      precio_compra: Number(item.precio_unitario),
      es_principal: false,
    }))

    await supabase
      .from("producto_proveedor")
      .upsert(relaciones, { onConflict: "id_producto,id_proveedor" })

    return NextResponse.json({ success: true, id_compra: compra.id })
  } catch (error) {
    console.error("[compras POST]", error)
    const message = error instanceof Error ? error.message : "Error al registrar compra"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

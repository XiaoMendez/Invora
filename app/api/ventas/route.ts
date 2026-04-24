import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { EmpresaNotConfiguredError, UserNotAuthenticatedError, getEmpresaId } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

type VentaItem = {
  id_producto: string
  cantidad: number
  precio_unitario: number
}

export async function GET() {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { data, error } = await supabase
      .from("venta")
      .select("id, numero, estado, monto_total, creado_en, cliente:cliente(nombre, apellido), venta_detalle(cantidad)")
      .eq("id_empresa", empresaId)
      .order("creado_en", { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({ ventas: data || [] })
  } catch (error) {
    console.error("[ventas GET]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al cargar ventas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const body = await request.json()
    const idCliente = body.id_cliente as string
    const items = (body.items || []) as VentaItem[]
    const notas = (body.notas as string | undefined)?.trim() || null

    if (!idCliente) {
      return NextResponse.json({ error: "La venta requiere un cliente" }, { status: 400 })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "La venta debe incluir al menos un producto" }, { status: 400 })
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

    const { data: cliente, error: clienteError } = await supabase
      .from("cliente")
      .select("id")
      .eq("id", idCliente)
      .eq("id_empresa", empresaId)
      .single()

    if (clienteError || !cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    const { data: venta, error: ventaError } = await supabase
      .from("venta")
      .insert({
        id_empresa: empresaId,
        id_cliente: idCliente,
        estado: "completada",
        notas,
      })
      .select("id")
      .single()

    if (ventaError || !venta) throw ventaError

    const detalles = items.map((item) => ({
      id_venta: venta.id,
      id_producto: item.id_producto,
      cantidad: Number(item.cantidad),
      precio_unitario: Number(item.precio_unitario),
    }))

    const { error: detalleError } = await supabase.from("venta_detalle").insert(detalles)
    if (detalleError) throw detalleError

    return NextResponse.json({ success: true, id_venta: venta.id })
  } catch (error) {
    console.error("[ventas POST]", error)
    const message = error instanceof Error ? error.message : "Error al registrar venta"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

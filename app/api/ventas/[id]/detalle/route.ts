import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getEmpresaId, UserNotAuthenticatedError, EmpresaNotConfiguredError } from "@/lib/supabase/empresa"
import { describeError } from "@/lib/api-error"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: ventaId } = await params
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const admin = createAdminClient()

    const { data: detalles, error } = await admin
      .from("venta_detalle")
      .select("id, id_producto, cantidad, precio_unitario, descuento, subtotal, producto(id, nombre, sku)")
      .eq("id_venta", ventaId)

    if (error) throw error

    return NextResponse.json({ detalles: detalles || [] })
  } catch (error) {
    console.error("[venta detalle GET]", error)
    if (error instanceof UserNotAuthenticatedError) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    if (error instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: "Empresa no configurada" }, { status: 403 })
    return NextResponse.json({ error: "Error al obtener detalles", detalle: describeError(error) }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: ventaId } = await params
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const admin = createAdminClient()

    const body = await request.json()
    const { id_producto, cantidad, precio_unitario, descuento = 0 } = body

    if (!id_producto || !cantidad || !precio_unitario) {
      return NextResponse.json(
        { error: "Producto, cantidad y precio son requeridos" },
        { status: 400 }
      )
    }

    // Validate venta exists and belongs to this empresa
    const { data: venta, error: ventaError } = await admin
      .from("venta")
      .select("id, estado")
      .eq("id", ventaId)
      .eq("id_empresa", empresaId)
      .single()

    if (ventaError || !venta) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    if ((venta.estado as string) === "completada") {
      return NextResponse.json(
        { error: "No se pueden agregar productos a una venta completada" },
        { status: 400 }
      )
    }

    // Validate product exists and has enough stock
    const { data: producto } = await admin
      .from("producto")
      .select("id, stock")
      .eq("id", id_producto)
      .eq("id_empresa", empresaId)
      .single()

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const qty = parseInt(cantidad)
    if (qty > producto.stock) {
      return NextResponse.json(
        { error: `Stock insuficiente. Disponible: ${producto.stock}, Solicitado: ${qty}` },
        { status: 400 }
      )
    }

    // subtotal is a generated column (cantidad * precio_unitario - descuento) — do not insert it
    const { data: detalle, error: detalleError } = await admin
      .from("venta_detalle")
      .insert({
        id_venta: ventaId,
        id_producto,
        cantidad: qty,
        precio_unitario: parseFloat(precio_unitario),
        descuento: parseFloat(descuento) || 0,
      })
      .select("id, id_producto, cantidad, precio_unitario, descuento, subtotal")
      .single()

    if (detalleError) throw detalleError

    // Recalculate and update venta totals
    const { data: todosDetalles } = await admin
      .from("venta_detalle")
      .select("subtotal")
      .eq("id_venta", ventaId)

    const nuevoSubtotal = (todosDetalles || []).reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0)

    await admin
      .from("venta")
      .update({ subtotal: nuevoSubtotal, monto_total: nuevoSubtotal })
      .eq("id", ventaId)

    return NextResponse.json({ detalle })
  } catch (error) {
    console.error("[venta detalle POST]", error)
    if (error instanceof UserNotAuthenticatedError) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    if (error instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: "Empresa no configurada" }, { status: 403 })
    return NextResponse.json({ error: "Error al agregar producto", detalle: describeError(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: ventaId } = await params
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const admin = createAdminClient()
    const { searchParams } = new URL(request.url)
    const detalleId = searchParams.get("detalleId") || ""

    const { data: venta, error: ventaError } = await admin
      .from("venta")
      .select("id, estado")
      .eq("id", ventaId)
      .eq("id_empresa", empresaId)
      .single()

    if (ventaError || !venta) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    if ((venta.estado as string) === "completada") {
      return NextResponse.json(
        { error: "No se pueden eliminar productos de una venta completada" },
        { status: 400 }
      )
    }

    const { error: deleteError } = await admin
      .from("venta_detalle")
      .delete()
      .eq("id", detalleId)
      .eq("id_venta", ventaId)

    if (deleteError) throw deleteError

    const { data: todosDetalles } = await admin
      .from("venta_detalle")
      .select("subtotal")
      .eq("id_venta", ventaId)

    const nuevoSubtotal = (todosDetalles || []).reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0)

    await admin
      .from("venta")
      .update({ subtotal: nuevoSubtotal, monto_total: nuevoSubtotal })
      .eq("id", ventaId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[venta detalle DELETE]", error)
    if (error instanceof UserNotAuthenticatedError) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    if (error instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: "Empresa no configurada" }, { status: 403 })
    return NextResponse.json({ error: "Error al eliminar producto", detalle: describeError(error) }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getEmpresaId, UserNotAuthenticatedError, EmpresaNotConfiguredError } from "@/lib/supabase/empresa"
import { describeError } from "@/lib/api-error"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: compraId } = await params
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const admin = createAdminClient()

    const { data: detalles, error } = await admin
      .from("compra_detalle")
      .select(
        "id, id_producto, cantidad, precio_unitario, subtotal, producto(id, nombre, sku)"
      )
      .eq("id_compra", compraId)

    if (error) throw error

    return NextResponse.json({ detalles: detalles || [] })
  } catch (error) {
    console.error("[compra detalle GET]", error)
    if (error instanceof UserNotAuthenticatedError) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    if (error instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: "Empresa no configurada" }, { status: 403 })
    return NextResponse.json({ error: "Error al obtener detalles", detalle: describeError(error) }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: compraId } = await params
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const admin = createAdminClient()

    const body = await request.json()
    const { id_producto, cantidad, precio_unitario } = body

    if (!id_producto || !cantidad || !precio_unitario) {
      return NextResponse.json(
        { error: "Producto, cantidad y precio son requeridos" },
        { status: 400 }
      )
    }

    // Validar que la compra existe y pertenece a la empresa
    const { data: compra, error: compraError } = await admin
      .from("compra")
      .select("id, estado")
      .eq("id", compraId)
      .eq("id_empresa", empresaId)
      .single()

    if (compraError || !compra) {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 })
    }

    // No permitir agregar detalles si la compra ya fue recibida
    if ((compra.estado as string) === "recibida") {
      return NextResponse.json(
        { error: "No se pueden agregar productos a una compra recibida" },
        { status: 400 }
      )
    }

    // Validar que el producto existe y pertenece a la empresa
    const { data: producto } = await admin
      .from("producto")
      .select("id")
      .eq("id", id_producto)
      .eq("id_empresa", empresaId)
      .single()

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // subtotal is a generated column (cantidad * precio_unitario) — do not insert it
    const { data: detalle, error: detalleError } = await admin
      .from("compra_detalle")
      .insert({
        id_compra: compraId,
        id_producto,
        cantidad: parseInt(cantidad),
        precio_unitario: parseFloat(precio_unitario),
      })
      .select("id, id_producto, cantidad, precio_unitario, subtotal")
      .single()

    if (detalleError) throw detalleError

    // Recalcular y actualizar totales de la compra
    const { data: todosDetalles } = await admin
      .from("compra_detalle")
      .select("subtotal")
      .eq("id_compra", compraId)

    const nuevoSubtotal = (todosDetalles || []).reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0)

    await admin
      .from("compra")
      .update({ subtotal: nuevoSubtotal, monto_total: nuevoSubtotal })
      .eq("id", compraId)

    return NextResponse.json({ detalle })
  } catch (error) {
    console.error("[compra detalle POST]", error)
    if (error instanceof UserNotAuthenticatedError) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    if (error instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: "Empresa no configurada" }, { status: 403 })
    return NextResponse.json({ error: "Error al agregar producto", detalle: describeError(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: compraId } = await params
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const admin = createAdminClient()
    const { searchParams } = new URL(request.url)
    const detalleId = searchParams.get("detalleId") || ""

    const { data: compra, error: compraError } = await admin
      .from("compra")
      .select("id, estado")
      .eq("id", compraId)
      .eq("id_empresa", empresaId)
      .single()

    if (compraError || !compra) {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 })
    }

    if ((compra.estado as string) === "recibida") {
      return NextResponse.json(
        { error: "No se pueden eliminar productos de una compra recibida" },
        { status: 400 }
      )
    }

    const { error: deleteError } = await admin
      .from("compra_detalle")
      .delete()
      .eq("id", detalleId)
      .eq("id_compra", compraId)

    if (deleteError) throw deleteError

    const { data: todosDetalles } = await admin
      .from("compra_detalle")
      .select("subtotal")
      .eq("id_compra", compraId)

    const nuevoSubtotal = (todosDetalles || []).reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0)

    await admin
      .from("compra")
      .update({ subtotal: nuevoSubtotal, monto_total: nuevoSubtotal })
      .eq("id", compraId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[compra detalle DELETE]", error)
    if (error instanceof UserNotAuthenticatedError) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    if (error instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: "Empresa no configurada" }, { status: 403 })
    return NextResponse.json({ error: "Error al eliminar producto", detalle: describeError(error) }, { status: 500 })
  }
}

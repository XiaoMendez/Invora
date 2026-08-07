import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: compraId } = await params
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { data: detalles, error } = await supabase
      .from("compra_detalle")
      .select(
        "id, id_producto, cantidad, precio_unitario, subtotal, producto(id, nombre, sku)"
      )
      .eq("id_compra", compraId)

    if (error) throw error

    return NextResponse.json({ detalles: detalles || [] })
  } catch (error) {
    console.error("[compra detalle GET]", error)
    return NextResponse.json({ error: "Error al obtener detalles" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: compraId } = await params
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const body = await request.json()
    const { id_producto, cantidad, precio_unitario } = body

    if (!id_producto || !cantidad || !precio_unitario) {
      return NextResponse.json(
        { error: "Producto, cantidad y precio son requeridos" },
        { status: 400 }
      )
    }

    // Validar que la compra existe
    const { data: compra, error: compraError } = await supabase
      .from("compra")
      .select("id, estado")
      .eq("id", compraId)
      .eq("id_empresa", empresaId)
      .single()

    if (compraError || !compra) {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 })
    }

    // No permitir agregar detalles si la compra ya fue recibida
    if (compra.estado === "recibida") {
      return NextResponse.json(
        { error: "No se pueden agregar productos a una compra recibida" },
        { status: 400 }
      )
    }

    // Validar que el producto existe
    const { data: producto } = await supabase
      .from("producto")
      .select("id")
      .eq("id", id_producto)
      .eq("id_empresa", empresaId)
      .single()

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // subtotal is a generated column (cantidad * precio_unitario) — do not insert it
    const { data: detalle, error: detalleError } = await supabase
      .from("compra_detalle")
      .insert({
        id_compra: compraId,
        id_producto,
        cantidad,
        precio_unitario,
      })
      .select("id, id_producto, cantidad, precio_unitario, subtotal")
      .single()

    if (detalleError) throw detalleError

    // Actualizar totales de la compra
    const { data: detalles } = await supabase
      .from("compra_detalle")
      .select("subtotal")
      .eq("id_compra", compraId)

    const nuevoSubtotal = (detalles || []).reduce((sum, d) => sum + (d.subtotal || 0), 0)

    await supabase
      .from("compra")
      .update({
        subtotal: nuevoSubtotal,
        monto_total: nuevoSubtotal, // Sin impuesto por ahora
      })
      .eq("id", compraId)

    return NextResponse.json({ detalle })
  } catch (error) {
    console.error("[compra detalle POST]", error)
    return NextResponse.json({ error: "Error al agregar producto" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: compraId } = await params
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const { searchParams } = new URL(request.url)
    const detalleId = searchParams.get("detalleId") || ""

    // Validar que la compra existe y pertenece a la empresa
    const { data: compra, error: compraError } = await supabase
      .from("compra")
      .select("id, estado")
      .eq("id", compraId)
      .eq("id_empresa", empresaId)
      .single()

    if (compraError || !compra) {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 })
    }

    // No permitir eliminar detalles si la compra ya fue recibida
    if (compra.estado === "recibida") {
      return NextResponse.json(
        { error: "No se pueden eliminar productos de una compra recibida" },
        { status: 400 }
      )
    }

    // Eliminar detalle
    const { error: deleteError } = await supabase
      .from("compra_detalle")
      .delete()
      .eq("id", detalleId)
      .eq("id_compra", compraId)

    if (deleteError) throw deleteError

    // Actualizar totales de la compra
    const { data: detalles } = await supabase
      .from("compra_detalle")
      .select("subtotal")
      .eq("id_compra", compraId)

    const nuevoSubtotal = (detalles || []).reduce((sum, d) => sum + (d.subtotal || 0), 0)

    await supabase
      .from("compra")
      .update({
        subtotal: nuevoSubtotal,
        monto_total: nuevoSubtotal,
      })
      .eq("id", compraId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[compra detalle DELETE]", error)
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}

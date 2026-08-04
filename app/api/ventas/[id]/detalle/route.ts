import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const ventaId = params.id

    const body = await request.json()
    const { id_producto, cantidad, precio_unitario, descuento = 0 } = body

    if (!id_producto || !cantidad || !precio_unitario) {
      return NextResponse.json(
        { error: "Producto, cantidad y precio son requeridos" },
        { status: 400 }
      )
    }

    // Validar que la venta existe
    const { data: venta, error: ventaError } = await supabase
      .from("venta")
      .select("id, estado")
      .eq("id", ventaId)
      .eq("id_empresa", empresaId)
      .single()

    if (ventaError || !venta) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    // No permitir agregar detalles si la venta ya fue completada
    if (venta.estado === "completada") {
      return NextResponse.json(
        { error: "No se pueden agregar productos a una venta completada" },
        { status: 400 }
      )
    }

    // Validar que el producto existe y obtener stock
    const { data: producto } = await supabase
      .from("producto")
      .select("id, stock")
      .eq("id", id_producto)
      .eq("id_empresa", empresaId)
      .single()

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Validar stock disponible
    if (cantidad > producto.stock) {
      return NextResponse.json(
        {
          error: `Stock insuficiente. Disponible: ${producto.stock}, Solicitado: ${cantidad}`,
        },
        { status: 400 }
      )
    }

    const subtotal = cantidad * precio_unitario - descuento

    // Crear detalle
    const { data: detalle, error: detalleError } = await supabase
      .from("venta_detalle")
      .insert({
        id_venta: ventaId,
        id_producto,
        cantidad,
        precio_unitario,
        descuento,
        subtotal,
      })
      .select("id, id_producto, cantidad, precio_unitario, descuento, subtotal")
      .single()

    if (detalleError) throw detalleError

    // Actualizar totales de la venta
    const { data: detalles } = await supabase
      .from("venta_detalle")
      .select("subtotal")
      .eq("id_venta", ventaId)

    const nuevoSubtotal = (detalles || []).reduce((sum, d) => sum + (d.subtotal || 0), 0)

    await supabase
      .from("venta")
      .update({
        subtotal: nuevoSubtotal,
        monto_total: nuevoSubtotal,
      })
      .eq("id", ventaId)

    return NextResponse.json({ detalle })
  } catch (error) {
    console.error("[venta detalle POST]", error)
    return NextResponse.json({ error: "Error al agregar producto" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string; detalleId: string } }) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const ventaId = params.id
    const detalleId = params.detalleId

    // Validar que la venta existe y pertenece a la empresa
    const { data: venta, error: ventaError } = await supabase
      .from("venta")
      .select("id, estado")
      .eq("id", ventaId)
      .eq("id_empresa", empresaId)
      .single()

    if (ventaError || !venta) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    // No permitir eliminar detalles si la venta ya fue completada
    if (venta.estado === "completada") {
      return NextResponse.json(
        { error: "No se pueden eliminar productos de una venta completada" },
        { status: 400 }
      )
    }

    // Eliminar detalle
    const { error: deleteError } = await supabase
      .from("venta_detalle")
      .delete()
      .eq("id", detalleId)
      .eq("id_venta", ventaId)

    if (deleteError) throw deleteError

    // Actualizar totales de la venta
    const { data: detalles } = await supabase
      .from("venta_detalle")
      .select("subtotal")
      .eq("id_venta", ventaId)

    const nuevoSubtotal = (detalles || []).reduce((sum, d) => sum + (d.subtotal || 0), 0)

    await supabase
      .from("venta")
      .update({
        subtotal: nuevoSubtotal,
        monto_total: nuevoSubtotal,
      })
      .eq("id", ventaId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[venta detalle DELETE]", error)
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}

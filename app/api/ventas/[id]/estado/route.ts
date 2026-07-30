import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const ventaId = params.id

    const body = await request.json()
    const { estado } = body

    if (!estado) {
      return NextResponse.json({ error: "Estado es requerido" }, { status: 400 })
    }

    const estadosValidos = ["pendiente", "completada", "cancelada", "anulada"]
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    // Obtener la venta
    const { data: venta, error: ventaError } = await supabase
      .from("venta")
      .select("id, estado, venta_detalle(id)")
      .eq("id", ventaId)
      .eq("id_empresa", empresaId)
      .single()

    if (ventaError || !venta) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    // Validar que hay detalles si se intenta cambiar a completada
    if (estado === "completada" && (!venta.venta_detalle || venta.venta_detalle.length === 0)) {
      return NextResponse.json(
        { error: "No se puede completar una venta sin productos" },
        { status: 400 }
      )
    }

    // Actualizar estado
    const { data: updated, error: updateError } = await supabase
      .from("venta")
      .update({ estado, actualizado_en: new Date().toISOString() })
      .eq("id", ventaId)
      .eq("id_empresa", empresaId)
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
        venta_detalle(id, id_producto, cantidad, precio_unitario, descuento, subtotal, producto(nombre, sku, stock))
      `
      )
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ venta: updated })
  } catch (error) {
    console.error("[ventas PUT estado]", error)
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 })
  }
}

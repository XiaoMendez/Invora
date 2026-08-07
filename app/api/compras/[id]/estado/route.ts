import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getEmpresaId } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: compraId } = await params
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const admin = createAdminClient()

    const body = await request.json()
    const { estado } = body

    if (!estado) {
      return NextResponse.json({ error: "Estado es requerido" }, { status: 400 })
    }

    const estadosValidos = ["pendiente", "recibida", "cancelada"]
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    // Obtener la compra via admin to avoid enum cast issues with anon role
    const { data: compra, error: compraError } = await admin
      .from("compra")
      .select("id, estado, compra_detalle(id)")
      .eq("id", compraId)
      .eq("id_empresa", empresaId)
      .single()

    if (compraError || !compra) {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 })
    }

    if (estado === "recibida" && (!compra.compra_detalle || compra.compra_detalle.length === 0)) {
      return NextResponse.json({ error: "No se puede recibir una compra sin productos" }, { status: 400 })
    }

    const { data: updated, error: updateError } = await admin
      .from("compra")
      .update({ estado, actualizado_en: new Date().toISOString() })
      .eq("id", compraId)
      .eq("id_empresa", empresaId)
      .select(`
        id, numero, estado, subtotal, impuesto, monto_total, metodo_pago, creado_en,
        proveedor(id, nombre),
        compra_detalle(id, id_producto, cantidad, precio_unitario, subtotal, producto(nombre, sku, stock))
      `)
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ compra: updated })
  } catch (error) {
    console.error("[compras PUT estado]", error)
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 })
  }
}

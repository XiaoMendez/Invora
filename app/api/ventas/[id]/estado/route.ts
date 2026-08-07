import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getEmpresaId, UserNotAuthenticatedError, EmpresaNotConfiguredError } from "@/lib/supabase/empresa"
import { sendLowStockEmail } from "@/app/api/alertas/route"

export const dynamic = "force-dynamic"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: ventaId } = await params
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const admin = createAdminClient()

    const body = await request.json()
    const { estado } = body

    if (!estado) {
      return NextResponse.json({ error: "Estado es requerido" }, { status: 400 })
    }

    const estadosValidos = ["pendiente", "completada", "cancelada", "anulada"]
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    // Use admin client to avoid enum cast issues with anon role
    const { data: venta, error: ventaError } = await admin
      .from("venta")
      .select("id, estado, venta_detalle(id)")
      .eq("id", ventaId)
      .eq("id_empresa", empresaId)
      .single()

    if (ventaError || !venta) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    if (estado === "completada" && (!venta.venta_detalle || venta.venta_detalle.length === 0)) {
      return NextResponse.json(
        { error: "No se puede completar una venta sin productos" },
        { status: 400 }
      )
    }

    const { data: updated, error: updateError } = await admin
      .from("venta")
      .update({ estado, actualizado_en: new Date().toISOString() })
      .eq("id", ventaId)
      .eq("id_empresa", empresaId)
      .select(`
        id, numero, estado, subtotal, descuento, impuesto, monto_total, metodo_pago, creado_en,
        cliente(id, nombre),
        venta_detalle(id, id_producto, cantidad, precio_unitario, descuento, subtotal, producto(nombre, sku, stock))
      `)
      .single()

    if (updateError) throw updateError

    // When a venta is completed, deduct stock and check low-stock alerts
    if (estado === "completada" && updated?.venta_detalle?.length) {
      try {
        for (const detalle of updated.venta_detalle as Array<{ id_producto: string; cantidad: number; producto: { stock: number } | null }>) {
          const stockActual = detalle.producto?.stock || 0
          await admin
            .from("producto")
            .update({ stock: Math.max(0, stockActual - detalle.cantidad) })
            .eq("id", detalle.id_producto)
            .eq("id_empresa", empresaId)
        }

        // Fire low-stock alert if any product is now below minimum
        const { data: empresa } = await admin.from("empresa").select("nombre, email").eq("id", empresaId).single()
        if (empresa?.email) {
          const { data: allProductos } = await admin
            .from("producto")
            .select("nombre, sku, stock, stock_minimo, categoria(nombre)")
            .eq("id_empresa", empresaId)
            .eq("activo", true)
            .gt("stock_minimo", 0)

          const bajosStock = (allProductos || []).filter((p) => p.stock <= p.stock_minimo)
          if (bajosStock.length > 0) {
            sendLowStockEmail(empresa.nombre || "Tu empresa", empresa.email, bajosStock).catch(
              (err) => console.error("[ventas estado] auto-alert error:", err)
            )
          }
        }
      } catch (stockErr) {
        console.error("[ventas estado] stock deduction error:", stockErr)
      }
    }

    return NextResponse.json({ venta: updated })
  } catch (error) {
    console.error("[ventas PUT estado]", error)
    if (error instanceof UserNotAuthenticatedError) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    if (error instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: "Empresa no configurada" }, { status: 403 })
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 })
  }
}

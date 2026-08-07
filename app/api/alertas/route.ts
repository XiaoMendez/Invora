import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getEmpresaId, UserNotAuthenticatedError, EmpresaNotConfiguredError } from "@/lib/supabase/empresa"
import { getLowStockProductos, sendLowStockEmail } from "@/lib/alertas"
import { describeError } from "@/lib/api-error"

export const dynamic = "force-dynamic"

// ─── Shared helpers ──────────────────────────────────────────────────────────

// helpers moved to lib/alertas.ts

// ─── GET /api/alertas ─────────────────────────────────────────────────────────

export async function GET() {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const admin = createAdminClient()

    const { data: empresa } = await admin
      .from("empresa")
      .select("nombre, email")
      .eq("id", empresaId)
      .single()

    const bajosStock = await getLowStockProductos(admin, empresaId)

    const alertas = bajosStock.map((p) => ({
      id: `alert-${p.id}`,
      tipo: p.stock === 0 ? "critical" : "warning",
      titulo: p.stock === 0 ? "Stock agotado" : "Stock bajo",
      descripcion:
        p.stock === 0
          ? "El producto ha llegado a 0. Se requiere reabastecimiento urgente."
          : `Stock actual ${p.stock} por debajo del mínimo (${p.stock_minimo}). Faltan ${p.stock_minimo - p.stock} unidades.`,
      producto: p.nombre,
      sku: p.sku,
      stock: p.stock,
      stock_minimo: p.stock_minimo,
      faltante: p.stock_minimo - p.stock,
      categoria: (p.categoria as { nombre: string } | null)?.nombre || null,
      leida: false,
      fecha: new Date().toISOString(),
    }))

    return NextResponse.json({
      alertas,
      total: alertas.length,
      criticas: alertas.filter((a) => a.tipo === "critical").length,
      advertencias: alertas.filter((a) => a.tipo === "warning").length,
      empresa: empresa?.nombre || "",
      email: empresa?.email || "",
    })
  } catch (error) {
    console.error("[alertas GET]", error)
    if (error instanceof UserNotAuthenticatedError)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    if (error instanceof EmpresaNotConfiguredError)
      return NextResponse.json({ error: "Empresa no configurada" }, { status: 403 })
    return NextResponse.json({ error: "Error al cargar alertas", detalle: describeError(error) }, { status: 500 })
  }
}

// ─── POST /api/alertas ────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const admin = createAdminClient()

    const body = await request.json()
    if (body.action !== "send_email_alerts") {
      return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 })
    }

    const { data: empresa } = await admin
      .from("empresa")
      .select("nombre, email")
      .eq("id", empresaId)
      .single()

    const emailDestino = empresa?.email
    if (!emailDestino) {
      return NextResponse.json(
        { error: "La empresa no tiene email configurado. Actualízalo en Configuración." },
        { status: 400 }
      )
    }

    const bajosStock = await getLowStockProductos(admin, empresaId)

    if (bajosStock.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay productos con stock bajo. No se envió ningún correo.",
      })
    }

    const result = await sendLowStockEmail(empresa?.nombre || "Tu empresa", emailDestino, bajosStock)

    if (result.error) {
      return NextResponse.json({ error: "Error al enviar email. Verifica RESEND_API_KEY.", detalle: describeError(result.error) }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      emailTo: emailDestino,
      productosAlertados: bajosStock.length,
      message: `Alertas enviadas a ${emailDestino} (${bajosStock.length} producto${bajosStock.length !== 1 ? "s" : ""})`,
    })
  } catch (error) {
    console.error("[alertas POST]", error)
    if (error instanceof UserNotAuthenticatedError)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    if (error instanceof EmpresaNotConfiguredError)
      return NextResponse.json({ error: "Empresa no configurada" }, { status: 403 })
    const msg = error instanceof Error ? error.message : "Error al enviar alertas"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

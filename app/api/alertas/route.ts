import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { data: empresa } = await supabase
      .from("empresa")
      .select("nombre, email")
      .eq("id", empresaId)
      .single()

    // Get products with low stock
    const { data: productos, error } = await supabase
      .from("producto")
      .select("id, nombre, sku, stock, stock_minimo, id_categoria, categoria(nombre)")
      .eq("id_empresa", empresaId)
      .eq("activo", true)
      .gt("stock_minimo", 0)

    if (error) throw error

    const bajosStock = (productos || []).filter(p => p.stock <= p.stock_minimo)

    const alertas = bajosStock.map((p) => ({
      id: `alert-${p.id}`,
      tipo: p.stock === 0 ? "critical" : "warning",
      titulo: p.stock === 0 ? "Stock agotado" : "Stock bajo",
      descripcion: p.stock === 0
        ? "El producto ha llegado a 0. Se requiere reabastecimiento urgente."
        : `Stock actual ${p.stock} por debajo del minimo (${p.stock_minimo}). Faltan ${p.stock_minimo - p.stock} unidades.`,
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
      email: empresa?.email || user.email || "",
    })
  } catch (error) {
    console.error("[alertas GET]", error)
    return NextResponse.json({ error: "Error al cargar alertas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    if (body.action !== "send_email_alerts") {
      return NextResponse.json({ error: "Accion no reconocida" }, { status: 400 })
    }

    const { data: empresa } = await supabase
      .from("empresa")
      .select("nombre, email")
      .eq("id", user.id)
      .single()

    const emailDestino = empresa?.email || user.email
    if (!emailDestino) {
      return NextResponse.json({ error: "No hay email configurado" }, { status: 400 })
    }

    // Get products with low stock
    const { data: productos } = await supabase
      .from("producto")
      .select("nombre, sku, stock, stock_minimo, categoria(nombre)")
      .eq("id_empresa", user.id)
      .eq("activo", true)
      .gt("stock_minimo", 0)

    const bajosStock = (productos || []).filter(p => p.stock <= p.stock_minimo)

    if (bajosStock.length === 0) {
      return NextResponse.json({ success: true, message: "No hay alertas de stock que enviar" })
    }

    // Check if Resend is available
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      return NextResponse.json({
        success: false,
        message: "Configura RESEND_API_KEY en las variables de entorno para enviar emails",
        alertas: bajosStock.length,
      })
    }

    // Send email using Resend
    const empresaNombre = empresa?.nombre || "Tu empresa"
    const html = buildEmailHTML(empresaNombre, bajosStock.map(p => ({
      producto: p.nombre,
      sku: p.sku,
      stock: p.stock,
      stock_minimo: p.stock_minimo,
      faltante: p.stock_minimo - p.stock,
      categoria: (p.categoria as { nombre: string } | null)?.nombre || null,
    })))

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `Invora <onboarding@resend.dev>`,
        to: emailDestino,
        subject: `Alerta: ${bajosStock.length} producto${bajosStock.length !== 1 ? "s" : ""} con stock bajo`,
        html,
      }),
    })

    if (!response.ok) {
      throw new Error("Error al enviar email")
    }

    return NextResponse.json({
      success: true,
      emailTo: emailDestino,
      productosAlertados: bajosStock.length,
      message: `Alertas enviadas exitosamente a ${emailDestino}`,
    })
  } catch (error) {
    console.error("[alertas POST]", error)
    const msg = error instanceof Error ? error.message : "Error al enviar alertas"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

function buildEmailHTML(
  empresaNombre: string,
  productos: Array<{ producto: string; sku: string | null; stock: number; stock_minimo: number; faltante: number; categoria: string | null }>
) {
  const rows = productos.map((p) => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:10px 8px;font-weight:500;color:#111827;">${p.producto}</td>
      <td style="padding:10px 8px;color:#6b7280;">${p.sku || "—"}</td>
      <td style="padding:10px 8px;color:#6b7280;">${p.categoria || "—"}</td>
      <td style="padding:10px 8px;text-align:center;font-weight:700;color:${p.stock === 0 ? "#dc2626" : "#d97706"};">${p.stock}</td>
      <td style="padding:10px 8px;text-align:center;color:#6b7280;">${p.stock_minimo}</td>
      <td style="padding:10px 8px;text-align:center;font-weight:700;color:#dc2626;">-${p.faltante}</td>
    </tr>`).join("")

  const criticos = productos.filter((p) => p.stock === 0).length
  const bajos = productos.filter((p) => p.stock > 0).length

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:32px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:660px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);border-radius:12px 12px 0 0;padding:28px 32px;">
      <h1 style="margin:0;color:white;font-size:20px;font-weight:700;">Alerta de Stock — Invora</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">${empresaNombre} · ${new Date().toLocaleDateString("es-CR", { dateStyle: "full" })}</p>
    </div>
    <div style="background:white;padding:24px 32px;">
      <p style="margin:0 0 16px;color:#374151;font-size:15px;">
        Se detectaron <strong>${productos.length} producto${productos.length !== 1 ? "s" : ""}</strong> que requieren atencion:
        ${criticos > 0 ? `<span style="color:#dc2626;"> ${criticos} agotado${criticos !== 1 ? "s" : ""}</span>` : ""}
        ${criticos > 0 && bajos > 0 ? " y" : ""}
        ${bajos > 0 ? `<span style="color:#d97706;"> ${bajos} con stock bajo</span>` : ""}
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
            <th style="padding:10px 8px;text-align:left;color:#374151;font-weight:600;">Producto</th>
            <th style="padding:10px 8px;text-align:left;color:#374151;font-weight:600;">SKU</th>
            <th style="padding:10px 8px;text-align:left;color:#374151;font-weight:600;">Categoria</th>
            <th style="padding:10px 8px;text-align:center;color:#374151;font-weight:600;">Stock</th>
            <th style="padding:10px 8px;text-align:center;color:#374151;font-weight:600;">Minimo</th>
            <th style="padding:10px 8px;text-align:center;color:#374151;font-weight:600;">Faltante</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="background:#f9fafb;border-radius:0 0 12px 12px;padding:16px 32px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
        Este correo fue generado automaticamente por <strong>Invora</strong> · Sistema de Gestion de Inventario
      </p>
    </div>
  </div>
</body></html>`
}

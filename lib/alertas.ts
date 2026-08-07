import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function getLowStockProductos(admin: any, empresaId: string) {
  const { data: productos, error } = await admin
    .from("producto")
    .select("id, nombre, sku, stock, stock_minimo, id_categoria, categoria(nombre)")
    .eq("id_empresa", empresaId)
    .eq("activo", true)
    .gt("stock_minimo", 0)

  if (error) throw error
  return (productos || []).filter((p: any) => p.stock <= p.stock_minimo)
}

export async function sendLowStockEmail(
  empresaNombre: string,
  emailDestino: string,
  bajosStock: Array<{ nombre: string; sku: string | null; stock: number; stock_minimo: number; categoria: { nombre: string } | null }>
) {
  if (!process.env.RESEND_API_KEY) {
    console.error("[alertas] RESEND_API_KEY not set")
    return { error: "RESEND_API_KEY not configured" }
  }

  const criticos = bajosStock.filter((p) => p.stock === 0).length
  const bajos = bajosStock.filter((p) => p.stock > 0 && p.stock <= p.stock_minimo).length

  const rows = bajosStock
    .map(
      (p) => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:10px 8px;font-weight:500;color:#111827;">${p.nombre}</td>
      <td style="padding:10px 8px;color:#6b7280;">${p.sku || "—"}</td>
      <td style="padding:10px 8px;color:#6b7280;">${(p.categoria as { nombre: string } | null)?.nombre || "—"}</td>
      <td style="padding:10px 8px;text-align:center;font-weight:700;color:${p.stock === 0 ? "#dc2626" : "#d97706"};">${p.stock}</td>
      <td style="padding:10px 8px;text-align:center;color:#6b7280;">${p.stock_minimo}</td>
      <td style="padding:10px 8px;text-align:center;font-weight:700;color:#dc2626;">-${p.stock_minimo - p.stock}</td>
    </tr>`
    )
    .join("")

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:32px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:660px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);border-radius:12px 12px 0 0;padding:28px 32px;">
      <h1 style="margin:0;color:white;font-size:20px;font-weight:700;">Alerta de Stock — Invora</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${empresaNombre} · ${new Date().toLocaleDateString("es-CR", { dateStyle: "long" })}</p>
    </div>
    <div style="background:white;padding:24px 32px;">
      <p style="margin:0 0 16px;color:#374151;font-size:15px;">
        Se detectaron <strong>${bajosStock.length} producto${bajosStock.length !== 1 ? "s" : ""}</strong> que requieren atención:
        ${criticos > 0 ? `<span style="color:#dc2626;font-weight:600;"> ${criticos} agotado${criticos !== 1 ? "s" : ""}</span>` : ""}
        ${criticos > 0 && bajos > 0 ? " y" : ""}
        ${bajos > 0 ? `<span style="color:#d97706;font-weight:600;"> ${bajos} con stock bajo</span>` : ""}
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
            <th style="padding:10px 8px;text-align:left;color:#374151;font-weight:600;">Producto</th>
            <th style="padding:10px 8px;text-align:left;color:#374151;font-weight:600;">SKU</th>
            <th style="padding:10px 8px;text-align:left;color:#374151;font-weight:600;">Categoría</th>
            <th style="padding:10px 8px;text-align:center;color:#374151;font-weight:600;">Stock</th>
            <th style="padding:10px 8px;text-align:center;color:#374151,font-weight:600;">Mínimo</th>
            <th style="padding:10px 8px;text-align:center;color:#374151,font-weight:600;">Faltante</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="background:#f9fafb;border-radius:0 0 12px 12px;padding:16px 32px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
        Alerta automática generada por <strong>Invora</strong> · Sistema de Gestión de Inventario
      </p>
    </div>
  </div>
</body></html>`

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "INVORA Alertas <alertas@invorastock.com>",
      to: [emailDestino],
      subject: `Alerta: ${bajosStock.length} producto${bajosStock.length !== 1 ? "s" : ""} con stock bajo — ${empresaNombre}`,
      html,
    })

    if (error) {
      console.error("[alertas] Resend error:", error)
      return { error }
    }

    return { data }
  } catch (err) {
    console.error("[alertas] Resend error:", err)
    return { error: err }
  }
}

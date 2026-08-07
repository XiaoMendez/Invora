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

  // Cada producto es una "fila" hecha con una tabla de 100% de ancho (compatible
  // con la mayoría de clientes de correo) en vez de columnas fijas en px, así el
  // contenido se acomoda igual de bien en celular que en computadora, y nada
  // se corta lateralmente.
  const rows = bajosStock
    .map((p) => {
      const faltante = p.stock_minimo - p.stock
      const critico = p.stock === 0
      const categoria = (p.categoria as { nombre: string } | null)?.nombre || "—"
      return `
    <tr>
      <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td style="vertical-align:top;">
              <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${p.nombre}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">
                SKU: ${p.sku || "—"} &nbsp;·&nbsp; ${categoria}
              </p>
            </td>
            <td style="vertical-align:top;text-align:right;white-space:nowrap;padding-left:12px;">
              <span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background:${critico ? "#fee2e2" : "#fef3c7"};color:${critico ? "#dc2626" : "#d97706"};">
                ${p.stock} / ${p.stock_minimo} min.
              </span>
              <p style="margin:4px 0 0;font-size:11px;color:#dc2626;font-weight:600;">Faltan ${faltante}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    })
    .join("")

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">
    <tr>
      <td style="padding:16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);padding:24px 20px;">
              <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">Alerta de Stock — Invora</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">${empresaNombre} · ${new Date().toLocaleDateString("es-CR", { dateStyle: "long" })}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 20px 8px;">
              <p style="margin:0;color:#374151;font-size:14px;line-height:1.5;">
                Se detectaron <strong>${bajosStock.length} producto${bajosStock.length !== 1 ? "s" : ""}</strong> que requieren atención:
                ${criticos > 0 ? `<span style="color:#dc2626;font-weight:600;"> ${criticos} agotado${criticos !== 1 ? "s" : ""}</span>` : ""}
                ${criticos > 0 && bajos > 0 ? " y" : ""}
                ${bajos > 0 ? `<span style="color:#d97706;font-weight:600;"> ${bajos} con stock bajo</span>` : ""}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 4px 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${rows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:16px 20px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
                Alerta automática generada por <strong>Invora</strong> · Sistema de Gestión de Inventario
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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

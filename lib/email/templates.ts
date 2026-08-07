// Email templates for Invora notifications

export interface LowStockProduct {
  nombre: string
  sku: string | null
  stock: number
  stock_minimo: number
}

export function lowStockEmailHtml(
  empresaNombre: string,
  productos: LowStockProduct[]
): string {
  const rows = productos
    .map(
      (p) => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:12px 16px;font-size:14px;color:#111827;">${p.nombre}</td>
      <td style="padding:12px 16px;font-size:14px;color:#6b7280;">${p.sku ?? "—"}</td>
      <td style="padding:12px 16px;font-size:14px;text-align:center;font-weight:600;color:${p.stock === 0 ? "#dc2626" : "#d97706"};">${p.stock}</td>
      <td style="padding:12px 16px;font-size:14px;text-align:center;color:#6b7280;">${p.stock_minimo}</td>
      <td style="padding:12px 16px;font-size:14px;text-align:center;">
        <span style="background:${p.stock === 0 ? "#fee2e2" : "#fef3c7"};color:${p.stock === 0 ? "#dc2626" : "#d97706"};padding:2px 8px;border-radius:9999px;font-size:12px;font-weight:600;">
          ${p.stock === 0 ? "Agotado" : "Stock Bajo"}
        </span>
      </td>
    </tr>`
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:640px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);padding:32px 40px;">
      <p style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.5px;">INVORA</p>
      <p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">Sistema de Gestión de Inventario</p>
    </div>

    <!-- Alert banner -->
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px 40px;">
      <p style="margin:0;font-size:14px;font-weight:600;color:#92400e;">Alerta de Inventario — ${empresaNombre}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#b45309;">
        ${productos.length} producto${productos.length !== 1 ? "s" : ""} requieren atención inmediata.
      </p>
    </div>

    <!-- Content -->
    <div style="padding:32px 40px;">
      <p style="margin:0 0 20px;font-size:15px;color:#374151;">
        Los siguientes productos han alcanzado o superado su nivel mínimo de stock:
      </p>

      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Producto</th>
            <th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">SKU</th>
            <th style="padding:10px 16px;text-align:center;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Stock</th>
            <th style="padding:10px 16px;text-align:center;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Mínimo</th>
            <th style="padding:10px 16px;text-align:center;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Estado</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">
        Ingresa a tu panel de Invora para registrar nuevas compras o ajustar tu inventario.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
        © 2026 INVORA · Todos los derechos reservados · Este correo fue generado automáticamente.
      </p>
    </div>
  </div>
</body>
</html>`
}

export function lowStockEmailText(
  empresaNombre: string,
  productos: LowStockProduct[]
): string {
  const lines = productos
    .map(
      (p) =>
        `- ${p.nombre}${p.sku ? ` (${p.sku})` : ""}: stock ${p.stock} / mínimo ${p.stock_minimo} [${p.stock === 0 ? "AGOTADO" : "STOCK BAJO"}]`
    )
    .join("\n")

  return `INVORA — Alerta de Inventario: ${empresaNombre}

${productos.length} producto(s) requieren atención:

${lines}

Ingresa a tu panel para tomar acción.`
}

export function restockSuggestionHtml(
  empresaNombre: string,
  productos: LowStockProduct[]
): string {
  const rows = productos
    .map((p) => {
      const suggested = Math.max(p.stock_minimo * 3 - p.stock, p.stock_minimo * 2)
      return `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:12px 16px;font-size:14px;color:#111827;">${p.nombre}</td>
      <td style="padding:12px 16px;font-size:14px;text-align:center;color:#dc2626;font-weight:600;">${p.stock}</td>
      <td style="padding:12px 16px;font-size:14px;text-align:center;color:#6b7280;">${p.stock_minimo}</td>
      <td style="padding:12px 16px;font-size:14px;text-align:center;font-weight:700;color:#059669;">${suggested}</td>
    </tr>`
    })
    .join("")

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:640px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
    <div style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);padding:32px 40px;">
      <p style="margin:0;font-size:22px;font-weight:700;color:#fff;">INVORA</p>
      <p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">Sugerencias de Reposición — ${empresaNombre}</p>
    </div>
    <div style="padding:32px 40px;">
      <p style="margin:0 0 20px;font-size:15px;color:#374151;">
        Basado en tu nivel mínimo de stock, te sugerimos reponer los siguientes productos:
      </p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">
        <thead>
          <tr style="background:#f0fdf4;">
            <th style="padding:10px 16px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Producto</th>
            <th style="padding:10px 16px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase;">Stock Actual</th>
            <th style="padding:10px 16px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase;">Mínimo</th>
            <th style="padding:10px 16px;text-align:center;font-size:12px;color:#059669;text-transform:uppercase;font-weight:700;">Sugerido a Pedir</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">© 2026 INVORA · Generado automáticamente.</p>
    </div>
  </div>
</body>
</html>`
}

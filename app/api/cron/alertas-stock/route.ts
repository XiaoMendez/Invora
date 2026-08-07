import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { getLowStockProductos, sendLowStockEmail } from "@/lib/alertas"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * GET /api/cron/alertas-stock
 *
 * Scheduled job (see vercel.json) that automatically emails every empresa
 * with a registered email address when it has products at or below their
 * stock_minimo. This is the piece that makes low-stock alerts genuinely
 * automatic: previously alerts only fired reactively when a venta/compra
 * changed state, or when a user manually pressed "send" — there was no
 * periodic/background check at all.
 *
 * Protected with CRON_SECRET so this can't be triggered by anyone who finds
 * the URL. Vercel Cron sends this automatically as a Bearer token when
 * CRON_SECRET is set in the project's environment variables.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
  }

  const admin = createAdminClient()

  const { data: empresas, error: empresasError } = await admin
    .from("empresa")
    .select("id, nombre, email")

  if (empresasError) {
    console.error("[cron alertas-stock] error listando empresas:", empresasError)
    return NextResponse.json({ error: "Error al listar empresas" }, { status: 500 })
  }

  const resultados: Array<{ empresa: string; enviado: boolean; productos: number; error?: string }> = []

  for (const empresa of empresas || []) {
    if (!empresa.email) {
      resultados.push({ empresa: empresa.nombre, enviado: false, productos: 0, error: "Sin correo configurado" })
      continue
    }

    try {
      const bajosStock = await getLowStockProductos(admin, empresa.id)

      if (bajosStock.length === 0) {
        resultados.push({ empresa: empresa.nombre, enviado: false, productos: 0 })
        continue
      }

      const result = await sendLowStockEmail(empresa.nombre || "Tu empresa", empresa.email, bajosStock)

      if (result.error) {
        resultados.push({
          empresa: empresa.nombre,
          enviado: false,
          productos: bajosStock.length,
          error: "Error al enviar email",
        })
      } else {
        resultados.push({ empresa: empresa.nombre, enviado: true, productos: bajosStock.length })
      }
    } catch (err) {
      console.error(`[cron alertas-stock] error procesando empresa ${empresa.id}:`, err)
      resultados.push({
        empresa: empresa.nombre,
        enviado: false,
        productos: 0,
        error: err instanceof Error ? err.message : "Error desconocido",
      })
    }
  }

  return NextResponse.json({
    ejecutado_en: new Date().toISOString(),
    empresas_revisadas: resultados.length,
    correos_enviados: resultados.filter((r) => r.enviado).length,
    detalle: resultados,
  })
}

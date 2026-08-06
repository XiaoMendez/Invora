import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server"
import { getEmpresaId } from "@/lib/supabase/empresa"
import {
  lowStockEmailHtml,
  lowStockEmailText,
  restockSuggestionHtml,
  type LowStockProduct,
} from "@/lib/email/templates"

export const dynamic = "force-dynamic"

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * GET /api/notificaciones
 * Returns current low-stock and out-of-stock products for the empresa.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const admin = createAdminClient()

    // Fetch all active products then filter in JS (stock <= stock_minimo)
    const { data: allProductos } = await admin
      .from("producto")
      .select("id, nombre, sku, stock, stock_minimo, activo")
      .eq("id_empresa", empresaId)
      .eq("activo", true)

    const alertas = (allProductos || [])
      .filter((p) => p.stock <= p.stock_minimo)
      .map((p) => ({
        id: p.id,
        nombre: p.nombre,
        sku: p.sku,
        stock: p.stock,
        stock_minimo: p.stock_minimo,
        tipo: p.stock === 0 ? "agotado" : "stock_bajo",
        sugerido: Math.max(p.stock_minimo * 3 - p.stock, p.stock_minimo * 2),
      }))

    return NextResponse.json({
      alertas,
      total: alertas.length,
      agotados: alertas.filter((a) => a.tipo === "agotado").length,
      stock_bajo: alertas.filter((a) => a.tipo === "stock_bajo").length,
    })
  } catch (error) {
    console.error("[notificaciones GET]", error)
    return NextResponse.json({ error: "Error al obtener notificaciones" }, { status: 500 })
  }
}

/**
 * POST /api/notificaciones
 * Sends an email notification.
 * Body: { tipo: "low_stock" | "restock_suggestion" | "test" }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const admin = createAdminClient()

    const body = await request.json()
    const { tipo = "low_stock" } = body

    // Get empresa info for email target
    const { data: empresa } = await admin
      .from("empresa")
      .select("nombre, email")
      .eq("id", empresaId)
      .single()

    if (!empresa?.email) {
      return NextResponse.json(
        { error: "La empresa no tiene correo configurado" },
        { status: 400 }
      )
    }

    // Get low stock products
    const { data: allProductos } = await admin
      .from("producto")
      .select("id, nombre, sku, stock, stock_minimo, activo")
      .eq("id_empresa", empresaId)
      .eq("activo", true)

    const lowStockProducts: LowStockProduct[] = (allProductos || [])
      .filter((p) => p.stock <= p.stock_minimo)
      .map((p) => ({
        nombre: p.nombre,
        sku: p.sku,
        stock: p.stock,
        stock_minimo: p.stock_minimo,
      }))

    if (tipo !== "test" && lowStockProducts.length === 0) {
      return NextResponse.json({
        sent: false,
        message: "No hay productos con stock bajo. No se envió correo.",
      })
    }

    let subject: string
    let html: string
    let text: string

    if (tipo === "restock_suggestion") {
      subject = `INVORA — Sugerencias de Reposición: ${empresa.nombre}`
      html = restockSuggestionHtml(empresa.nombre, lowStockProducts)
      text = `Sugerencias de reposición para ${empresa.nombre}: ${lowStockProducts.length} productos.`
    } else if (tipo === "test") {
      subject = `INVORA — Prueba de Notificaciones: ${empresa.nombre}`
      html = lowStockEmailHtml(empresa.nombre, [
        { nombre: "Producto de Prueba", sku: "TEST-001", stock: 2, stock_minimo: 10 },
      ])
      text = "Correo de prueba desde INVORA."
    } else {
      subject = `INVORA — Alerta de Stock: ${lowStockProducts.length} producto(s) requieren atención`
      html = lowStockEmailHtml(empresa.nombre, lowStockProducts)
      text = lowStockEmailText(empresa.nombre, lowStockProducts)
    }

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "INVORA Alertas <alertas@invora.io>",
      to: [empresa.email],
      subject,
      html,
      text,
    })

    if (emailError) {
      console.error("[notificaciones POST] Resend error:", emailError)
      return NextResponse.json(
        { error: "Error al enviar el correo", detail: emailError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sent: true,
      emailId: emailData?.id,
      to: empresa.email,
      productos: lowStockProducts.length,
    })
  } catch (error) {
    console.error("[notificaciones POST]", error)
    return NextResponse.json({ error: "Error al enviar notificación" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getEmpresaId } from "@/lib/supabase/empresa"
import {
  lowStockEmailHtml,
  lowStockEmailText,
  restockSuggestionHtml,
  type LowStockProduct,
} from "@/lib/email/templates"

export const dynamic = "force-dynamic"

/**
 * GET /api/notificaciones
 * Returns current low-stock and out-of-stock products.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const admin = createAdminClient()

    const { data: allProductos, error } = await admin
      .from("producto")
      .select("id, nombre, sku, stock, stock_minimo, activo")
      .eq("id_empresa", empresaId)
      .eq("activo", true)

    if (error) throw error

    const alertas = (allProductos || [])
      .filter((p) => p.stock <= p.stock_minimo)
      .map((p) => ({
        id: p.id,
        nombre: p.nombre,
        sku: p.sku,
        stock: p.stock,
        stock_minimo: p.stock_minimo,
        tipo: p.stock === 0 ? "agotado" : "stock_bajo",
        sugerido: Math.max(
          p.stock_minimo * 3 - p.stock,
          p.stock_minimo * 2
        ),
      }))

    return NextResponse.json({
      alertas,
      total: alertas.length,
      agotados: alertas.filter((a) => a.tipo === "agotado").length,
      stock_bajo: alertas.filter((a) => a.tipo === "stock_bajo").length,
    })
  } catch (error) {
    console.error("[notificaciones GET]", error)

    return NextResponse.json(
      { error: "Error al obtener notificaciones" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notificaciones
 * Body:
 * {
 *   tipo: "low_stock" | "restock_suggestion" | "test"
 * }
 */
export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY no está configurada")

      return NextResponse.json(
        { error: "RESEND_API_KEY no está configurada" },
        { status: 500 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const admin = createAdminClient()

    const body = await request.json()
    const { tipo = "low_stock" } = body

    const { data: empresa, error: empresaError } = await admin
      .from("empresa")
      .select("nombre, email")
      .eq("id", empresaId)
      .single()

    if (empresaError) throw empresaError

    if (!empresa?.email) {
      return NextResponse.json(
        { error: "La empresa no tiene un correo configurado." },
        { status: 400 }
      )
    }

    const { data: allProductos, error: productosError } = await admin
      .from("producto")
      .select("id, nombre, sku, stock, stock_minimo, activo")
      .eq("id_empresa", empresaId)
      .eq("activo", true)

    if (productosError) throw productosError

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
        message: "No hay productos con stock bajo.",
      })
    }

    let subject = ""
    let html = ""
    let text = ""

    switch (tipo) {
      case "restock_suggestion":
        subject = `INVORA — Sugerencias de Reposición: ${empresa.nombre}`
        html = restockSuggestionHtml(
          empresa.nombre,
          lowStockProducts
        )
        text = `Se encontraron ${lowStockProducts.length} productos para reposición.`
        break

      case "test":
        subject = `INVORA — Correo de prueba`

        html = lowStockEmailHtml(empresa.nombre, [
          {
            nombre: "Producto de prueba",
            sku: "TEST-001",
            stock: 2,
            stock_minimo: 10,
          },
        ])

        text = "Correo de prueba enviado correctamente."
        break

      default:
        subject = `INVORA — Alerta de Stock (${lowStockProducts.length})`
        html = lowStockEmailHtml(
          empresa.nombre,
          lowStockProducts
        )
        text = lowStockEmailText(
          empresa.nombre,
          lowStockProducts
        )
    }

    const { data, error } = await resend.emails.send({
      from: "INVORA Alertas <alertas@invorastock.com>",
      to: empresa.email,
      subject,
      html,
      text,
    }) l

    if (error) {
      console.error("[Resend]", error)

      return NextResponse.json(
        {
          error: "No se pudo enviar el correo.",
          detail: error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sent: true,
      emailId: data?.id,
      to: empresa.email,
      productos: lowStockProducts.length,
    })
  } catch (error) {
    console.error("[notificaciones POST]", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error interno del servidor",
      },
      { status: 500 }
    )
  }
}
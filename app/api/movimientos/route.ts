import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId, EmpresaNotConfiguredError, UserNotAuthenticatedError } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get("tipo") || "todos"
    const periodo = searchParams.get("periodo") || "30d"
    const exportCsv = searchParams.get("export") === "csv"

    let fechaDesde: Date | null = null
    const now = new Date()
    if (periodo === "1d") {
      fechaDesde = new Date(now)
      fechaDesde.setHours(0, 0, 0, 0)
    } else if (periodo === "7d") {
      fechaDesde = new Date(now)
      fechaDesde.setDate(now.getDate() - 7)
    } else if (periodo === "30d") {
      fechaDesde = new Date(now)
      fechaDesde.setDate(now.getDate() - 30)
    }

    let query = supabase
      .from("v_historial_inventario")
      .select("id, creado_en, producto, sku, tipo, cantidad, stock_antes, stock_despues, motivo, id_venta, id_compra")
      .eq("id_empresa", empresaId)
      .order("creado_en", { ascending: false })

    if (tipo && tipo !== "todos") {
      if (tipo === "entradas") {
        query = query.in("tipo", ["entrada", "ajuste_positivo", "devolucion_venta"])
      } else if (tipo === "salidas") {
        query = query.in("tipo", ["salida", "ajuste_negativo", "devolucion_compra"])
      }
    }

    if (fechaDesde) {
      query = query.gte("creado_en", fechaDesde.toISOString())
    }

    const { data: movimientos, error } = await query.limit(500)
    if (error) throw error

    const data = movimientos || []

    if (exportCsv) {
      const headers = ["ID", "Fecha", "Producto", "SKU", "Tipo", "Cantidad", "Stock Antes", "Stock Despues", "Documento", "Motivo"]
      const rows = data.map((m) => [
        m.id,
        new Date(m.creado_en).toLocaleString("es-CR"),
        m.producto,
        m.sku || "",
        m.tipo,
        m.cantidad,
        m.stock_antes,
        m.stock_despues,
        m.id_venta ? `VENTA:${m.id_venta}` : m.id_compra ? `COMPRA:${m.id_compra}` : "",
        m.motivo || "",
      ])
      const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="movimientos-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    const entradas = data
      .filter((m) => ["entrada", "ajuste_positivo", "devolucion_venta"].includes(m.tipo))
      .reduce((s, m) => s + m.cantidad, 0)
    const salidas = data
      .filter((m) => ["salida", "ajuste_negativo", "devolucion_compra"].includes(m.tipo))
      .reduce((s, m) => s + m.cantidad, 0)

    return NextResponse.json({
      movimientos: data,
      stats: { entradas, salidas, neto: entradas - salidas, total: data.length },
    })
  } catch (error) {
    console.error("[movimientos GET]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al cargar movimientos" }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json(
    {
      error: "Los movimientos manuales están deshabilitados. Registra compras o ventas para afectar inventario.",
    },
    { status: 405 }
  )
}

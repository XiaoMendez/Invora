import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId, EmpresaNotConfiguredError, UserNotAuthenticatedError } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

// Función para escapar valores CSV correctamente
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  // Si contiene comas, comillas, saltos de línea o punto y coma, envolver en comillas
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r") || str.includes(";")) {
    // Escapar comillas dobles duplicándolas
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// Función para generar CSV con BOM para Excel
function generateCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const BOM = "\uFEFF" // BOM UTF-8 para que Excel detecte correctamente la codificación
  const separator = ";" // Usar punto y coma como separador (mejor compatibilidad con Excel en español)
  
  const headerLine = headers.map(escapeCSV).join(separator)
  const dataLines = rows.map(row => row.map(escapeCSV).join(separator))
  
  return BOM + [headerLine, ...dataLines].join("\r\n")
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get("tipo") || "todos"
    const periodo = searchParams.get("periodo") || "30d"
    const exportCsv = searchParams.get("export") === "csv"
    const clienteId = searchParams.get("cliente")
    const proveedorId = searchParams.get("proveedor")
    const search = searchParams.get("search")

    // Calculate date range
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
      .select("id, creado_en, producto_nombre, producto_sku, tipo, cantidad, stock_antes, stock_despues, motivo, id_cliente, cliente_nombre, id_proveedor, proveedor_nombre, comprobante_url")
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

    // Filtrar por cliente o proveedor
    if (clienteId) {
      query = query.eq("id_cliente", clienteId)
    }
    if (proveedorId) {
      query = query.eq("id_proveedor", proveedorId)
    }

    // Búsqueda por producto, cliente o proveedor
    if (search) {
      query = query.or(`producto_nombre.ilike.%${search}%,cliente_nombre.ilike.%${search}%,proveedor_nombre.ilike.%${search}%`)
    }

    const { data: movimientos, error } = await query.limit(500)
    if (error) throw error

    const data = movimientos || []

    if (exportCsv) {
      const headers = ["ID", "Fecha", "Producto", "SKU", "Tipo", "Cantidad", "Stock Antes", "Stock Después", "Motivo", "Cliente", "Proveedor"]
      const rows = data.map((m) => [
        m.id,
        new Date(m.creado_en).toLocaleString("es-CR"),
        m.producto_nombre,
        m.producto_sku,
        m.tipo,
        m.cantidad,
        m.stock_antes,
        m.stock_despues,
        m.motivo,
        m.cliente_nombre || "",
        m.proveedor_nombre || "",
      ])
      const csv = generateCSV(headers, rows)
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="movimientos-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // Summary stats
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

export async function POST(request: Request) {
  // Los movimientos NO se crean manualmente desde aquí.
  // Se crean automáticamente mediante triggers cuando:
  // 1. Una compra cambia de estado a "recibida"
  // 2. Una venta cambia de estado a "completada"
  // 3. Se cancela/anula una venta que estaba completada (devolucion_venta)

  return NextResponse.json(
    {
      error: "Los movimientos se crean automáticamente mediante compras y ventas. Use /api/compras o /api/ventas en su lugar.",
    },
    { status: 403 }
  )
}

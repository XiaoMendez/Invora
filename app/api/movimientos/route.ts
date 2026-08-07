import { NextResponse } from "next/server"
import ExcelJS from "exceljs"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId, EmpresaNotConfiguredError, UserNotAuthenticatedError } from "@/lib/supabase/empresa"

// Encabezados y forma de fila compartidos entre los 3 formatos de exportación
const EXPORT_HEADERS = [
  "ID",
  "Fecha",
  "Producto",
  "SKU",
  "Tipo",
  "Cantidad",
  "Stock Antes",
  "Stock Después",
  "Motivo",
  "Cliente",
  "Proveedor",
]

function buildExportRows(data: any[]): (string | number)[][] {
  return data.map((m) => [
    m.id ?? "",
    new Date(m.creado_en).toLocaleString("es-CR"),
    m.producto_nombre ?? "",
    m.producto_sku ?? "",
    m.tipo ?? "",
    m.cantidad ?? "",
    m.stock_antes ?? "",
    m.stock_despues ?? "",
    m.motivo ?? "",
    m.cliente_nombre ?? "",
    m.proveedor_nombre ?? "",
  ])
}

// Genera un .xlsx con columnas centradas y ancho automático según el
// contenido más largo de cada columna (esto es lo que un CSV plano nunca
// puede hacer, porque es texto sin ningún tipo de formato).
async function generateXLSX(headers: string[], rows: (string | number)[][]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Invora"
  workbook.created = new Date()

  const sheet = workbook.addWorksheet("Movimientos", {
    views: [{ state: "frozen", ySplit: 1 }],
  })

  sheet.columns = headers.map((header, i) => {
    const longest = rows.reduce((max, row) => {
      const len = String(row[i] ?? "").length
      return len > max ? len : max
    }, header.length)
    return {
      header,
      key: `col${i}`,
      // +4 de aire para que ningún valor quede pegado al borde ni se corte
      width: Math.min(Math.max(longest + 4, 10), 45),
    }
  })

  rows.forEach((row) => sheet.addRow(row))

  const headerRow = sheet.getRow(1)
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F2937" } }
    cell.alignment = { horizontal: "center", vertical: "middle" }
  })

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
    })
  })

  const arrayBuffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(arrayBuffer)
}

// Genera un PDF horizontal con una tabla auto-ajustada de los movimientos
function generatePDF(headers: string[], rows: (string | number)[][]): Buffer {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })

  doc.setFontSize(14)
  doc.text("Movimientos de inventario", 40, 30)
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text(`Generado el ${new Date().toLocaleString("es-CR")}`, 40, 45)

  autoTable(doc, {
    head: [headers],
    body: rows.map((row) => row.map((v) => (v === null || v === undefined ? "" : String(v)))),
    startY: 58,
    styles: { fontSize: 8, cellPadding: 4, halign: "center", valign: "middle" },
    headStyles: { fillColor: [31, 41, 55], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    theme: "grid",
  })

  return Buffer.from(doc.output("arraybuffer"))
}

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
    const exportFormat = searchParams.get("export") // "csv" | "xlsx" | "pdf" | null
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

    const rawData = movimientos || []

    // La vista v_historial_inventario devuelve producto_nombre/producto_sku,
    // pero el frontend espera producto/sku. Se remapea aquí explícitamente
    // en vez de depender de que los nombres de columna coincidan.
    const data = rawData.map((m: any) => ({
      ...m,
      producto: m.producto_nombre ?? m.producto ?? null,
      sku: m.producto_sku ?? m.sku ?? null,
    }))

    if (exportFormat === "csv" || exportFormat === "xlsx" || exportFormat === "pdf") {
      const dateStamp = new Date().toISOString().split("T")[0]
      const rows = buildExportRows(data)

      if (exportFormat === "csv") {
        const csv = generateCSV(EXPORT_HEADERS, rows)
        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="movimientos-${dateStamp}.csv"`,
          },
        })
      }

      if (exportFormat === "xlsx") {
        const buffer = await generateXLSX(EXPORT_HEADERS, rows)
        return new Response(buffer, {
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="movimientos-${dateStamp}.xlsx"`,
          },
        })
      }

      // exportFormat === "pdf"
      const buffer = generatePDF(EXPORT_HEADERS, rows)
      return new Response(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="movimientos-${dateStamp}.pdf"`,
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
  // Se crean automáticamente cuando:
  // 1. Una orden de compra cambia de estado a "entregada" (entrada de stock)
  // 2. Una orden de venta cambia de estado a "entregada" (salida de stock)
  // 3. Se registra un ajuste manual desde /api/ajuste-inventario

  return NextResponse.json(
    {
      error: "Los movimientos se crean automáticamente mediante órdenes de compra/venta o ajustes manuales. Use /api/ordenes-compra, /api/ordenes-venta o /api/ajuste-inventario en su lugar.",
    },
    { status: 403 }
  )
}

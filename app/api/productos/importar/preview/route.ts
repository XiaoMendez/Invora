import { NextResponse } from "next/server"
import ExcelJS from "exceljs"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId, EmpresaNotConfiguredError, UserNotAuthenticatedError } from "@/lib/supabase/empresa"
import { sugerirMapeo } from "@/lib/import/producto-mapping"

export const dynamic = "force-dynamic"

const MAX_FILAS = 5000

function celdaATexto(cell: ExcelJS.Cell): string | number {
  const valor = cell.value
  if (valor === null || valor === undefined) return ""
  if (typeof valor === "object") {
    // Formulas, hipervínculos y fechas de ExcelJS vienen como objetos
    if (valor instanceof Date) return valor.toLocaleDateString("es-CR")
    if ("result" in (valor as any)) return (valor as any).result ?? ""
    if ("text" in (valor as any)) return (valor as any).text ?? ""
    return ""
  }
  if (typeof valor === "number") {
    // Si la celda tiene un formato que agrega ceros a la izquierda (típico
    // de códigos/SKU, ej. "0025"), usar el texto tal como se ve en Excel en
    // vez del número "pelado" (25), que perdería esos ceros.
    const texto = cell.text
    if (texto && texto !== String(valor) && /^0/.test(texto)) return texto
  }
  return valor as string | number
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 })
    }

    const nombreArchivo = file.name.toLowerCase()
    if (!nombreArchivo.endsWith(".xlsx") && !nombreArchivo.endsWith(".xls")) {
      return NextResponse.json({ error: "El archivo debe ser un Excel (.xlsx)" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    const sheet = workbook.worksheets[0]
    if (!sheet || sheet.rowCount < 1) {
      return NextResponse.json({ error: "El archivo está vacío o no tiene un formato válido" }, { status: 400 })
    }

    // Encabezados: primera fila no vacía
    const headerRow = sheet.getRow(1)
    const headers: string[] = []
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      headers[colNumber - 1] = parseTextoSeguro(celdaATexto(cell))
    })
    // Recortar columnas vacías al final
    while (headers.length > 0 && !headers[headers.length - 1]) headers.pop()

    if (headers.length === 0) {
      return NextResponse.json({ error: "No se detectaron columnas en la primera fila" }, { status: 400 })
    }

    const rows: (string | number)[][] = []
    const totalFilasHoja = sheet.rowCount
    for (let r = 2; r <= totalFilasHoja && rows.length < MAX_FILAS; r++) {
      const row = sheet.getRow(r)
      if (row.cellCount === 0) continue
      const values: (string | number)[] = []
      let vacia = true
      for (let c = 1; c <= headers.length; c++) {
        const val = celdaATexto(row.getCell(c))
        if (val !== "" && val !== null) vacia = false
        values.push(val)
      }
      if (!vacia) rows.push(values)
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "No se encontraron filas de datos debajo del encabezado" }, { status: 400 })
    }

    const sugerencia = sugerirMapeo(headers)

    // Traer SKUs y categorias existentes de la empresa para poder mostrar,
    // en la etapa de mapeo, cuántas filas van a crear vs. actualizar.
    const { data: productosExistentes } = await supabase
      .from("producto")
      .select("sku")
      .eq("id_empresa", empresaId)
      .not("sku", "is", null)

    const { data: categoriasExistentes } = await supabase
      .from("categoria")
      .select("id, nombre")
      .eq("id_empresa", empresaId)

    const skusExistentes = (productosExistentes || [])
      .map((p) => (p.sku || "").trim().toLowerCase())
      .filter(Boolean)

    return NextResponse.json({
      headers,
      rows,
      totalRows: rows.length,
      truncated: totalFilasHoja - 1 > MAX_FILAS,
      sugerencia,
      skusExistentes,
      categoriasExistentes: categoriasExistentes || [],
    })
  } catch (error) {
    console.error("[productos/importar/preview]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "No se pudo leer el archivo. Verifica que sea un Excel válido." }, { status: 500 })
  }
}

function parseTextoSeguro(valor: string | number): string {
  return String(valor ?? "").trim()
}

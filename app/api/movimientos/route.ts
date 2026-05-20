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
      .select("id, creado_en, producto, sku, tipo, cantidad, stock_antes, stock_despues, motivo, id_cliente, cliente_nombre, cliente_apellido, id_proveedor, proveedor_nombre, comprobante_url")
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
      query = query.or(`producto.ilike.%${search}%,cliente_nombre.ilike.%${search}%,proveedor_nombre.ilike.%${search}%`)
    }

    const { data: movimientos, error } = await query.limit(500)
    if (error) throw error

    const data = movimientos || []

    if (exportCsv) {
      const headers = ["ID", "Fecha", "Producto", "SKU", "Tipo", "Cantidad", "Stock Antes", "Stock Después", "Motivo", "Cliente", "Proveedor"]
      const rows = data.map((m) => [
        m.id,
        new Date(m.creado_en).toLocaleString("es-CR"),
        m.producto,
        m.sku,
        m.tipo,
        m.cantidad,
        m.stock_antes,
        m.stock_despues,
        m.motivo,
        m.cliente_nombre ? `${m.cliente_nombre} ${m.cliente_apellido || ""}`.trim() : "",
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
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const body = await request.json()
    const { id_producto, tipo, cantidad, motivo, id_cliente, id_proveedor, comprobante_url } = body

    if (!id_producto || !tipo || !cantidad) {
      return NextResponse.json({ error: "Producto, tipo y cantidad son requeridos" }, { status: 400 })
    }

    const cantidadInt = parseInt(cantidad)
    if (isNaN(cantidadInt) || cantidadInt <= 0) {
      return NextResponse.json({ error: "La cantidad debe ser un número positivo" }, { status: 400 })
    }

    // Get current stock
    const { data: producto, error: prodError } = await supabase
      .from("producto")
      .select("id, stock, nombre")
      .eq("id", id_producto)
      .eq("id_empresa", empresaId)
      .single()

    if (prodError || !producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const esEntrada = ["entrada", "ajuste_positivo", "devolucion_venta"].includes(tipo)
    const esSalida = ["salida", "ajuste_negativo", "devolucion_compra"].includes(tipo)

    const stockActual = producto.stock
    const nuevoStock = esEntrada ? stockActual + cantidadInt : stockActual - cantidadInt

    if (esSalida && nuevoStock < 0) {
      return NextResponse.json({
        error: `Stock insuficiente. Stock actual: ${stockActual}, cantidad solicitada: ${cantidadInt}`,
      }, { status: 400 })
    }

    // Update stock
    const { error: updateError } = await supabase
      .from("producto")
      .update({ stock: nuevoStock })
      .eq("id", id_producto)

    if (updateError) throw updateError

    // Record movement with optional cliente, proveedor and comprobante
    const { data: movimiento, error: movError } = await supabase
      .from("movimiento_inventario")
      .insert({
        id_empresa: empresaId,
        id_producto,
        tipo,
        cantidad: cantidadInt,
        stock_antes: stockActual,
        stock_despues: nuevoStock,
        motivo: motivo?.trim() || null,
        id_cliente: id_cliente || null,
        id_proveedor: id_proveedor || null,
        comprobante_url: comprobante_url || null,
      })
      .select("id")
      .single()

    if (movError) throw movError

    return NextResponse.json({ success: true, movimiento, nuevoStock })
  } catch (error) {
    console.error("[movimientos POST]", error)
    const msg = error instanceof Error ? error.message : "Error al registrar movimiento"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

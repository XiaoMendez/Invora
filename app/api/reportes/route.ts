import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get("periodo") || "7m"
    const mesesAtras = periodo === "30d" ? 1 : periodo === "3m" ? 3 : periodo === "7m" ? 7 : 12

    const fechaDesde = new Date()
    fechaDesde.setMonth(fechaDesde.getMonth() - mesesAtras)

    const { data: productos } = await supabase
      .from("producto")
      .select("id, stock, precio_costo, activo")
      .eq("id_empresa", empresaId)
      .eq("activo", true)

    const prods = productos || []
    const valorInventario = prods.reduce((s, p) => s + p.stock * Number(p.precio_costo), 0)
    const skusActivos = prods.length

    const { data: resumenVentas } = await supabase
      .from("v_resumen_ventas_mensual")
      .select("mes, total_ventas")
      .eq("id_empresa", empresaId)
      .gte("mes", fechaDesde.toISOString())
      .order("mes", { ascending: true })

    const { data: movimientos } = await supabase
      .from("v_historial_inventario")
      .select("tipo, cantidad, creado_en")
      .eq("id_empresa", empresaId)
      .gte("creado_en", fechaDesde.toISOString())
      .order("creado_en", { ascending: true })

    const monthMap = new Map<string, { mes: string; entradas: number; salidas: number; ventas: number }>()
    ;(movimientos || []).forEach((m) => {
      const d = new Date(m.creado_en)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const mesLabel = d.toLocaleDateString("es-CR", { month: "short", year: "2-digit" })
      if (!monthMap.has(key)) monthMap.set(key, { mes: mesLabel, entradas: 0, salidas: 0, ventas: 0 })
      const entry = monthMap.get(key)!
      if (["entrada", "ajuste_positivo", "devolucion_venta"].includes(m.tipo)) entry.entradas += m.cantidad
      else entry.salidas += m.cantidad
    })

    ;(resumenVentas || []).forEach((rv) => {
      const d = new Date(rv.mes)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const mesLabel = d.toLocaleDateString("es-CR", { month: "short", year: "2-digit" })
      if (!monthMap.has(key)) monthMap.set(key, { mes: mesLabel, entradas: 0, salidas: 0, ventas: 0 })
      monthMap.get(key)!.ventas = Number(rv.total_ventas || 0)
    })

    const monthlyTrend = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v)

    const { data: productosCat } = await supabase
      .from("producto")
      .select("stock, precio_costo, id_categoria, categoria(nombre)")
      .eq("id_empresa", empresaId)
      .eq("activo", true)

    const catMap = new Map<string, { name: string; value: number; valorTotal: number }>()
    ;(productosCat || []).forEach((p) => {
      const categoria = p.categoria as { nombre: string }[] | { nombre: string } | null
      const catName = Array.isArray(categoria) ? categoria[0]?.nombre : categoria?.nombre || "Sin categoria"
      if (!catMap.has(catName)) catMap.set(catName, { name: catName, value: 0, valorTotal: 0 })
      const c = catMap.get(catName)!
      c.value += 1
      c.valorTotal += p.stock * Number(p.precio_costo)
    })

    const totalProductos = Array.from(catMap.values()).reduce((s, c) => s + c.value, 0)
    const colors = ["oklch(0.72 0.19 310)", "oklch(0.65 0.2 260)", "oklch(0.6 0.15 200)", "oklch(0.75 0.15 340)", "oklch(0.7 0.18 150)"]
    const categoryDistribution = Array.from(catMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map((c, i) => ({ ...c, percentage: totalProductos > 0 ? Math.round((c.value / totalProductos) * 100) : 0, color: colors[i % colors.length] }))

    const { data: topVendidos } = await supabase
      .from("v_productos_mas_vendidos")
      .select("id_empresa, producto, unidades_vendidas")
      .eq("id_empresa", empresaId)
      .limit(5)

    const topProducts = (topVendidos || []).map((p) => ({
      nombre: p.producto.length > 15 ? `${p.producto.substring(0, 15)}...` : p.producto,
      salidas: Number(p.unidades_vendidas),
    }))

    const totalSalidas = (movimientos || [])
      .filter((m) => ["salida", "ajuste_negativo"].includes(m.tipo))
      .reduce((s, m) => s + m.cantidad, 0)
    const avgStock = prods.reduce((s, p) => s + p.stock, 0) / Math.max(prods.length, 1)
    const rotacion = avgStock > 0 ? (totalSalidas / avgStock).toFixed(1) : "0.0"

    return NextResponse.json({
      kpis: { valorInventario, skusActivos, rotacion: `${rotacion}x / mes` },
      monthlyTrend,
      categoryDistribution,
      topProducts,
    })
  } catch (error) {
    console.error("[reportes GET]", error)
    return NextResponse.json({ error: "Error al cargar reportes" }, { status: 500 })
  }
}

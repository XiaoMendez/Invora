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

    // Calculate how many months to look back
    const mesesAtras = periodo === "30d" ? 1 : periodo === "3m" ? 3 : periodo === "7m" ? 7 : 12

    // 1. KPI: total inventory value, active SKUs
    const { data: productos } = await supabase
      .from("producto")
      .select("id, stock, precio_costo, precio_venta, activo")
      .eq("id_empresa", empresaId)
      .eq("activo", true)

    const prods = productos || []
    const valorInventario = prods.reduce((s, p) => s + p.stock * Number(p.precio_costo), 0)
    const skusActivos = prods.length

    // 2. Monthly trend - movements grouped by month
    const fechaDesde = new Date()
    fechaDesde.setMonth(fechaDesde.getMonth() - mesesAtras)

    const { data: movimientos } = await supabase
      .from("movimiento_inventario")
      .select("tipo, cantidad, creado_en")
      .eq("id_empresa", empresaId)
      .gte("creado_en", fechaDesde.toISOString())
      .order("creado_en", { ascending: true })

    // Group by month
    const monthMap = new Map<string, { mes: string; entradas: number; salidas: number; valorMes: number }>()
    ;(movimientos || []).forEach((m) => {
      const d = new Date(m.creado_en)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const mesLabel = d.toLocaleDateString("es-CR", { month: "short", year: "2-digit" })
      if (!monthMap.has(key)) monthMap.set(key, { mes: mesLabel, entradas: 0, salidas: 0, valorMes: 0 })
      const entry = monthMap.get(key)!
      if (["entrada", "ajuste_positivo", "devolucion_venta"].includes(m.tipo)) {
        entry.entradas += m.cantidad
      } else {
        entry.salidas += m.cantidad
      }
    })

    const monthlyTrend = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v)

    // 3. Category distribution by product count and value
    const { data: productosCat } = await supabase
      .from("producto")
      .select("stock, precio_costo, id_categoria, categoria(nombre)")
      .eq("id_empresa", empresaId)
      .eq("activo", true)

    const catMap = new Map<string, { name: string; value: number; valorTotal: number }>()
    ;(productosCat || []).forEach((p) => {
      const catName = (p.categoria as { nombre: string } | null)?.nombre || "Sin categoria"
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
      .map((c, i) => ({
        ...c,
        percentage: totalProductos > 0 ? Math.round((c.value / totalProductos) * 100) : 0,
        color: colors[i % colors.length],
      }))

    // 4. Top products by movement (salidas)
    const { data: topMovs } = await supabase
      .from("movimiento_inventario")
      .select("id_producto, cantidad, tipo, producto:producto(nombre, sku)")
      .eq("id_empresa", empresaId)
      .in("tipo", ["salida", "ajuste_negativo"])
      .gte("creado_en", fechaDesde.toISOString())

    const prodMovMap = new Map<string, { nombre: string; salidas: number }>()
    ;(topMovs || []).forEach((m) => {
      const prodInfo = m.producto as { nombre: string; sku: string } | null
      const nombre = prodInfo?.nombre || "Desconocido"
      if (!prodMovMap.has(m.id_producto)) {
        prodMovMap.set(m.id_producto, { nombre, salidas: 0 })
      }
      prodMovMap.get(m.id_producto)!.salidas += m.cantidad
    })

    const topProducts = Array.from(prodMovMap.values())
      .sort((a, b) => b.salidas - a.salidas)
      .slice(0, 5)
      .map((p) => ({ nombre: p.nombre.length > 15 ? p.nombre.substring(0, 15) + "..." : p.nombre, salidas: p.salidas }))

    // 5. Rotation rate: total salidas / avg stock
    const totalSalidas = (movimientos || [])
      .filter((m) => ["salida", "ajuste_negativo"].includes(m.tipo))
      .reduce((s, m) => s + m.cantidad, 0)
    const avgStock = prods.reduce((s, p) => s + p.stock, 0) / Math.max(prods.length, 1)
    const rotacion = avgStock > 0 ? (totalSalidas / avgStock).toFixed(1) : "0.0"

    return NextResponse.json({
      kpis: {
        valorInventario,
        skusActivos,
        rotacion: `${rotacion}x / mes`,
      },
      monthlyTrend,
      categoryDistribution,
      topProducts,
    })
  } catch (error) {
    console.error("[reportes GET]", error)
    return NextResponse.json({ error: "Error al cargar reportes" }, { status: 500 })
  }
}

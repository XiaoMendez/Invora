import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId, EmpresaNotConfiguredError, UserNotAuthenticatedError } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { data: productos, error: prodError } = await supabase
      .from("producto")
      .select("id, nombre, stock, stock_minimo, precio_costo, activo")
      .eq("id_empresa", empresaId)

    if (prodError) throw prodError

    const totalProductos = productos?.length || 0
    const valorInventario = (productos || []).reduce((sum, p) => sum + p.stock * (p.precio_costo || 0), 0)

    const { data: lowStockProducts, error: lowStockError } = await supabase
      .from("v_productos_bajo_stock")
      .select("id, producto, sku, stock, stock_minimo, categoria, faltante")
      .eq("id_empresa", empresaId)
      .limit(5)

    if (lowStockError) throw lowStockError

    const alertasActivas = lowStockProducts?.length || 0

    const { data: rawMovements, error: movError } = await supabase
      .from("v_historial_inventario")
      .select("id, tipo, cantidad, creado_en, producto")
      .eq("id_empresa", empresaId)
      .order("creado_en", { ascending: false })
      .limit(10)

    if (movError) throw movError

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const recentMovements = rawMovements || []
    const movimientosHoy = recentMovements.filter((m) => new Date(m.creado_en) >= today).length

    const { data: productosConCategoria, error: catError } = await supabase
      .from("producto")
      .select("id_categoria, categoria(nombre)")
      .eq("id_empresa", empresaId)
      .eq("activo", true)

    if (catError) throw catError

    const categoryMap = new Map<string, number>()
    ;(productosConCategoria || []).forEach((p) => {
      const categoria = p.categoria as { nombre: string }[] | { nombre: string } | null
      const catName = Array.isArray(categoria) ? categoria[0]?.nombre : categoria?.nombre || "Sin categoria"
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1)
    })

    const categoryData = Array.from(categoryMap.entries())
      .map(([categoria, cantidad]) => ({ categoria, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: trendMovements, error: trendError } = await supabase
      .from("v_historial_inventario")
      .select("tipo, cantidad, creado_en")
      .eq("id_empresa", empresaId)
      .gte("creado_en", sixMonthsAgo.toISOString())
      .order("creado_en", { ascending: true })

    if (trendError) throw trendError

    const monthMap = new Map<string, { mes: string; entradas: number; salidas: number }>()
    ;(trendMovements || []).forEach((m) => {
      const d = new Date(m.creado_en)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const mesLabel = d.toLocaleDateString("es-CR", { month: "short" })
      if (!monthMap.has(key)) monthMap.set(key, { mes: mesLabel, entradas: 0, salidas: 0 })
      const entry = monthMap.get(key)!
      if (["entrada", "ajuste_positivo", "devolucion_venta"].includes(m.tipo)) entry.entradas += m.cantidad
      else entry.salidas += m.cantidad
    })

    const monthlyTrend = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v)

    return NextResponse.json({
      stats: { totalProductos, valorInventario, movimientosHoy, alertasActivas },
      recentMovements,
      lowStockProducts: lowStockProducts || [],
      categoryData: categoryData.slice(0, 5),
      monthlyTrend,
    })
  } catch (error) {
    console.error("[dashboard GET]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    const message = error instanceof Error ? error.message : "Error al cargar datos del dashboard"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

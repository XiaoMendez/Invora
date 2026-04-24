import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId, EmpresaNotConfiguredError, UserNotAuthenticatedError } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    // Get all productos for the empresa
    const { data: productos, error: prodError } = await supabase
      .from("producto")
      .select("id, nombre, stock, stock_minimo, precio_costo, activo")
      .eq("id_empresa", empresaId)

    if (prodError) throw prodError

    const totalProductos = productos?.length || 0
    const valorInventario = (productos || []).reduce(
      (sum, p) => sum + (p.stock * (p.precio_costo || 0)),
      0
    )
    const lowStockProducts = (productos || []).filter(
      (p) => p.activo && p.stock <= p.stock_minimo && p.stock_minimo > 0
    )
    const alertasActivas = lowStockProducts.length

    // Get recent movements with product info
    const { data: rawMovements, error: movError } = await supabase
      .from("v_historial_inventario")
      .select("id, tipo, cantidad, creado_en, producto")
      .eq("id_empresa", empresaId)
      .order("creado_en", { ascending: false })
      .limit(10)

    if (movError) throw movError

    const recentMovements = (rawMovements || []).map((m) => ({
      id: m.id,
      tipo: m.tipo,
      cantidad: m.cantidad,
      creado_en: m.creado_en,
      producto: m.producto,
    }))

    // Get movements today count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const movimientosHoy = recentMovements.filter(
      (m) => new Date(m.creado_en) >= today
    ).length

    // Get categories data with product counts
    const { data: productosConCategoria, error: catError } = await supabase
      .from("producto")
      .select("id_categoria, categoria(nombre)")
      .eq("id_empresa", empresaId)
      .eq("activo", true)

    if (catError) throw catError

    // Group products by category
    const categoryMap = new Map<string, number>()
    ;(productosConCategoria || []).forEach((p) => {
      const catName = (p.categoria as { nombre: string } | null)?.nombre || "Sin categoria"
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1)
    })

    const categoryData = Array.from(categoryMap.entries())
      .map(([categoria, cantidad]) => ({ categoria, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)

    // Get monthly trend for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: trendMovements, error: trendError } = await supabase
      .from("movimiento_inventario")
      .select("tipo, cantidad, creado_en")
      .eq("id_empresa", empresaId)
      .gte("creado_en", sixMonthsAgo.toISOString())
      .order("creado_en", { ascending: true })

    if (trendError) throw trendError

    // Group by month
    const monthMap = new Map<string, { mes: string; entradas: number; salidas: number }>()
    ;(trendMovements || []).forEach((m) => {
      const d = new Date(m.creado_en)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const mesLabel = d.toLocaleDateString("es-CR", { month: "short" })
      if (!monthMap.has(key)) {
        monthMap.set(key, { mes: mesLabel, entradas: 0, salidas: 0 })
      }
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

    return NextResponse.json({
      stats: {
        totalProductos,
        valorInventario,
        movimientosHoy,
        alertasActivas,
      },
      recentMovements: recentMovements || [],
      lowStockProducts: lowStockProducts.slice(0, 5),
      categoryData: categoryData.slice(0, 5),
      monthlyTrend,
    })
  } catch (error) {
    console.error("[v0] Dashboard API error:", error)
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

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      )
    }

    const empresaId = user.id

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
      monthlyTrend: [],
    })
  } catch (error) {
    console.error("[v0] Dashboard API error:", error)
    return NextResponse.json(
      { error: "Error al cargar datos del dashboard" },
      { status: 500 }
    )
  }
}

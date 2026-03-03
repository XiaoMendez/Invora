import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { queryOne, query } from "@/lib/db"

export async function GET() {
  const session = await verifySession()

  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const empresaId = session.empresaId

  try {
    // Total products count
    const productCount = await queryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM producto WHERE id_empresa = $1 AND activo = true",
      [empresaId]
    )

    // Inventory value
    const inventoryValue = await queryOne<{ total: string }>(
      "SELECT COALESCE(SUM(stock * precio_costo), 0) as total FROM producto WHERE id_empresa = $1 AND activo = true",
      [empresaId]
    )

    // Movements today
    const movementsToday = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM movimiento_inventario
       WHERE id_empresa = $1 AND creado_en >= CURRENT_DATE`,
      [empresaId]
    )

    // Low stock alerts
    const lowStockCount = await queryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM producto WHERE id_empresa = $1 AND activo = true AND stock <= stock_minimo AND stock_minimo > 0",
      [empresaId]
    )

    // Recent movements
    const recentMovements = await query<{
      id: string
      producto: string
      tipo: string
      cantidad: number
      creado_en: string
    }>(
      `SELECT m.id, p.nombre as producto, m.tipo::text, m.cantidad, m.creado_en
       FROM movimiento_inventario m
       JOIN producto p ON p.id = m.id_producto
       WHERE m.id_empresa = $1
       ORDER BY m.creado_en DESC
       LIMIT 5`,
      [empresaId]
    )

    // Low stock products
    const lowStockProducts = await query<{
      nombre: string
      stock: number
      stock_minimo: number
    }>(
      `SELECT nombre, stock, stock_minimo
       FROM producto
       WHERE id_empresa = $1 AND activo = true AND stock <= stock_minimo AND stock_minimo > 0
       ORDER BY (stock::float / NULLIF(stock_minimo, 0)::float) ASC
       LIMIT 5`,
      [empresaId]
    )

    // Products by category
    const categoryData = await query<{
      categoria: string
      cantidad: number
    }>(
      `SELECT COALESCE(c.nombre, 'Sin categoria') as categoria, COUNT(p.id)::int as cantidad
       FROM producto p
       LEFT JOIN categoria c ON c.id = p.id_categoria
       WHERE p.id_empresa = $1 AND p.activo = true
       GROUP BY c.nombre
       ORDER BY cantidad DESC
       LIMIT 5`,
      [empresaId]
    )

    // Monthly inventory trend (last 7 months)
    const monthlyTrend = await query<{
      mes: string
      entradas: number
      salidas: number
    }>(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', creado_en), 'Mon') as mes,
         COALESCE(SUM(CASE WHEN tipo::text IN ('entrada', 'ajuste_positivo', 'devolucion_venta') THEN cantidad ELSE 0 END), 0)::int as entradas,
         COALESCE(SUM(CASE WHEN tipo::text IN ('salida', 'ajuste_negativo', 'devolucion_compra') THEN cantidad ELSE 0 END), 0)::int as salidas
       FROM movimiento_inventario
       WHERE id_empresa = $1 AND creado_en >= NOW() - INTERVAL '7 months'
       GROUP BY DATE_TRUNC('month', creado_en), TO_CHAR(DATE_TRUNC('month', creado_en), 'Mon')
       ORDER BY DATE_TRUNC('month', creado_en) ASC`,
      [empresaId]
    )

    return NextResponse.json({
      stats: {
        totalProductos: parseInt(productCount?.count || "0"),
        valorInventario: parseFloat(inventoryValue?.total || "0"),
        movimientosHoy: parseInt(movementsToday?.count || "0"),
        alertasActivas: parseInt(lowStockCount?.count || "0"),
      },
      recentMovements,
      lowStockProducts,
      categoryData,
      monthlyTrend,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json(
      { error: "Error al cargar datos del dashboard" },
      { status: 500 }
    )
  }
}

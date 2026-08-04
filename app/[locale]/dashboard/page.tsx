"use client"

import useSWR from "swr"
import {
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowLeftRight,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function CustomTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}) {
  if (!active || !payload) return null
  return (
    <div className="glass-card rounded-lg p-3 text-xs">
      <p className="text-foreground font-medium mb-1">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-muted-foreground">
          <span style={{ color: item.color }}>
            {item.dataKey === "entradas"
              ? "Entradas"
              : item.dataKey === "salidas"
                ? "Salidas"
                : item.dataKey}
          </span>
          : {item.value}
        </p>
      ))}
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatMovementType(tipo: string) {
  const map: Record<string, { label: string; variant: "entrada" | "salida" }> = {
    entrada: { label: "Entrada", variant: "entrada" },
    salida: { label: "Salida", variant: "salida" },
    ajuste_positivo: { label: "Ajuste +", variant: "entrada" },
    ajuste_negativo: { label: "Ajuste -", variant: "salida" },
    devolucion_venta: { label: "Dev. Venta", variant: "entrada" },
    devolucion_compra: { label: "Dev. Compra", variant: "salida" },
  }
  return map[tipo] || { label: tipo, variant: "entrada" }
}

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR("/api/dashboard", fetcher, {
    refreshInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || data?.error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-muted-foreground">
            Error al cargar los datos del dashboard
          </p>
        </div>
      </div>
    )
  }

  const stats = data?.stats || {
    totalProductos: 0,
    valorInventario: 0,
    movimientosHoy: 0,
    alertasActivas: 0,
  }

  const statsCards = [
    {
      title: "Productos Totales",
      value: stats.totalProductos.toLocaleString(),
      icon: Package,
    },
    {
      title: "Valor del Inventario",
      value: formatCurrency(stats.valorInventario),
      icon: TrendingUp,
    },
    {
      title: "Movimientos Hoy",
      value: stats.movimientosHoy.toLocaleString(),
      icon: ArrowLeftRight,
    },
    {
      title: "Alertas Activas",
      value: stats.alertasActivas.toLocaleString(),
      icon: AlertTriangle,
    },
  ]

  const recentMovements = data?.recentMovements || []
  const lowStockProducts = data?.lowStockProducts || []
  const categoryData = data?.categoryData || []
  const monthlyTrend = data?.monthlyTrend || []

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bienvenido de vuelta. Aqui tienes un resumen de tu inventario.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="glass-card border-border/30">
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Inventory Trend */}
        <Card className="lg:col-span-2 glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Movimientos de Inventario
            </CardTitle>
            <CardDescription>
              Entradas vs salidas en los ultimos meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend}>
                    <defs>
                      <linearGradient
                        id="colorEntradas"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="oklch(0.72 0.19 310)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(0.72 0.19 310)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorSalidas"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="oklch(0.65 0.2 260)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(0.65 0.2 260)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.22 0.02 280)"
                    />
                    <XAxis
                      dataKey="mes"
                      tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="entradas"
                      stroke="oklch(0.72 0.19 310)"
                      fill="url(#colorEntradas)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="salidas"
                      stroke="oklch(0.65 0.2 260)"
                      fill="url(#colorSalidas)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No hay movimientos registrados aun
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Por Categoria</CardTitle>
            <CardDescription>Distribucion del inventario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.22 0.02 280)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="categoria"
                      type="category"
                      tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltipContent />} />
                    <Bar
                      dataKey="cantidad"
                      fill="oklch(0.72 0.19 310)"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No hay productos registrados
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Movements */}
        <Card className="lg:col-span-2 glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Movimientos Recientes
            </CardTitle>
            <CardDescription>
              Ultimas entradas y salidas registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentMovements.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs">Producto</TableHead>
                    <TableHead className="text-xs">Tipo</TableHead>
                    <TableHead className="text-xs text-right">
                      Cantidad
                    </TableHead>
                    <TableHead className="text-xs">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMovements.map(
                    (mov: {
                      id: string
                      producto: string
                      tipo: string
                      cantidad: number
                      creado_en: string
                    }) => {
                      const movType = formatMovementType(mov.tipo)
                      return (
                        <TableRow key={mov.id} className="border-border/20">
                          <TableCell className="text-xs text-foreground">
                            {mov.producto}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] ${
                                movType.variant === "entrada"
                                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}
                            >
                              {movType.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-right text-foreground">
                            {mov.cantidad}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(mov.creado_en).toLocaleDateString(
                              "es-CR",
                              {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    }
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                No hay movimientos registrados aun
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Stock Bajo
            </CardTitle>
            <CardDescription>Productos por debajo del minimo</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {lowStockProducts.map(
                  (product: {
                    nombre: string
                    stock: number
                    stock_minimo: number
                  }) => {
                    const percentage =
                      product.stock_minimo > 0
                        ? (product.stock / product.stock_minimo) * 100
                        : 0
                    return (
                      <div key={product.nombre} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground">
                            {product.nombre}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {product.stock}/{product.stock_minimo}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              percentage < 40 ? "bg-red-400" : "bg-amber-400"
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                No hay alertas de stock bajo
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

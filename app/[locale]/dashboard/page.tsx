"use client"

import useSWR from "swr"
import {
  Package, TrendingUp, AlertTriangle, ArrowLeftRight, Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts"
import { useTranslation } from "@/hooks/useTranslation"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function CustomTooltipContent({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string
}) {
  const { t } = useTranslation()
  if (!active || !payload) return null
  return (
    <div className="glass-card rounded-lg p-3 text-xs">
      <p className="text-foreground font-medium mb-1">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-muted-foreground">
          <span style={{ color: item.color }}>
            {item.dataKey === "entradas" ? t("movements.typeEntry") : item.dataKey === "salidas" ? t("movements.typeSale") : item.dataKey}
          </span>: {item.value}
        </p>
      ))}
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
}

function formatMovementType(tipo: string, t: (key: string) => string) {
  const map: Record<string, { label: string; variant: "entrada" | "salida" }> = {
    entrada: { label: t("movements.typeEntry"), variant: "entrada" },
    salida: { label: t("movements.typeSale"), variant: "salida" },
    ajuste_positivo: { label: t("movements.typeAdjustPos"), variant: "entrada" },
    ajuste_negativo: { label: t("movements.typeAdjustNeg"), variant: "salida" },
    devolucion_venta: { label: t("movements.typeReturnSale"), variant: "entrada" },
    devolucion_compra: { label: t("movements.typeReturnPurchase"), variant: "salida" },
  }
  return map[tipo] || { label: tipo, variant: "entrada" as const }
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { data, error, isLoading } = useSWR("/api/dashboard", fetcher, { refreshInterval: 30000 })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("dashboard.loading")}</p>
        </div>
      </div>
    )
  }

  if (error || data?.error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-muted-foreground">{t("dashboard.errorLoad")}</p>
        </div>
      </div>
    )
  }

  const stats = data?.stats || { totalProductos: 0, valorInventario: 0, movimientosHoy: 0, alertasActivas: 0 }
  const statsCards = [
    { title: t("dashboard.totalProducts"), value: stats.totalProductos.toLocaleString(), icon: Package },
    { title: t("dashboard.inventoryValue"), value: formatCurrency(stats.valorInventario), icon: TrendingUp },
    { title: t("dashboard.todayMovements"), value: stats.movimientosHoy.toLocaleString(), icon: ArrowLeftRight },
    { title: t("dashboard.activeAlerts"), value: stats.alertasActivas.toLocaleString(), icon: AlertTriangle },
  ]

  const recentMovements = data?.recentMovements || []
  const lowStockProducts = data?.lowStockProducts || []
  const categoryData = data?.categoryData || []
  const monthlyTrend = data?.monthlyTrend || []

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("dashboard.welcome")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="glass-card border-border/30">
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
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
        <Card className="lg:col-span-2 glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("dashboard.inventoryMovements")}</CardTitle>
            <CardDescription>{t("dashboard.entriesVsExits")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend}>
                    <defs>
                      <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.72 0.19 310)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.72 0.19 310)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSalidas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.65 0.2 260)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.65 0.2 260)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 280)" />
                    <XAxis dataKey="mes" tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltipContent />} />
                    <Area type="monotone" dataKey="entradas" stroke="oklch(0.72 0.19 310)" fill="url(#colorEntradas)" strokeWidth={2} />
                    <Area type="monotone" dataKey="salidas" stroke="oklch(0.65 0.2 260)" fill="url(#colorSalidas)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  {t("dashboard.noMovements")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("dashboard.byCategory")}</CardTitle>
            <CardDescription>{t("dashboard.categoryDistribution")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 280)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="categoria" type="category" tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<CustomTooltipContent />} />
                    <Bar dataKey="cantidad" fill="oklch(0.72 0.19 310)" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  {t("dashboard.noProducts")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("dashboard.recentMovements")}</CardTitle>
            <CardDescription>{t("dashboard.recentMovementsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMovements.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs">{t("dashboard.product")}</TableHead>
                    <TableHead className="text-xs">{t("dashboard.type")}</TableHead>
                    <TableHead className="text-xs text-right">{t("common.quantity")}</TableHead>
                    <TableHead className="text-xs">{t("dashboard.date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMovements.map((mov: { id: string; producto: string; tipo: string; cantidad: number; creado_en: string }) => {
                    const movType = formatMovementType(mov.tipo, t)
                    return (
                      <TableRow key={mov.id} className="border-border/20">
                        <TableCell className="text-xs text-foreground">{mov.producto}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] ${movType.variant === "entrada" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                            {movType.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-right text-foreground">{mov.cantidad}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(mov.creado_en).toLocaleDateString("es-CR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                {t("dashboard.noMovements")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              {t("dashboard.lowStockTitle")}
            </CardTitle>
            <CardDescription>{t("dashboard.lowStockDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {lowStockProducts.map((product: { nombre: string; stock: number; stock_minimo: number }) => {
                  const percentage = product.stock_minimo > 0 ? (product.stock / product.stock_minimo) * 100 : 0
                  return (
                    <div key={product.nombre} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground">{product.nombre}</span>
                        <span className="text-xs text-muted-foreground">{product.stock}/{product.stock_minimo}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${percentage < 40 ? "bg-red-400" : "bg-amber-400"}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                {t("dashboard.noLowStock")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

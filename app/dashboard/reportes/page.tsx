"use client"

import { useState } from "react"
import useSWR from "swr"
import { BarChart3, TrendingUp, Package, DollarSign, Loader2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
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
          {item.dataKey === "entradas" ? "Entradas" : item.dataKey === "salidas" ? "Salidas" : item.dataKey}: {item.value.toLocaleString()}
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

export default function ReportesPage() {
  const [periodo, setPeriodo] = useState("7m")

  const { data, error, isLoading } = useSWR(`/api/reportes?periodo=${periodo}`, fetcher, {
    refreshInterval: 60000,
  })

  const kpis = data?.kpis || { valorInventario: 0, skusActivos: 0, rotacion: "0.0x / mes" }
  const monthlyTrend = data?.monthlyTrend || []
  const categoryDistribution = data?.categoryDistribution || []
  const topProducts = data?.topProducts || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando reportes...</p>
        </div>
      </div>
    )
  }

  if (error || data?.error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-muted-foreground">Error al cargar reportes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analiza el rendimiento de tu inventario con datos detallados.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-44 bg-secondary/50 border-border/30 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card border-border/30">
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="3m">Últimos 3 meses</SelectItem>
              <SelectItem value="7m">Últimos 7 meses</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-border/30">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Valor Total Inventario</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(kpis.valorInventario)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rotacion Promedio</p>
                <p className="text-xl font-bold text-foreground">{kpis.rotacion}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Package className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">SKUs Activos</p>
                <p className="text-xl font-bold text-foreground">{kpis.skusActivos.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <Card className="lg:col-span-2 glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Movimientos Mensuales</CardTitle>
            <CardDescription>Entradas vs salidas por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
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
                    <YAxis tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltipContent />} />
                    <Area type="monotone" dataKey="entradas" stroke="oklch(0.72 0.19 310)" fill="url(#colorEntradas)" strokeWidth={2} />
                    <Area type="monotone" dataKey="salidas" stroke="oklch(0.65 0.2 260)" fill="url(#colorSalidas)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No hay datos de movimientos en este periodo
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Pie */}
        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Distribucion por Categoria</CardTitle>
            <CardDescription>Porcentaje del inventario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {categoryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry: { color: string }, index: number) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null
                        return (
                          <div className="glass-card rounded-lg p-2 text-xs">
                            <p className="text-foreground">{payload[0].name}: {payload[0].value} productos</p>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No hay productos registrados
                </div>
              )}
            </div>
            {categoryDistribution.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {categoryDistribution.map((cat: { name: string; percentage: number; color: string }) => (
                  <div key={cat.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name} ({cat.percentage}%)
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Productos con Mayor Rotacion
          </CardTitle>
          <CardDescription>Top 5 por cantidad de salidas en el periodo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 280)" />
                  <XAxis dataKey="nombre" tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltipContent />} />
                  <Bar dataKey="salidas" fill="oklch(0.72 0.19 310)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No hay datos de rotacion en este periodo
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

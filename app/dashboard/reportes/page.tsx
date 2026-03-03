"use client"

import { BarChart3, Download, TrendingUp, Package, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Legend,
} from "recharts"

const monthlyRevenue = [
  { mes: "Sep", valor: 2400000 },
  { mes: "Oct", valor: 2800000 },
  { mes: "Nov", valor: 3200000 },
  { mes: "Dic", valor: 4100000 },
  { mes: "Ene", valor: 3500000 },
  { mes: "Feb", valor: 3800000 },
  { mes: "Mar", valor: 4200000 },
]

const categoryDistribution = [
  { name: "Alimentos", value: 42, color: "oklch(0.72 0.19 310)" },
  { name: "Bebidas", value: 28, color: "oklch(0.65 0.2 260)" },
  { name: "Limpieza", value: 18, color: "oklch(0.6 0.15 200)" },
  { name: "Otros", value: 12, color: "oklch(0.75 0.15 340)" },
]

const topProducts = [
  { nombre: "Cafe Britt", salidas: 340 },
  { nombre: "Arroz T.Pelon", salidas: 280 },
  { nombre: "Leche D.Pinos", salidas: 245 },
  { nombre: "Detergente Irex", salidas: 190 },
  { nombre: "Jugo Del Valle", salidas: 165 },
]

function CustomTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload) return null
  return (
    <div className="glass-card rounded-lg p-3 text-xs">
      <p className="text-foreground font-medium mb-1">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-muted-foreground">
          {item.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function ReportesPage() {
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
          <Select defaultValue="7m">
            <SelectTrigger className="w-44 bg-secondary/50 border-border/30 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card border-border/30">
              <SelectItem value="30d">Ultimos 30 dias</SelectItem>
              <SelectItem value="3m">Ultimos 3 meses</SelectItem>
              <SelectItem value="7m">Ultimos 7 meses</SelectItem>
              <SelectItem value="1y">Ultimo ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-border/30 gap-2 text-sm">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
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
                <p className="text-xl font-bold text-foreground">{"\u20A1"}8,420,000</p>
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
                <p className="text-xl font-bold text-foreground">4.2x / mes</p>
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
                <p className="text-xl font-bold text-foreground">1,284</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2 glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
            <CardDescription>Evolucion mensual en colones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.72 0.19 310)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.72 0.19 310)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 280)" />
                  <XAxis dataKey="mes" tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip content={<CustomTooltipContent />} />
                  <Area type="monotone" dataKey="valor" stroke="oklch(0.72 0.19 310)" fill="url(#colorValor)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
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
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null
                      return (
                        <div className="glass-card rounded-lg p-2 text-xs">
                          <p className="text-foreground">{payload[0].name}: {payload[0].value}%</p>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {categoryDistribution.map((cat) => (
                <div key={cat.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name} ({cat.value}%)
                </div>
              ))}
            </div>
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
          <CardDescription>Top 5 por cantidad de salidas este mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 280)" />
                <XAxis dataKey="nombre" tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltipContent />} />
                <Bar dataKey="salidas" fill="oklch(0.72 0.19 310)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import {
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
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

const statsCards = [
  {
    title: "Productos Totales",
    value: "1,284",
    change: "+12%",
    trend: "up" as const,
    icon: Package,
  },
  {
    title: "Valor del Inventario",
    value: "\u20A18.4M",
    change: "+5.2%",
    trend: "up" as const,
    icon: TrendingUp,
  },
  {
    title: "Movimientos Hoy",
    value: "47",
    change: "-3%",
    trend: "down" as const,
    icon: ArrowLeftRight,
  },
  {
    title: "Alertas Activas",
    value: "3",
    change: "+1",
    trend: "up" as const,
    icon: AlertTriangle,
  },
]

const inventoryTrend = [
  { mes: "Ene", entradas: 120, salidas: 90 },
  { mes: "Feb", entradas: 150, salidas: 110 },
  { mes: "Mar", entradas: 130, salidas: 140 },
  { mes: "Abr", entradas: 170, salidas: 120 },
  { mes: "May", entradas: 160, salidas: 150 },
  { mes: "Jun", entradas: 190, salidas: 130 },
  { mes: "Jul", entradas: 200, salidas: 170 },
]

const categoryData = [
  { categoria: "Alimentos", cantidad: 420 },
  { categoria: "Bebidas", cantidad: 310 },
  { categoria: "Limpieza", cantidad: 180 },
  { categoria: "Electronica", cantidad: 150 },
  { categoria: "Oficina", cantidad: 90 },
]

const recentMovements = [
  { id: "MOV-001", producto: "Cafe Britt 500g", tipo: "Entrada", cantidad: 50, fecha: "Hoy, 14:30", usuario: "Maria L." },
  { id: "MOV-002", producto: "Detergente Irex 1L", tipo: "Salida", cantidad: 25, fecha: "Hoy, 13:15", usuario: "Carlos R." },
  { id: "MOV-003", producto: "Arroz Tio Pelon 1kg", tipo: "Entrada", cantidad: 100, fecha: "Hoy, 11:00", usuario: "Maria L." },
  { id: "MOV-004", producto: "Leche Dos Pinos 1L", tipo: "Salida", cantidad: 40, fecha: "Hoy, 10:45", usuario: "Ana S." },
  { id: "MOV-005", producto: "Jabon Palmolive", tipo: "Salida", cantidad: 15, fecha: "Ayer, 17:30", usuario: "Carlos R." },
]

const lowStockProducts = [
  { nombre: "Frijoles Ducal 400g", stock: 8, minimo: 20 },
  { nombre: "Azucar Dona Maria 1kg", stock: 12, minimo: 30 },
  { nombre: "Aceite Clover 750ml", stock: 5, minimo: 15 },
]

function CustomTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload) return null
  return (
    <div className="glass-card rounded-lg p-3 text-xs">
      <p className="text-foreground font-medium mb-1">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-muted-foreground">
          <span style={{ color: item.color }}>{item.dataKey === "entradas" ? "Entradas" : item.dataKey === "salidas" ? "Salidas" : item.dataKey}</span>: {item.value}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
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
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3 text-green-400" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-400" />
                    )}
                    <span
                      className={`text-xs ${
                        stat.trend === "up" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs mes anterior</span>
                  </div>
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
            <CardTitle className="text-sm font-medium">Movimientos de Inventario</CardTitle>
            <CardDescription>Entradas vs salidas en los ultimos 7 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={inventoryTrend}>
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 280)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="categoria" type="category" tick={{ fill: "oklch(0.6 0.01 280)", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltipContent />} />
                  <Bar dataKey="cantidad" fill="oklch(0.72 0.19 310)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Movements */}
        <Card className="lg:col-span-2 glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Movimientos Recientes</CardTitle>
            <CardDescription>Ultimas entradas y salidas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-xs">ID</TableHead>
                  <TableHead className="text-xs">Producto</TableHead>
                  <TableHead className="text-xs">Tipo</TableHead>
                  <TableHead className="text-xs text-right">Cantidad</TableHead>
                  <TableHead className="text-xs">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMovements.map((mov) => (
                  <TableRow key={mov.id} className="border-border/20">
                    <TableCell className="text-xs font-mono text-muted-foreground">{mov.id}</TableCell>
                    <TableCell className="text-xs text-foreground">{mov.producto}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          mov.tipo === "Entrada"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {mov.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right text-foreground">{mov.cantidad}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{mov.fecha}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            <div className="flex flex-col gap-4">
              {lowStockProducts.map((product) => {
                const percentage = (product.stock / product.minimo) * 100
                return (
                  <div key={product.nombre} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground">{product.nombre}</span>
                      <span className="text-xs text-muted-foreground">
                        {product.stock}/{product.minimo}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage < 40 ? "bg-red-400" : "bg-amber-400"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import useSWR from "swr"
import { BarChart3, TrendingUp, Package, DollarSign, Loader2, AlertTriangle, Download, FileSpreadsheet, X } from "lucide-react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
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
import { useTranslation } from "@/hooks/useTranslation"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function ReportesPage() {
  const { t } = useTranslation()
  const [periodo, setPeriodo] = useState("7m")
  const [clienteId, setClienteId] = useState<string | null>(null)
  const [proveedorId, setProveedorId] = useState<string | null>(null)
  const [clienteSearch, setClienteSearch] = useState("")
  const [proveedorSearch, setProveedorSearch] = useState("")

  const { data: clientesData } = useSWR("/api/clientes", fetcher)
  const { data: proveedoresData } = useSWR("/api/proveedores", fetcher)

  const queryParams = new URLSearchParams()
  queryParams.set("periodo", periodo)
  if (clienteId) queryParams.set("cliente", clienteId)
  if (proveedorId) queryParams.set("proveedor", proveedorId)

  const { data, error, isLoading } = useSWR(`/api/reportes?${queryParams.toString()}`, fetcher, {
    refreshInterval: 60000,
  })

  const clientes = clientesData?.clientes || []
  const proveedores = proveedoresData?.proveedores || []

  const clienteFiltrado = clientes.find((c: any) => c.id === clienteId)
  const proveedorFiltrado = proveedores.find((p: any) => p.id === proveedorId)

  const clientesFiltrados = clientes.filter(
    (c: any) => c.nombre.toLowerCase().includes(clienteSearch.toLowerCase()) && c.id !== clienteId
  )
  const proveedoresFiltrados = proveedores.filter(
    (p: any) => p.nombre.toLowerCase().includes(proveedorSearch.toLowerCase()) && p.id !== proveedorId
  )

  const kpis = data?.kpis || { valorInventario: 0, skusActivos: 0, rotacion: "0.0x / mes" }
  const monthlyTrend = data?.monthlyTrend || []
  const categoryDistribution = data?.categoryDistribution || []
  const topProducts = data?.topProducts || []

  const handleExport = (tipo: string) => {
    const params = new URLSearchParams()
    params.set("periodo", periodo)
    params.set("export", tipo)
    if (clienteId) params.set("cliente", clienteId)
    if (proveedorId) params.set("proveedor", proveedorId)
    window.open(`/api/reportes?${params.toString()}`, "_blank")
  }

  const CustomTooltipContent = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ value: number; dataKey: string; color: string }>
    label?: string
  }) => {
    if (!active || !payload) return null
    return (
      <div className="glass-card rounded-lg p-3 text-xs">
        <p className="text-foreground font-medium mb-1">{label}</p>
        {payload.map((item, i) => (
          <p key={i} className="text-muted-foreground">
            {item.dataKey === "entradas" ? t("reports.entries") : item.dataKey === "salidas" ? t("reports.exits") : item.dataKey}: {item.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("reports.loading")}</p>
        </div>
      </div>
    )
  }

  if (error || data?.error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-muted-foreground">{t("reports.error")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("reports.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("reports.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-44 bg-secondary/50 border-border/30 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card border-border/30">
              <SelectItem value="30d">{t("reports.last30days")}</SelectItem>
              <SelectItem value="3m">{t("reports.last3months")}</SelectItem>
              <SelectItem value="7m">{t("reports.last7months")}</SelectItem>
              <SelectItem value="1y">{t("reports.lastYear")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Cliente Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setClienteSearch("")}
              className="px-3 py-2 text-sm bg-secondary/50 border border-border/30 rounded hover:bg-secondary/70 flex items-center gap-2"
            >
              {clienteFiltrado ? (
                <>
                  <span>{clienteFiltrado.nombre}</span>
                  <X className="h-3.5 w-3.5 cursor-pointer" onClick={(e) => { e.stopPropagation(); setClienteId(null) }} />
                </>
              ) : (
                t("reports.allCustomers")
              )}
            </button>
            {clienteFiltrado ? null : (
              <input
                type="text"
                placeholder={t("reports.searchCustomer")}
                value={clienteSearch}
                onChange={(e) => setClienteSearch(e.target.value)}
                className="absolute z-50 top-10 left-0 w-48 px-3 py-2 text-sm bg-[oklch(0.13_0.015_280)] border border-border/30 rounded shadow-lg"
              />
            )}
            {!clienteFiltrado && clienteSearch && clientesFiltrados.length > 0 && (
              <div className="absolute z-50 top-20 left-0 w-48 bg-[oklch(0.13_0.015_280)] border border-border/30 rounded shadow-lg max-h-40 overflow-y-auto">
                {clientesFiltrados.map((c: any) => (
                  <button key={c.id} type="button" onClick={() => { setClienteId(c.id); setClienteSearch("") }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent/20 transition-colors">
                    {c.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Proveedor Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProveedorSearch("")}
              className="px-3 py-2 text-sm bg-secondary/50 border border-border/30 rounded hover:bg-secondary/70 flex items-center gap-2"
            >
              {proveedorFiltrado ? (
                <>
                  <span>{proveedorFiltrado.nombre}</span>
                  <X className="h-3.5 w-3.5 cursor-pointer" onClick={(e) => { e.stopPropagation(); setProveedorId(null) }} />
                </>
              ) : (
                t("reports.allSuppliers")
              )}
            </button>
            {proveedorFiltrado ? null : (
              <input
                type="text"
                placeholder={t("reports.searchSupplier")}
                value={proveedorSearch}
                onChange={(e) => setProveedorSearch(e.target.value)}
                className="absolute z-50 top-10 left-0 w-48 px-3 py-2 text-sm bg-[oklch(0.13_0.015_280)] border border-border/30 rounded shadow-lg"
              />
            )}
            {!proveedorFiltrado && proveedorSearch && proveedoresFiltrados.length > 0 && (
              <div className="absolute z-50 top-20 left-0 w-48 bg-[oklch(0.13_0.015_280)] border border-border/30 rounded shadow-lg max-h-40 overflow-y-auto">
                {proveedoresFiltrados.map((p: any) => (
                  <button key={p.id} type="button" onClick={() => { setProveedorId(p.id); setProveedorSearch("") }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent/20 transition-colors">
                    {p.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border/30 gap-2 text-sm">
                <Download className="h-4 w-4" />
                {t("reports.export")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-border/30">
              <DropdownMenuLabel className="text-xs text-muted-foreground">{t("reports.exportToExcel")}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/30" />
              <DropdownMenuItem onClick={() => handleExport("inventario")} className="text-sm cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 mr-2" />{t("reports.exportInventory")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("movimientos")} className="text-sm cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 mr-2" />{t("reports.exportMovements")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("categorias")} className="text-sm cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 mr-2" />{t("reports.exportCategories")}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/30" />
              <DropdownMenuItem onClick={() => handleExport("resumen")} className="text-sm cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 mr-2" />{t("reports.exportSummary")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <p className="text-xs text-muted-foreground">{t("reports.kpiInventoryValue")}</p>
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
                <p className="text-xs text-muted-foreground">{t("reports.kpiRotation")}</p>
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
                <p className="text-xs text-muted-foreground">{t("reports.kpiActiveSKUs")}</p>
                <p className="text-xl font-bold text-foreground">{kpis.skusActivos.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("reports.chartMonthly")}</CardTitle>
            <CardDescription>{t("reports.chartMonthlyDesc")}</CardDescription>
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
                  {t("reports.noMovementsData")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("reports.chartByCategory")}</CardTitle>
            <CardDescription>{t("reports.chartByCategoryDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {categoryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {categoryDistribution.map((entry: { color: string }, index: number) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null
                        return (
                          <div className="glass-card rounded-lg p-2 text-xs">
                            <p className="text-foreground">{payload[0].name}: {payload[0].value} {t("reports.products")}</p>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  {t("reports.noProductsData")}
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
            {t("reports.chartTopProducts")}
          </CardTitle>
          <CardDescription>{t("reports.chartTopProductsDesc")}</CardDescription>
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
                {t("reports.noRotationData")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Download,
  Plus,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Movimiento {
  id: string
  creado_en: string
  producto: string
  sku: string | null
  tipo: string
  cantidad: number
  stock_antes: number
  stock_despues: number
  motivo: string | null
}

interface Producto {
  id: string
  nombre: string
  sku: string | null
  stock: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

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

export default function MovimientosPage() {
  const [tipo, setTipo] = useState("todos")
  const [periodo, setPeriodo] = useState("30d")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    id_producto: "",
    tipo: "entrada",
    cantidad: "",
    motivo: "",
  })

  const apiUrl = `/api/movimientos?tipo=${tipo}&periodo=${periodo}`
  const { data, error, isLoading } = useSWR(apiUrl, fetcher, { refreshInterval: 15000 })
  const { data: prodData } = useSWR("/api/productos", fetcher)

  const movimientos: Movimiento[] = data?.movimientos || []
  const stats = data?.stats || { entradas: 0, salidas: 0, neto: 0, total: 0 }
  const productos: Producto[] = prodData?.productos || []

  const handleExportCSV = () => {
    window.open(`/api/movimientos?tipo=${tipo}&periodo=${periodo}&export=csv`, "_blank")
  }

  const handleSubmit = async () => {
    if (!formData.id_producto || !formData.cantidad) return
    setSaving(true)

    try {
      const res = await fetch("/api/movimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        mutate(apiUrl)
        mutate("/api/productos")
        setDialogOpen(false)
        setFormData({ id_producto: "", tipo: "entrada", cantidad: "", motivo: "" })
      }
    } catch (err) {
      console.error("Error creating movement:", err)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando movimientos...</p>
        </div>
      </div>
    )
  }

  if (error || data?.error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-muted-foreground">Error al cargar movimientos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Movimientos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Historial de entradas y salidas de inventario.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Movimiento
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/30 sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Movimiento</DialogTitle>
                <DialogDescription>
                  Agrega una entrada o salida de inventario.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label className="text-xs">Producto</Label>
                  <Select
                    value={formData.id_producto}
                    onValueChange={(val) => setFormData({ ...formData, id_producto: val })}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border/30">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border/30 max-h-60">
                      {productos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nombre} {p.sku ? `(${p.sku})` : ""} - Stock: {p.stock}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs">Tipo</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(val) => setFormData({ ...formData, tipo: val })}
                    >
                      <SelectTrigger className="bg-secondary/50 border-border/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-border/30">
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="salida">Salida</SelectItem>
                        <SelectItem value="ajuste_positivo">Ajuste +</SelectItem>
                        <SelectItem value="ajuste_negativo">Ajuste -</SelectItem>
                        <SelectItem value="devolucion_venta">Dev. Venta</SelectItem>
                        <SelectItem value="devolucion_compra">Dev. Compra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                      className="bg-secondary/50 border-border/30"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Motivo (opcional)</Label>
                  <Textarea
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    className="bg-secondary/50 border-border/30 min-h-[80px]"
                    placeholder="Ej: Reabastecimiento semanal"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border/30">
                  Cancelar
                </Button>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleSubmit}
                  disabled={saving || !formData.id_producto || !formData.cantidad}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Registrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="border-border/30 gap-2 text-sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-border/30">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <ArrowDownLeft className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Entradas</p>
                <p className="text-xl font-bold text-foreground">{stats.entradas.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <ArrowUpRight className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salidas</p>
                <p className="text-xl font-bold text-foreground">{stats.salidas.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ArrowLeftRight className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Neto</p>
                <p className="text-xl font-bold text-foreground">
                  {stats.neto >= 0 ? "+" : ""}{stats.neto.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-36 bg-secondary/50 border-border/30 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-card border-border/30">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="entradas">Entradas</SelectItem>
            <SelectItem value="salidas">Salidas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-40 bg-secondary/50 border-border/30 text-sm">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-card border-border/30">
            <SelectItem value="1d">Hoy</SelectItem>
            <SelectItem value="7d">Ultimos 7 dias</SelectItem>
            <SelectItem value="30d">Ultimos 30 dias</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="glass-card border-border/30">
        <CardContent className="pt-6">
          {movimientos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-xs">Producto</TableHead>
                  <TableHead className="text-xs">Tipo</TableHead>
                  <TableHead className="text-xs text-right">Cantidad</TableHead>
                  <TableHead className="text-xs text-right">Stock</TableHead>
                  <TableHead className="text-xs">Fecha</TableHead>
                  <TableHead className="text-xs">Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientos.map((mov) => {
                  const movType = formatMovementType(mov.tipo)
                  return (
                    <TableRow key={mov.id} className="border-border/20">
                      <TableCell className="text-xs text-foreground font-medium">
                        {mov.producto}
                        {mov.sku && <span className="text-muted-foreground ml-1">({mov.sku})</span>}
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
                      <TableCell className="text-xs text-right text-foreground">{mov.cantidad}</TableCell>
                      <TableCell className="text-xs text-right text-muted-foreground">
                        {mov.stock_antes} → {mov.stock_despues}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(mov.creado_en).toLocaleDateString("es-CR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                        {mov.motivo || "—"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              No hay movimientos registrados en este periodo.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

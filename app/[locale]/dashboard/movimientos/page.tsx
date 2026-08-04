"use client"

import { useState, useRef, useEffect } from "react"
import useSWR, { mutate } from "swr"
import Image from "next/image"
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Download,
  Plus,
  Loader2,
  AlertTriangle,
  Search,
  User,
  Truck,
  Upload,
  X,
  FileText,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
import { cn } from "@/lib/utils"

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
  id_cliente: string | null
  cliente_nombre: string | null
  cliente_apellido: string | null
  id_proveedor: string | null
  proveedor_nombre: string | null
  comprobante_url: string | null
}

interface Producto {
  id: string
  nombre: string
  sku: string | null
  stock: number
}

interface Cliente {
  id: string
  nombre: string
  apellido: string | null
  correo: string | null
}

interface Proveedor {
  id: string
  nombre: string
  correo: string | null
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

// Componente de búsqueda con lupa para cliente/proveedor
function SearchableSelect({
  items,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  renderItem,
  renderSelected,
  icon: Icon,
}: {
  items: { id: string; label: string; sublabel?: string }[]
  value: string
  onChange: (val: string) => void
  placeholder: string
  searchPlaceholder: string
  renderItem: (item: { id: string; label: string; sublabel?: string }) => React.ReactNode
  renderSelected: (item: { id: string; label: string; sublabel?: string }) => React.ReactNode
  icon: React.ElementType
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  const selected = items.find((i) => i.id === value)
  const filtered = items.filter(
    (i) =>
      i.label.toLowerCase().includes(search.toLowerCase()) ||
      i.sublabel?.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors outline-none",
          "border-border/30 bg-secondary/50 text-foreground hover:bg-secondary/70",
          open && "ring-1 ring-ring/50 border-ring/50"
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className={cn(!selected && "text-muted-foreground")}>
            {selected ? renderSelected(selected) : placeholder}
          </span>
        </div>
        {selected && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange("")
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border/40 bg-[oklch(0.13_0.015_280)] shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border/20">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                autoFocus
                className="w-full pl-7 pr-2 py-1.5 text-sm bg-[oklch(0.18_0.02_280)] border border-border/30 rounded text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/50"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false)
                    setSearch("")
                  }
                }}
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => {
                onChange("")
                setOpen(false)
                setSearch("")
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-accent/20 transition-colors",
                !value && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              Sin asignar
            </button>

            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onChange(item.id)
                  setOpen(false)
                  setSearch("")
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-accent/20 transition-colors",
                  item.id === value && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {renderItem(item)}
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">Sin resultados</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function MovimientosPage() {
  const [tipo, setTipo] = useState("todos")
  const [periodo, setPeriodo] = useState("30d")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroCliente, setFiltroCliente] = useState("")
  const [filtroProveedor, setFiltroProveedor] = useState("")
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    id_producto: "",
    tipo: "entrada",
    cantidad: "",
    motivo: "",
    id_cliente: "",
    id_proveedor: "",
    comprobante_url: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Build API URL with filters
  let apiUrl = `/api/movimientos?tipo=${tipo}&periodo=${periodo}`
  if (filtroCliente) apiUrl += `&cliente=${filtroCliente}`
  if (filtroProveedor) apiUrl += `&proveedor=${filtroProveedor}`
  if (searchTerm) apiUrl += `&search=${encodeURIComponent(searchTerm)}`

  const { data, error, isLoading } = useSWR(apiUrl, fetcher, { refreshInterval: 15000 })
  const { data: prodData } = useSWR("/api/productos", fetcher)
  const { data: clientesData } = useSWR("/api/clientes", fetcher)
  const { data: proveedoresData } = useSWR("/api/proveedores", fetcher)

  const movimientos: Movimiento[] = data?.movimientos || []
  const stats = data?.stats || { entradas: 0, salidas: 0, neto: 0, total: 0 }
  const productos: Producto[] = prodData?.productos || []
  const clientes: Cliente[] = clientesData?.clientes || []
  const proveedores: Proveedor[] = proveedoresData?.proveedores || []

  const clienteItems = clientes.map((c) => ({
    id: c.id,
    label: `${c.nombre} ${c.apellido || ""}`.trim(),
    sublabel: c.correo || undefined,
  }))

  const proveedorItems = proveedores.map((p) => ({
    id: p.id,
    label: p.nombre,
    sublabel: p.correo || undefined,
  }))

  const handleExportCSV = () => {
    window.open(`/api/movimientos?tipo=${tipo}&periodo=${periodo}&export=csv`, "_blank")
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)

      const res = await fetch("/api/upload/comprobante", {
        method: "POST",
        body: formDataUpload,
      })

      if (res.ok) {
        const { url } = await res.json()
        setFormData((prev) => ({ ...prev, comprobante_url: url }))
      } else {
        const err = await res.json()
        alert(err.error || "Error al subir archivo")
      }
    } catch (err) {
      console.error("Error uploading file:", err)
      alert("Error al subir archivo")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async () => {
    if (!formData.id_producto || !formData.cantidad) return
    setSaving(true)

    try {
      const res = await fetch("/api/movimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id_cliente: formData.id_cliente || null,
          id_proveedor: formData.id_proveedor || null,
          comprobante_url: formData.comprobante_url || null,
        }),
      })

      if (res.ok) {
        mutate(apiUrl)
        mutate("/api/productos")
        setDialogOpen(false)
        setFormData({
          id_producto: "",
          tipo: "entrada",
          cantidad: "",
          motivo: "",
          id_cliente: "",
          id_proveedor: "",
          comprobante_url: "",
        })
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
            <DialogContent className="glass-card border-border/30 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar Movimiento</DialogTitle>
                <DialogDescription>
                  Agrega una entrada o salida de inventario con cliente, proveedor o comprobante opcional.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid gap-2">
                  <Label className="text-xs">Producto *</Label>
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
                    <Label className="text-xs">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(val) => setFormData({ ...formData, tipo: val })}
                    >
                      <SelectTrigger className="bg-secondary/50 border-border/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-border/30">
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="salida">Salida (Venta)</SelectItem>
                        <SelectItem value="ajuste_positivo">Ajuste +</SelectItem>
                        <SelectItem value="ajuste_negativo">Ajuste -</SelectItem>
                        <SelectItem value="devolucion_venta">Dev. Venta</SelectItem>
                        <SelectItem value="devolucion_compra">Dev. Compra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Cantidad *</Label>
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

                {/* Cliente (opcional) */}
                <div className="grid gap-2">
                  <Label className="text-xs">Cliente (opcional)</Label>
                  <SearchableSelect
                    items={clienteItems}
                    value={formData.id_cliente}
                    onChange={(val) => setFormData({ ...formData, id_cliente: val })}
                    placeholder="Buscar cliente..."
                    searchPlaceholder="Buscar por nombre o correo..."
                    icon={User}
                    renderItem={(item) => (
                      <div>
                        <div className="font-medium">{item.label}</div>
                        {item.sublabel && <div className="text-xs text-muted-foreground">{item.sublabel}</div>}
                      </div>
                    )}
                    renderSelected={(item) => item.label}
                  />
                </div>

                {/* Proveedor (opcional) */}
                <div className="grid gap-2">
                  <Label className="text-xs">Proveedor (opcional)</Label>
                  <SearchableSelect
                    items={proveedorItems}
                    value={formData.id_proveedor}
                    onChange={(val) => setFormData({ ...formData, id_proveedor: val })}
                    placeholder="Buscar proveedor..."
                    searchPlaceholder="Buscar por nombre o correo..."
                    icon={Truck}
                    renderItem={(item) => (
                      <div>
                        <div className="font-medium">{item.label}</div>
                        {item.sublabel && <div className="text-xs text-muted-foreground">{item.sublabel}</div>}
                      </div>
                    )}
                    renderSelected={(item) => item.label}
                  />
                </div>

                {/* Comprobante */}
                <div className="grid gap-2">
                  <Label className="text-xs">Comprobante (opcional)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-border/30 gap-2 flex-1"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {formData.comprobante_url ? "Cambiar archivo" : "Subir foto o PDF"}
                    </Button>
                    {formData.comprobante_url && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setFormData({ ...formData, comprobante_url: "" })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {formData.comprobante_url && (
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <FileText className="h-3.5 w-3.5" />
                      Archivo cargado
                      <a
                        href={formData.comprobante_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-green-300"
                      >
                        Ver
                      </a>
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs">Motivo (opcional)</Label>
                  <Textarea
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    className="bg-secondary/50 border-border/30 min-h-[80px]"
                    placeholder="Ej: Reabastecimiento semanal, Venta a cliente..."
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
            Exportar
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
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar producto, cliente, proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/30"
          />
        </div>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-32 bg-secondary/50 border-border/30 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-card border-border/30">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="entradas">Entradas</SelectItem>
            <SelectItem value="salidas">Salidas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-36 bg-secondary/50 border-border/30 text-sm">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-card border-border/30">
            <SelectItem value="1d">Hoy</SelectItem>
            <SelectItem value="7d">Últimos 7 días</SelectItem>
            <SelectItem value="30d">Últimos 30 días</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroCliente} onValueChange={setFiltroCliente}>
          <SelectTrigger className="w-40 bg-secondary/50 border-border/30 text-sm">
            <User className="h-3.5 w-3.5 mr-1" />
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent className="glass-card border-border/30 max-h-60">
            <SelectItem value="todos">Todos los clientes</SelectItem>
            {clientes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nombre} {c.apellido || ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroProveedor} onValueChange={setFiltroProveedor}>
          <SelectTrigger className="w-40 bg-secondary/50 border-border/30 text-sm">
            <Truck className="h-3.5 w-3.5 mr-1" />
            <SelectValue placeholder="Proveedor" />
          </SelectTrigger>
          <SelectContent className="glass-card border-border/30 max-h-60">
            <SelectItem value="todos">Todos los proveedores</SelectItem>
            {proveedores.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="glass-card border-border/30">
        <CardContent className="pt-6">
          {movimientos.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs">Producto</TableHead>
                    <TableHead className="text-xs">Tipo</TableHead>
                    <TableHead className="text-xs text-right">Cantidad</TableHead>
                    <TableHead className="text-xs text-right">Stock</TableHead>
                    <TableHead className="text-xs">Cliente/Proveedor</TableHead>
                    <TableHead className="text-xs">Fecha</TableHead>
                    <TableHead className="text-xs">Comprobante</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimientos.map((mov) => {
                    const movType = formatMovementType(mov.tipo)
                    const clienteNombre = mov.cliente_nombre
                      ? `${mov.cliente_nombre} ${mov.cliente_apellido || ""}`.trim()
                      : null
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
                        <TableCell className="text-xs">
                          {clienteNombre && (
                            <div className="flex items-center gap-1 text-blue-400">
                              <User className="h-3 w-3" />
                              {clienteNombre}
                            </div>
                          )}
                          {mov.proveedor_nombre && (
                            <div className="flex items-center gap-1 text-amber-400">
                              <Truck className="h-3 w-3" />
                              {mov.proveedor_nombre}
                            </div>
                          )}
                          {!clienteNombre && !mov.proveedor_nombre && (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(mov.creado_en).toLocaleDateString("es-CR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-xs">
                          {mov.comprobante_url ? (
                            <a
                              href={mov.comprobante_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <FileText className="h-3 w-3" />
                              Ver
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              No hay movimientos registrados en este período.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

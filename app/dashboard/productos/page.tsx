"use client"

import { useState, useRef, useEffect } from "react"
import useSWR, { mutate } from "swr"
import {
  Package,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  ChevronDown,
  Check,
  PenLine,
  Truck,
  Home,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Categoria {
  id: string
  nombre: string
}

interface Producto {
  id: string
  nombre: string
  sku: string | null
  stock: number
  stock_minimo: number
  precio_costo: number
  precio_venta: number
  activo: boolean
  id_categoria: string | null
  categoria: Categoria | null
  es_propio: boolean
}

interface Proveedor {
  id: string
  nombre: string
  correo: string | null
}

interface ProductoProveedor {
  id: string
  id_proveedor: string
  precio_compra: number | null
  es_principal: boolean
  proveedor: Proveedor
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function getStatusInfo(stock: number, stock_minimo: number) {
  if (stock === 0) return { label: "Agotado", className: "bg-red-500/10 text-red-400 border-red-500/20" }
  if (stock <= stock_minimo) return { label: "Stock Bajo", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
  return { label: "Disponible", className: "bg-green-500/10 text-green-400 border-green-500/20" }
}

// Combobox de categoría con opción de escribir una propia
function CategoriaCombobox({
  categorias,
  value,
  onChange,
  onCategoriaCreada,
}: {
  categorias: Categoria[]
  value: string
  onChange: (val: string) => void
  onCategoriaCreada: (cat: Categoria) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [creando, setCreando] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = categorias.find((c) => c.id === value)
  const filtradas = categorias.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  )
  const searchTrimmed = search.trim()
  const existeExacta = categorias.some(
    (c) => c.nombre.toLowerCase() === searchTrimmed.toLowerCase()
  )
  const mostrarCrear = searchTrimmed.length > 0 && !existeExacta

  // Cerrar al hacer click fuera
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

  const handleCrear = async () => {
    if (!searchTrimmed) return
    setCreando(true)
    try {
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: searchTrimmed }),
      })
      if (res.ok) {
        const { categoria } = await res.json()
        onCategoriaCreada(categoria)
        onChange(categoria.id)
        setOpen(false)
        setSearch("")
      }
    } finally {
      setCreando(false)
    }
  }

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
        <span className={cn(!selected && "text-muted-foreground")}>
          {selected ? selected.nombre : "Seleccionar o crear..."}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border/40 bg-[oklch(0.13_0.015_280)] shadow-xl overflow-hidden">
          {/* Buscador / escritura libre */}
          <div className="p-2 border-b border-border/20">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                autoFocus
                className="w-full pl-7 pr-2 py-1.5 text-sm bg-[oklch(0.18_0.02_280)] border border-border/30 rounded text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/50"
                placeholder="Buscar o escribir nueva..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && mostrarCrear) handleCrear()
                  if (e.key === "Escape") { setOpen(false); setSearch("") }
                }}
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto py-1">
            {/* Opcion "Sin categoria" */}
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); setSearch("") }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-accent/20 transition-colors",
                !value && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {!value && <Check className="h-3.5 w-3.5 shrink-0" />}
              <span className={!value ? "" : "pl-5"}>Sin categoria</span>
            </button>

            {filtradas.map((cat) => {
              const isSelected = cat.id === value
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { onChange(cat.id); setOpen(false); setSearch("") }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-accent/20 transition-colors",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {isSelected
                    ? <Check className="h-3.5 w-3.5 shrink-0" />
                    : <span className="w-3.5 shrink-0" />
                  }
                  {cat.nombre}
                </button>
              )
            })}

            {filtradas.length === 0 && !mostrarCrear && (
              <p className="px-3 py-2 text-xs text-muted-foreground">Sin resultados</p>
            )}

            {/* Crear nueva categoria */}
            {mostrarCrear && (
              <button
                type="button"
                onClick={handleCrear}
                disabled={creando}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left border-t border-border/20 text-primary hover:bg-primary/10 transition-colors"
              >
                {creando
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                  : <PenLine className="h-3.5 w-3.5 shrink-0" />
                }
                Crear &quot;{searchTrimmed}&quot;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

  )
}

// Componente para gestionar proveedores del producto
function ProveedoresSection({
  proveedoresSeleccionados,
  setProveedoresSeleccionados,
  proveedoresData,
  formData,
}: {
  proveedoresSeleccionados: Array<{ id: string; nombre: string; precio_compra: string; es_principal: boolean }>
  setProveedoresSeleccionados: (val: any) => void
  proveedoresData: any
  formData: any
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const proveedoresDisponibles = (proveedoresData?.proveedores || []).filter(
    (p: any) => !proveedoresSeleccionados.some((ps) => ps.id === p.id)
  )
  const filtrados = proveedoresDisponibles.filter((p: any) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const handleAgregar = (proveedor: any) => {
    setProveedoresSeleccionados([
      ...proveedoresSeleccionados,
      { id: proveedor.id, nombre: proveedor.nombre, precio_compra: "", es_principal: false },
    ])
    setSearch("")
    setOpen(false)
  }

  const handleRemover = (id: string) => {
    setProveedoresSeleccionados(proveedoresSeleccionados.filter((p) => p.id !== id))
  }

  const handleActualizar = (id: string, campo: string, valor: any) => {
    setProveedoresSeleccionados(
      proveedoresSeleccionados.map((p) =>
        p.id === id ? { ...p, [campo]: valor } : p
      )
    )
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs">Proveedores</Label>
          <p className="text-xs text-muted-foreground">Asocia proveedores a este producto (opcional)</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.es_propio}
            onChange={(e) => {}}
            className="w-4 h-4"
          />
          <span className="text-xs">Producto propio</span>
        </label>
      </div>

      {proveedoresSeleccionados.length > 0 && (
        <div className="space-y-2 bg-secondary/30 rounded p-2">
          {proveedoresSeleccionados.map((prov) => (
            <div key={prov.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prov.es_principal}
                onChange={(e) => handleActualizar(prov.id, "es_principal", e.target.checked)}
                className="w-4 h-4"
                title="Proveedor principal"
              />
              <span className="text-xs flex-1">{prov.nombre}</span>
              <input
                type="number"
                placeholder="Precio compra"
                value={prov.precio_compra}
                onChange={(e) => handleActualizar(prov.id, "precio_compra", e.target.value)}
                className="w-24 h-8 text-xs bg-secondary/50 border border-border/30 rounded px-2"
              />
              <button
                type="button"
                onClick={() => handleRemover(prov.id)}
                className="text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!formData.es_propio && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="w-full text-left px-3 py-2 text-sm bg-secondary/50 border border-border/30 rounded hover:bg-secondary/70 flex items-center justify-between"
          >
            <span className="text-muted-foreground">Agregar proveedor...</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {open && proveedoresDisponibles.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-[oklch(0.13_0.015_280)] border border-border/30 rounded shadow-lg">
              <input
                type="text"
                placeholder="Buscar proveedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-secondary/50 border-b border-border/20 rounded-t"
                autoFocus
              />
              <div className="max-h-40 overflow-y-auto">
                {filtrados.map((prov: any) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => handleAgregar(prov)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent/20 transition-colors"
                  >
                    {prov.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {open && proveedoresDisponibles.length === 0 && (
            <div className="absolute z-50 w-full mt-1 bg-[oklch(0.13_0.015_280)] border border-border/30 rounded shadow-lg p-3">
              <p className="text-xs text-muted-foreground text-center">No hay proveedores disponibles</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProductosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todas")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [saving, setSaving] = useState(false)
  const [extraCategorias, setExtraCategorias] = useState<Categoria[]>([])
  const [formData, setFormData] = useState({
    nombre: "",
    sku: "",
    id_categoria: "",
    stock: "0",
    stock_minimo: "0",
    precio_costo: "0",
    precio_venta: "0",
    es_propio: true,
  })
  const [proveedoresSeleccionados, setProveedoresSeleccionados] = useState<
    Array<{ id: string; nombre: string; precio_compra: string; es_principal: boolean }>
  >([])
  const [proveedorSearch, setProveedorSearch] = useState("")
  const [proveedoresOpen, setProveedoresOpen] = useState(false)

  const { data: proveedoresData } = useSWR("/api/proveedores", fetcher)

  const apiUrl = `/api/productos?search=${encodeURIComponent(searchQuery)}&categoria=${selectedCategory}`
  const { data, error, isLoading } = useSWR(apiUrl, fetcher, { refreshInterval: 30000 })
  const { data: catData, mutate: mutateCategorias } = useSWR("/api/categorias", fetcher)

  const productos: Producto[] = data?.productos || []
  const categoriasBase: Categoria[] = catData?.categorias || []
  // Merge con categorias recien creadas (evitar duplicados)
  const categorias: Categoria[] = [
    ...categoriasBase,
    ...extraCategorias.filter((e) => !categoriasBase.find((b) => b.id === e.id)),
  ]

  const resetForm = () => {
    setFormData({
      nombre: "",
      sku: "",
      id_categoria: "",
      stock: "0",
      stock_minimo: "0",
      precio_costo: "0",
      precio_venta: "0",
      es_propio: true,
    })
    setProveedoresSeleccionados([])
    setEditingProduct(null)
  }

  const openEditDialog = (product: Producto) => {
    setEditingProduct(product)
    setFormData({
      nombre: product.nombre,
      sku: product.sku || "",
      id_categoria: product.id_categoria || "",
      stock: product.stock.toString(),
      stock_minimo: product.stock_minimo.toString(),
      precio_costo: product.precio_costo.toString(),
      precio_venta: product.precio_venta.toString(),
      es_propio: product.es_propio,
    })
    setProveedoresSeleccionados([])
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) return
    setSaving(true)

    try {
      const method = editingProduct ? "PUT" : "POST"
      const body = editingProduct
        ? { id: editingProduct.id, ...formData }
        : formData

      const res = await fetch("/api/productos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const { producto } = await res.json()

        // Guardar proveedores asociados
        if (proveedoresSeleccionados.length > 0) {
          await Promise.all(
            proveedoresSeleccionados.map((prov) =>
              fetch("/api/producto-proveedor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id_producto: producto.id,
                  id_proveedor: prov.id,
                  precio_compra: prov.precio_compra ? parseFloat(prov.precio_compra) : null,
                  es_principal: prov.es_principal,
                }),
              })
            )
          )
        }

        mutate(apiUrl)
        setDialogOpen(false)
        resetForm()
      }
    } catch (err) {
      console.error("Error saving product:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estas seguro de eliminar este producto?")) return

    try {
      const res = await fetch(`/api/productos?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        mutate(apiUrl)
      }
    } catch (err) {
      console.error("Error deleting product:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error || data?.error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-muted-foreground">Error al cargar productos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona todos los productos de tu inventario.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/30 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Modifica los datos del producto." : "Agrega un nuevo producto a tu inventario."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs">Nombre del Producto</Label>
                <Input
                  id="name"
                  placeholder="Ej: Cafe Britt 500g"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="bg-secondary/50 border-border/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sku" className="text-xs">SKU</Label>
                  <Input
                    id="sku"
                    placeholder="CB-500"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="bg-secondary/50 border-border/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Categoria</Label>
                  <CategoriaCombobox
                    categorias={categorias}
                    value={formData.id_categoria}
                    onChange={(val) => setFormData({ ...formData, id_categoria: val })}
                    onCategoriaCreada={(cat) => {
                      setExtraCategorias((prev) => [...prev, cat])
                      mutateCategorias()
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock" className="text-xs">Stock Inicial</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="bg-secondary/50 border-border/30"
                    disabled={!!editingProduct}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="min" className="text-xs">Stock Minimo</Label>
                  <Input
                    id="min"
                    type="number"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                    className="bg-secondary/50 border-border/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="costo" className="text-xs">Precio Costo</Label>
                  <Input
                    id="costo"
                    type="number"
                    value={formData.precio_costo}
                    onChange={(e) => setFormData({ ...formData, precio_costo: e.target.value })}
                    className="bg-secondary/50 border-border/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="venta" className="text-xs">Precio Venta</Label>
                  <Input
                    id="venta"
                    type="number"
                    value={formData.precio_venta}
                    onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                    className="bg-secondary/50 border-border/30"
                  />
                </div>
              </div>

              <div className="border-t border-border/20 pt-4">
                <ProveedoresSection
                  proveedoresSeleccionados={proveedoresSeleccionados}
                  setProveedoresSeleccionados={setProveedoresSeleccionados}
                  proveedoresData={proveedoresData}
                  formData={formData}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="border-border/30">
                Cancelar
              </Button>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSubmit}
                disabled={saving || !formData.nombre.trim()}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingProduct ? "Guardar Cambios" : "Guardar Producto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="glass-card border-border/30">
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50 border-border/30 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-secondary/50 border-border/30 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-border/30">
                  <SelectItem value="todas">Todas</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Inventario ({productos.length} productos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-xs">SKU</TableHead>
                  <TableHead className="text-xs">Producto</TableHead>
                  <TableHead className="text-xs">Categoria</TableHead>
                  <TableHead className="text-xs text-right">Stock</TableHead>
                  <TableHead className="text-xs text-right">Precio Venta</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((product) => {
                  const status = getStatusInfo(product.stock, product.stock_minimo)
                  return (
                    <TableRow key={product.id} className="border-border/20">
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {product.sku || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-foreground font-medium">
                        {product.nombre}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] bg-secondary/50">
                          {product.categoria?.nombre || "Sin categoria"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right text-foreground">
                        {product.stock}
                      </TableCell>
                      <TableCell className="text-xs text-right text-foreground">
                        {"\u20A1"}{product.precio_venta.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-[10px] ${status.className}`}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary/50 transition-colors">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              <span className="sr-only">Acciones</span>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="glass-card border-border/30" align="end">
                            <DropdownMenuItem className="text-xs gap-2" onClick={() => openEditDialog(product)}>
                              <Edit className="h-3.5 w-3.5" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs gap-2 text-red-400" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="h-3.5 w-3.5" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              No hay productos registrados. Crea el primero haciendo clic en &quot;Nuevo Producto&quot;.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

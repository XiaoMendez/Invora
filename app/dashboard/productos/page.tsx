"use client"

import { useState } from "react"
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
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function getStatusInfo(stock: number, stock_minimo: number) {
  if (stock === 0) return { label: "Agotado", className: "bg-red-500/10 text-red-400 border-red-500/20" }
  if (stock <= stock_minimo) return { label: "Stock Bajo", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
  return { label: "Disponible", className: "bg-green-500/10 text-green-400 border-green-500/20" }
}

export default function ProductosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todas")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    sku: "",
    id_categoria: "",
    stock_minimo: "0",
    precio_costo: "0",
    precio_venta: "0",
  })

  const apiUrl = `/api/productos?search=${encodeURIComponent(searchQuery)}&categoria=${selectedCategory}`
  const { data, error, isLoading } = useSWR(apiUrl, fetcher, { refreshInterval: 30000 })
  const { data: catData } = useSWR("/api/categorias", fetcher)

  const productos: Producto[] = data?.productos || []
  const categorias: Categoria[] = catData?.categorias || []

  const resetForm = () => {
    setFormData({
      nombre: "",
      sku: "",
      id_categoria: "",
        stock_minimo: "0",
      precio_costo: "0",
      precio_venta: "0",
    })
    setEditingProduct(null)
  }

  const openEditDialog = (product: Producto) => {
    setEditingProduct(product)
    setFormData({
      nombre: product.nombre,
      sku: product.sku || "",
      id_categoria: product.id_categoria || "",
      stock_minimo: product.stock_minimo.toString(),
      precio_costo: product.precio_costo.toString(),
      precio_venta: product.precio_venta.toString(),
    })
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
                  <Label htmlFor="category" className="text-xs">Categoria</Label>
                  <Select
                    value={formData.id_categoria}
                    onValueChange={(val) => setFormData({ ...formData, id_categoria: val })}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border/30">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border/30">
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

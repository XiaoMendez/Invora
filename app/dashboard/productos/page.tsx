"use client"

import { useState } from "react"
import {
  Package,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

interface Product {
  id: string
  nombre: string
  sku: string
  categoria: string
  stock: number
  minimo: number
  precio: number
  estado: "Disponible" | "Stock Bajo" | "Agotado"
}

const products: Product[] = [
  { id: "PRD-001", nombre: "Cafe Britt Clasico 500g", sku: "CB-500", categoria: "Alimentos", stock: 85, minimo: 20, precio: 5200, estado: "Disponible" },
  { id: "PRD-002", nombre: "Arroz Tio Pelon 1kg", sku: "ATP-1K", categoria: "Alimentos", stock: 120, minimo: 30, precio: 1450, estado: "Disponible" },
  { id: "PRD-003", nombre: "Frijoles Ducal 400g", sku: "FD-400", categoria: "Alimentos", stock: 8, minimo: 20, precio: 980, estado: "Stock Bajo" },
  { id: "PRD-004", nombre: "Detergente Irex 1L", sku: "DI-1L", categoria: "Limpieza", stock: 45, minimo: 15, precio: 3200, estado: "Disponible" },
  { id: "PRD-005", nombre: "Leche Dos Pinos 1L", sku: "LDP-1L", categoria: "Bebidas", stock: 0, minimo: 25, precio: 1100, estado: "Agotado" },
  { id: "PRD-006", nombre: "Azucar Dona Maria 1kg", sku: "ADM-1K", categoria: "Alimentos", stock: 12, minimo: 30, precio: 1650, estado: "Stock Bajo" },
  { id: "PRD-007", nombre: "Jabon Palmolive 100g", sku: "JP-100", categoria: "Limpieza", stock: 55, minimo: 20, precio: 750, estado: "Disponible" },
  { id: "PRD-008", nombre: "Aceite Clover 750ml", sku: "AC-750", categoria: "Alimentos", stock: 5, minimo: 15, precio: 2800, estado: "Stock Bajo" },
  { id: "PRD-009", nombre: "Jugo Del Valle 1L", sku: "JDV-1L", categoria: "Bebidas", stock: 72, minimo: 20, precio: 1350, estado: "Disponible" },
  { id: "PRD-010", nombre: "Papel Higienico Scott x4", sku: "PHS-4", categoria: "Limpieza", stock: 30, minimo: 10, precio: 2100, estado: "Disponible" },
]

const categories = ["Todas", "Alimentos", "Bebidas", "Limpieza", "Electronica", "Oficina"]

function getStatusColor(estado: string) {
  switch (estado) {
    case "Disponible":
      return "bg-green-500/10 text-green-400 border-green-500/20"
    case "Stock Bajo":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20"
    case "Agotado":
      return "bg-red-500/10 text-red-400 border-red-500/20"
    default:
      return ""
  }
}

export default function ProductosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Todas" || p.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/30 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar Producto</DialogTitle>
              <DialogDescription>
                Agrega un nuevo producto a tu inventario.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs">Nombre del Producto</Label>
                <Input id="name" placeholder="Ej: Cafe Britt 500g" className="bg-secondary/50 border-border/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sku" className="text-xs">SKU</Label>
                  <Input id="sku" placeholder="CB-500" className="bg-secondary/50 border-border/30" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category" className="text-xs">Categoria</Label>
                  <Select>
                    <SelectTrigger className="bg-secondary/50 border-border/30">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border/30">
                      {categories.slice(1).map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock" className="text-xs">Stock Inicial</Label>
                  <Input id="stock" type="number" placeholder="0" className="bg-secondary/50 border-border/30" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="min" className="text-xs">Stock Minimo</Label>
                  <Input id="min" type="number" placeholder="10" className="bg-secondary/50 border-border/30" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price" className="text-xs">Precio (CRC)</Label>
                  <Input id="price" type="number" placeholder="0" className="bg-secondary/50 border-border/30" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border/30">
                Cancelar
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setDialogOpen(false)}>
                Guardar Producto
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
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
            Inventario ({filtered.length} productos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-xs">SKU</TableHead>
                <TableHead className="text-xs">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Producto <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-xs">Categoria</TableHead>
                <TableHead className="text-xs text-right">Stock</TableHead>
                <TableHead className="text-xs text-right">Precio</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
                <TableHead className="text-xs w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id} className="border-border/20">
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {product.sku}
                  </TableCell>
                  <TableCell className="text-xs text-foreground font-medium">
                    {product.nombre}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] bg-secondary/50">
                      {product.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-right text-foreground">
                    {product.stock}
                  </TableCell>
                  <TableCell className="text-xs text-right text-foreground">
                    {"\u20A1"}{product.precio.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${getStatusColor(product.estado)}`}>
                      {product.estado}
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
                        <DropdownMenuItem className="text-xs gap-2">
                          <Eye className="h-3.5 w-3.5" /> Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs gap-2">
                          <Edit className="h-3.5 w-3.5" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs gap-2 text-red-400">
                          <Trash2 className="h-3.5 w-3.5" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

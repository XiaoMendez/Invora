"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import {
  Truck,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Proveedor {
  id: string
  nombre: string
  email: string | null
  telefono: string | null
  direccion: string | null
  notas: string | null
  activo: boolean
  creado_en: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProveedoresPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    notas: "",
  })

  const apiUrl = `/api/proveedores?search=${encodeURIComponent(searchQuery)}`
  const { data, error, isLoading } = useSWR(apiUrl, fetcher, { refreshInterval: 30000 })

  const proveedores: Proveedor[] = data?.proveedores || []

  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      direccion: "",
      notas: "",
    })
    setEditingProveedor(null)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) resetForm()
  }

  const openEditDialog = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor)
    setFormData({
      nombre: proveedor.nombre,
      email: proveedor.email || "",
      telefono: proveedor.telefono || "",
      direccion: proveedor.direccion || "",
      notas: proveedor.notas || "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) return
    setSaving(true)

    try {
      const method = editingProveedor ? "PUT" : "POST"
      const body = editingProveedor
        ? { id: editingProveedor.id, ...formData }
        : formData

      const res = await fetch("/api/proveedores", {
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
      console.error("Error saving proveedor:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estas seguro de eliminar este proveedor?")) return

    try {
      const res = await fetch(`/api/proveedores?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        mutate(apiUrl)
      }
    } catch (err) {
      console.error("Error deleting proveedor:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando proveedores...</p>
        </div>
      </div>
    )
  }

  if (error || data?.error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-muted-foreground">Error al cargar proveedores</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proveedores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los proveedores de tu empresa.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/30 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProveedor ? "Editar Proveedor" : "Agregar Proveedor"}</DialogTitle>
              <DialogDescription>
                {editingProveedor ? "Modifica los datos del proveedor." : "Agrega un nuevo proveedor a tu lista."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre" className="text-xs">Nombre del Proveedor *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Distribuidora ABC"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="bg-secondary/50 border-border/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contacto@proveedor.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-secondary/50 border-border/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefono" className="text-xs">Telefono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="+506 8888-8888"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="bg-secondary/50 border-border/30"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="direccion" className="text-xs">Direccion</Label>
                <Input
                  id="direccion"
                  placeholder="San Jose, Costa Rica"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="bg-secondary/50 border-border/30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notas" className="text-xs">Notas</Label>
                <Textarea
                  id="notas"
                  placeholder="Notas adicionales sobre el proveedor..."
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="bg-secondary/50 border-border/30 resize-none"
                  rows={3}
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
                disabled={saving || !formData.nombre.trim()}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingProveedor ? "Guardar Cambios" : "Guardar Proveedor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Filter */}
      <Card className="glass-card border-border/30">
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o telefono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50 border-border/30 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proveedores Table */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            Lista de Proveedores ({proveedores.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proveedores.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-xs">Nombre</TableHead>
                  <TableHead className="text-xs">Contacto</TableHead>
                  <TableHead className="text-xs">Direccion</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {proveedores.map((proveedor) => (
                  <TableRow key={proveedor.id} className="border-border/20">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{proveedor.nombre}</span>
                        {proveedor.notas && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {proveedor.notas}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {proveedor.email && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{proveedor.email}</span>
                          </div>
                        )}
                        {proveedor.telefono && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{proveedor.telefono}</span>
                          </div>
                        )}
                        {!proveedor.email && !proveedor.telefono && (
                          <span className="text-xs text-muted-foreground">Sin contacto</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {proveedor.direccion ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{proveedor.direccion}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          proveedor.activo
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {proveedor.activo ? "Activo" : "Inactivo"}
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
                          <DropdownMenuItem className="text-xs gap-2" onClick={() => openEditDialog(proveedor)}>
                            <Edit className="h-3.5 w-3.5" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs gap-2 text-red-400" onClick={() => handleDelete(proveedor.id)}>
                            <Trash2 className="h-3.5 w-3.5" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              No hay proveedores registrados. Crea el primero haciendo clic en &quot;Nuevo Proveedor&quot;.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

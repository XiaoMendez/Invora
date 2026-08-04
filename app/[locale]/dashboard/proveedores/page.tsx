"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Edit2,
  Trash2,
  Plus,
  Search,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Check,
  X,
} from "lucide-react"

interface Proveedor {
  id: string
  id_empresa: string
  nombre: string
  telefono?: string
  correo?: string
  direccion?: string
  activo: boolean
  creado_en: string
  actualizado_en: string
}

interface FormData {
  nombre: string
  correo: string
  telefono: string
  direccion: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProveedoresPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [saving, setSaving] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
  })

  const { data: proveedoresData, mutate } = useSWR("/api/proveedores", fetcher)
  const proveedores = proveedoresData?.proveedores || []

  const filteredProveedores = proveedores.filter(
    (p: Proveedor) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telefono?.includes(searchTerm)
  )

  const resetForm = () => {
    setFormData({
      nombre: "",
      correo: "",
      telefono: "",
      direccion: "",
    })
    setEditingProveedor(null)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) resetForm()
  }

  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor)
    setFormData({
      nombre: proveedor.nombre,
      correo: proveedor.correo || "",
      telefono: proveedor.telefono || "",
      direccion: proveedor.direccion || "",
    })
    setDialogOpen(true)
  }

  const handleDeleteClick = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor)
    setAlertOpen(true)
  }

  const handleDelete = async () => {
    if (!editingProveedor) return

    try {
      const response = await fetch(`/api/proveedores?id=${editingProveedor.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        alert("Error: " + (error.error || "No se pudo eliminar"))
        return
      }

      await mutate()
      setAlertOpen(false)
      setEditingProveedor(null)
    } catch (error) {
      console.error("Error deleting proveedor:", error)
      alert("Error al eliminar proveedor")
    }
  }

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      alert("El nombre es requerido")
      return
    }

    setSaving(true)
    try {
      const url = editingProveedor ? `/api/proveedores?id=${editingProveedor.id}` : "/api/proveedores"
      const method = editingProveedor ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        alert("Error: " + (error.error || "No se pudo guardar"))
        return
      }

      await mutate()
      handleDialogOpenChange(false)
    } catch (error) {
      console.error("Error saving proveedor:", error)
      alert("Error al guardar proveedor")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proveedores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los proveedores de tu empresa.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setDialogOpen(true)
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Buscar Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o telefono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary/50 border-border/30"
            />
          </div>
        </CardContent>
      </Card>

      {/* Proveedores Table */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Lista de Proveedores ({filteredProveedores.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProveedores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay proveedores registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-xs font-semibold">Nombre</TableHead>
                    <TableHead className="text-xs font-semibold">Email</TableHead>
                    <TableHead className="text-xs font-semibold">Telefono</TableHead>
                    <TableHead className="text-xs font-semibold">Ubicacion</TableHead>
                    <TableHead className="text-xs font-semibold">Estado</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProveedores.map((proveedor: Proveedor) => (
                    <TableRow key={proveedor.id} className="border-border/30 hover:bg-secondary/50 transition">
                      <TableCell className="font-medium text-sm">{proveedor.nombre}</TableCell>
                      <TableCell className="text-sm">
                        {proveedor.correo ? (
                          <a
                            href={`mailto:${proveedor.correo}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Mail className="h-3 w-3" />
                            {proveedor.correo}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {proveedor.telefono ? (
                          <a
                            href={`tel:${proveedor.telefono}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            {proveedor.telefono}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {proveedor.direccion ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {proveedor.direccion}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge variant={proveedor.activo ? "default" : "secondary"}>
                          {proveedor.activo ? (
                            <span className="flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Activo
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <X className="h-3 w-3" />
                              Inactivo
                            </span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(proveedor)}
                            className="hover:bg-secondary"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(proveedor)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="glass-card border-border/30 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProveedor ? "Editar Proveedor" : "Agregar Proveedor"}</DialogTitle>
            <DialogDescription>
              {editingProveedor ? "Modifica los datos del proveedor." : "Agrega un nuevo proveedor a tu lista."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre" className="text-xs">
                Nombre del Proveedor *
              </Label>
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
                <Label htmlFor="correo" className="text-xs">
                  Email
                </Label>
                <Input
                  id="correo"
                  type="email"
                  placeholder="contacto@proveedor.com"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  className="bg-secondary/50 border-border/30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefono" className="text-xs">
                  Telefono
                </Label>
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
              <Label htmlFor="direccion" className="text-xs">
                Direccion
              </Label>
              <Input
                id="direccion"
                placeholder="San Jose, Costa Rica"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="bg-secondary/50 border-border/30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
              className="border-border/30"
            >
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

      {/* Alert Dialog para confirmar eliminacion */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className="glass-card border-border/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Proveedor</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar a <strong>{editingProveedor?.nombre}</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="border-border/30">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

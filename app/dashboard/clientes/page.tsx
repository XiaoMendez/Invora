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
  User,
} from "lucide-react"

interface Cliente {
  id: string
  id_empresa: string
  nombre: string
  apellido?: string
  correo?: string
  telefono?: string
  direccion?: string
  activo: boolean
  creado_en: string
  actualizado_en: string
}

interface FormData {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  direccion: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ClientesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [saving, setSaving] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    direccion: "",
  })

  const { data: clientesData, mutate } = useSWR("/api/clientes", fetcher)
  const clientes = clientesData?.clientes || []

  const filteredClientes = clientes.filter(
    (c: Cliente) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telefono?.includes(searchTerm)
  )

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      direccion: "",
    })
    setEditingCliente(null)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) resetForm()
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setFormData({
      nombre: cliente.nombre,
      apellido: cliente.apellido || "",
      correo: cliente.correo || "",
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
    })
    setDialogOpen(true)
  }

  const handleDeleteClick = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setAlertOpen(true)
  }

  const handleDelete = async () => {
    if (!editingCliente) return

    try {
      const response = await fetch(`/api/clientes?id=${editingCliente.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        alert("Error: " + (error.error || "No se pudo eliminar"))
        return
      }

      await mutate()
      setAlertOpen(false)
      setEditingCliente(null)
    } catch (error) {
      console.error("Error deleting cliente:", error)
      alert("Error al eliminar cliente")
    }
  }

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      alert("El nombre es requerido")
      return
    }

    setSaving(true)
    try {
      const url = editingCliente ? `/api/clientes?id=${editingCliente.id}` : "/api/clientes"
      const method = editingCliente ? "PUT" : "POST"

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
      console.error("Error saving cliente:", error)
      alert("Error al guardar cliente")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los clientes de tu empresa.
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
          Nuevo Cliente
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Buscar Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, apellido, email o telefono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary/50 border-border/30"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clientes Table */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Lista de Clientes ({filteredClientes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClientes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay clientes registrados</p>
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
                  {filteredClientes.map((cliente: Cliente) => (
                    <TableRow key={cliente.id} className="border-border/30 hover:bg-secondary/50 transition">
                      <TableCell className="font-medium text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {cliente.nombre}
                            {cliente.apellido && ` ${cliente.apellido}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {cliente.correo ? (
                          <a
                            href={`mailto:${cliente.correo}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Mail className="h-3 w-3" />
                            {cliente.correo}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {cliente.telefono ? (
                          <a
                            href={`tel:${cliente.telefono}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            {cliente.telefono}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {cliente.direccion ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {cliente.direccion}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge variant={cliente.activo ? "default" : "secondary"}>
                          {cliente.activo ? (
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
                            onClick={() => handleEdit(cliente)}
                            className="hover:bg-secondary"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(cliente)}
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
            <DialogTitle>{editingCliente ? "Editar Cliente" : "Agregar Cliente"}</DialogTitle>
            <DialogDescription>
              {editingCliente ? "Modifica los datos del cliente." : "Agrega un nuevo cliente a tu lista."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre" className="text-xs">
                  Nombre *
                </Label>
                <Input
                  id="nombre"
                  placeholder="Juan"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="bg-secondary/50 border-border/30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apellido" className="text-xs">
                  Apellido
                </Label>
                <Input
                  id="apellido"
                  placeholder="Perez"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="bg-secondary/50 border-border/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="correo" className="text-xs">
                  Email
                </Label>
                <Input
                  id="correo"
                  type="email"
                  placeholder="juan@example.com"
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
              {editingCliente ? "Guardar Cambios" : "Guardar Cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para confirmar eliminacion */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className="glass-card border-border/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar a <strong>{editingCliente?.nombre} {editingCliente?.apellido}</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialog>
            <AlertDialogCancel className="border-border/30">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialog>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

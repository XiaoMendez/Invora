'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import {
  Plus,
  Search,
  FileText,
  Truck,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type POStatus = 'borrador' | 'enviada' | 'confirmada' | 'entregada' | 'cancelada'

interface POItem {
  id?: string
  id_producto: string
  descripcion: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  producto?: { id: string; nombre: string; sku: string | null }
}

interface PurchaseOrder {
  id: string
  numero_po: string
  id_proveedor: string
  proveedor: { id: string; nombre: string } | null
  fecha_orden: string
  fecha_entrega_esperada: string | null
  estado: POStatus
  total: number
  notas: string | null
  creado_en: string
  ordenes_compra_items: POItem[]
}

interface FormState {
  id_proveedor: string
  fecha_entrega_esperada: string
  notas: string
  estado: POStatus
}

const STATUS_LABELS: Record<POStatus, string> = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  confirmada: 'Confirmada',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
}

const STATUS_COLORS: Record<POStatus, string> = {
  borrador: 'text-amber-400 bg-amber-500/10',
  enviada: 'text-blue-400 bg-blue-500/10',
  confirmada: 'text-green-400 bg-green-500/10',
  entregada: 'text-emerald-400 bg-emerald-500/10',
  cancelada: 'text-red-400 bg-red-500/10',
}

const EMPTY_ITEM = (): Omit<POItem, 'id' | 'subtotal' | 'producto'> => ({
  id_producto: '',
  descripcion: '',
  cantidad: 1,
  precio_unitario: 0,
})

export default function OrdenesCompraPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<POStatus | 'todas'>('todas')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: ordenesData, error: ordenesError, isLoading: ordenesLoading } = useSWR('/api/ordenes-compra', fetcher)
  const { data: proveedoresData } = useSWR('/api/proveedores', fetcher)
  const { data: productosData } = useSWR('/api/productos', fetcher)

  const ordenes: PurchaseOrder[] = ordenesData?.ordenes_compra || []
  const proveedores = proveedoresData?.proveedores || []
  const productos = productosData?.productos || []

  const [formData, setFormData] = useState<FormState>({
    id_proveedor: '',
    fecha_entrega_esperada: '',
    notas: '',
    estado: 'borrador',
  })
  const [items, setItems] = useState<Array<{ id_producto: string; descripcion: string; cantidad: number; precio_unitario: number }>>([
    EMPTY_ITEM(),
  ])

  const filteredOrdenes = ordenes.filter((o) => {
    const matchesSearch =
      o.numero_po.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.proveedor?.nombre || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'todas' || o.estado === filterStatus
    return matchesSearch && matchesStatus
  })

  const resetForm = () => {
    setFormData({ id_proveedor: '', fecha_entrega_esperada: '', notas: '', estado: 'borrador' })
    setItems([EMPTY_ITEM()])
    setEditingPO(null)
    setError(null)
  }

  const handleCreate = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleEdit = (po: PurchaseOrder) => {
    setEditingPO(po)
    setFormData({
      id_proveedor: po.id_proveedor,
      fecha_entrega_esperada: po.fecha_entrega_esperada || '',
      notas: po.notas || '',
      estado: po.estado,
    })
    setItems(
      po.ordenes_compra_items.length > 0
        ? po.ordenes_compra_items.map((i) => ({
            id_producto: i.id_producto,
            descripcion: i.descripcion || i.producto?.nombre || '',
            cantidad: i.cantidad,
            precio_unitario: i.precio_unitario,
          }))
        : [EMPTY_ITEM()]
    )
    setError(null)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta orden de compra?')) return
    try {
      const res = await fetch(`/api/ordenes-compra/${id}`, { method: 'DELETE' })
      if (res.ok) {
        mutate('/api/ordenes-compra')
      } else {
        const data = await res.json()
        alert(data.error || 'Error al eliminar')
      }
    } catch {
      alert('Error al eliminar la orden')
    }
  }

  const addItem = () => setItems([...items, EMPTY_ITEM()])

  const removeItem = (idx: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, field: string, value: any) => {
    const updated = items.map((item, i) => {
      if (i !== idx) return item
      const newItem = { ...item, [field]: value }
      // Auto-fill description when product is selected
      if (field === 'id_producto' && value) {
        const prod = productos.find((p: any) => p.id === value)
        if (prod) {
          newItem.descripcion = prod.nombre
          newItem.precio_unitario = parseFloat(prod.precio_costo) || 0
        }
      }
      return newItem
    })
    setItems(updated)
  }

  const totalCalculado = items.reduce(
    (sum, item) => sum + (item.cantidad || 0) * (item.precio_unitario || 0),
    0
  )

  const handleSave = async () => {
    if (!formData.id_proveedor) {
      setError('El proveedor es requerido')
      return
    }
    const itemsValidos = items.filter((i) => i.cantidad > 0 && i.precio_unitario >= 0)
    if (itemsValidos.length === 0) {
      setError('Agrega al menos un ítem con cantidad válida')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const method = editingPO ? 'PUT' : 'POST'
      const url = editingPO ? `/api/ordenes-compra/${editingPO.id}` : '/api/ordenes-compra'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fecha_entrega_esperada: formData.fecha_entrega_esperada || null,
          items: itemsValidos,
        }),
      })

      const result = await res.json()

      if (result.success) {
        mutate('/api/ordenes-compra')
        setDialogOpen(false)
        resetForm()
      } else {
        setError(result.error || 'Error al guardar la orden')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Ordenes de Compra
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona tus ordenes de compra a proveedores</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="h-4 w-4" />
          Nueva Orden
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="glass-card border-border/30">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por numero PO o proveedor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/30"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="w-44 bg-secondary/50 border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los estados</SelectItem>
                {(Object.keys(STATUS_LABELS) as POStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-card border-border/30">
        <CardContent className="p-0">
          {ordenesLoading ? (
            <div className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Cargando ordenes...</span>
            </div>
          ) : ordenesError ? (
            <div className="p-8 text-center text-sm text-red-400">Error al cargar ordenes</div>
          ) : filteredOrdenes.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">No hay ordenes de compra registradas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/30">
                  <TableHead className="text-xs">Numero PO</TableHead>
                  <TableHead className="text-xs">Proveedor</TableHead>
                  <TableHead className="text-xs">Fecha</TableHead>
                  <TableHead className="text-xs">Entrega Esperada</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrdenes.map((orden) => (
                  <TableRow key={orden.id} className="border-b border-border/20 hover:bg-secondary/30">
                    <TableCell className="text-sm font-mono">{orden.numero_po}</TableCell>
                    <TableCell className="text-sm">{orden.proveedor?.nombre || 'N/A'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(orden.fecha_orden).toLocaleDateString('es')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {orden.fecha_entrega_esperada
                        ? new Date(orden.fecha_entrega_esperada + 'T00:00:00').toLocaleDateString('es')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-right font-semibold">
                      ${Number(orden.total).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[orden.estado]}`}>
                        {STATUS_LABELS[orden.estado]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(orden)} className="gap-2 text-sm">
                            <Edit className="h-3.5 w-3.5" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(orden.id)} className="gap-2 text-sm text-red-400 focus:text-red-400">
                            <Trash2 className="h-3.5 w-3.5" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
        <DialogContent className="glass-card border-border/30 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPO ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}</DialogTitle>
            <DialogDescription>
              {editingPO ? `Editando ${editingPO.numero_po}` : 'Crea una nueva orden de compra para un proveedor'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Proveedor + Estado */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs">Proveedor *</Label>
                <Select value={formData.id_proveedor} onValueChange={(v) => setFormData({ ...formData, id_proveedor: v })}>
                  <SelectTrigger className="bg-secondary/50 border-border/30">
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Estado</Label>
                <Select value={formData.estado} onValueChange={(v: any) => setFormData({ ...formData, estado: v })}>
                  <SelectTrigger className="bg-secondary/50 border-border/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABELS) as POStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fecha entrega + Notas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs">Fecha de Entrega Esperada</Label>
                <Input
                  type="date"
                  value={formData.fecha_entrega_esperada}
                  onChange={(e) => setFormData({ ...formData, fecha_entrega_esperada: e.target.value })}
                  className="bg-secondary/50 border-border/30"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Notas</Label>
                <Input
                  placeholder="Observaciones..."
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="bg-secondary/50 border-border/30"
                />
              </div>
            </div>

            {/* Items */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Productos / Items</Label>
                <Button type="button" size="sm" variant="outline" onClick={addItem}
                  className="h-7 text-xs gap-1 border-border/30">
                  <Plus className="h-3 w-3" /> Agregar linea
                </Button>
              </div>

              <div className="border border-border/30 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/30 bg-secondary/30">
                      <TableHead className="text-xs py-2">Producto</TableHead>
                      <TableHead className="text-xs py-2 w-20">Cant.</TableHead>
                      <TableHead className="text-xs py-2 w-28">Precio Unit.</TableHead>
                      <TableHead className="text-xs py-2 w-24 text-right">Subtotal</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={idx} className="border-b border-border/20">
                        <TableCell className="py-1.5 pr-1">
                          <Select value={item.id_producto || '__none__'} onValueChange={(v) => updateItem(idx, 'id_producto', v === '__none__' ? '' : v)}>
                            <SelectTrigger className="h-8 text-xs bg-secondary/50 border-border/30">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">-- Sin producto --</SelectItem>
                              {productos.map((p: any) => (
                                <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {!item.id_producto && (
                            <Input
                              className="mt-1 h-7 text-xs bg-secondary/50 border-border/30"
                              placeholder="Descripcion..."
                              value={item.descripcion}
                              onChange={(e) => updateItem(idx, 'descripcion', e.target.value)}
                            />
                          )}
                        </TableCell>
                        <TableCell className="py-1.5 px-1">
                          <Input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => updateItem(idx, 'cantidad', parseInt(e.target.value) || 1)}
                            className="h-8 text-xs bg-secondary/50 border-border/30"
                          />
                        </TableCell>
                        <TableCell className="py-1.5 px-1">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.precio_unitario}
                            onChange={(e) => updateItem(idx, 'precio_unitario', parseFloat(e.target.value) || 0)}
                            className="h-8 text-xs bg-secondary/50 border-border/30"
                          />
                        </TableCell>
                        <TableCell className="py-1.5 text-right text-xs font-medium px-2">
                          ${((item.cantidad || 0) * (item.precio_unitario || 0)).toFixed(2)}
                        </TableCell>
                        <TableCell className="py-1.5 px-1">
                          <button type="button" onClick={() => removeItem(idx)}
                            disabled={items.length === 1}
                            className="p-1 text-muted-foreground hover:text-red-400 disabled:opacity-30">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end text-sm font-semibold pr-2">
                Total: ${totalCalculado.toFixed(2)}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="border-border/30">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingPO ? 'Guardar Cambios' : 'Crear Orden'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

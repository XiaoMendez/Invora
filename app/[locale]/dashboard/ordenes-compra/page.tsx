'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import {
  Plus,
  Search,
  FileText,
  Calendar,
  DollarSign,
  Truck,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useTranslation } from '@/hooks/useTranslation'
import { createClient } from '@/lib/supabase/client'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type POStatus = 'borrador' | 'enviada' | 'confirmada' | 'entregada' | 'cancelada'

interface PurchaseOrder {
  id: string
  numero_po: string
  id_proveedor: string
  proveedor: { nombre: string }
  fecha_orden: string
  fecha_entrega_esperada: string
  estado: POStatus
  total: number
  creado_en: string
  items: POItem[]
}

interface POItem {
  id: string
  id_producto: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export default function OrdernesCompraPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<POStatus | 'todas'>('todas')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null)

  const { data: ordenesData } = useSWR('/api/ordenes-compra', fetcher)
  const { data: proveedoresData } = useSWR('/api/proveedores?search=', fetcher)

  const ordenes = ordenesData?.ordenes_compra || []
  const proveedores = proveedoresData?.proveedores || []

  const [formData, setFormData] = useState({
    id_proveedor: '',
    fecha_entrega_esperada: '',
    items: [{ id_producto: '', cantidad: 0, precio_unitario: 0 }],
  })

  // Filter and search logic
  const filteredOrdenes = (ordenes || []).filter((o: PurchaseOrder) => {
    const matchesSearch = o.numero_po.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.proveedor?.nombre || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'todas' || o.estado === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleCreate = () => {
    setEditingPO(null)
    setFormData({
      id_proveedor: '',
      fecha_entrega_esperada: '',
      items: [{ id_producto: '', cantidad: 0, precio_unitario: 0 }],
    })
    setDialogOpen(true)
  }

  const handleEdit = (po: PurchaseOrder) => {
    setEditingPO(po)
    setFormData({
      id_proveedor: po.id_proveedor,
      fecha_entrega_esperada: po.fecha_entrega_esperada,
      items: po.items,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete'))) return

    try {
      const res = await fetch(`/api/ordenes-compra/${id}`, { method: 'DELETE' })
      if (res.ok) {
        mutate('/api/ordenes-compra')
        setSaveStatus({ success: true, message: t('common.deletedSuccess') })
      } else {
        setSaveStatus({ success: false, message: t('common.deletedError') })
      }
    } catch (err) {
      setSaveStatus({ success: false, message: t('common.error') })
    }
  }

  const handleSave = async () => {
    if (!formData.id_proveedor || !formData.fecha_entrega_esperada) {
      setSaveStatus({ success: false, message: t('common.requiredFields') })
      return
    }

    setLoading(true)
    setSaveStatus(null)

    try {
      const method = editingPO ? 'PUT' : 'POST'
      const url = editingPO ? `/api/ordenes-compra/${editingPO.id}` : '/api/ordenes-compra'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await res.json()

      if (result.success) {
        setSaveStatus({ success: true, message: editingPO ? t('common.updatedSuccess') : t('common.createdSuccess') })
        mutate('/api/ordenes-compra')
        setDialogOpen(false)
      } else {
        setSaveStatus({ success: false, message: result.error || t('common.error') })
      }
    } catch (err) {
      setSaveStatus({ success: false, message: t('common.error') })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: POStatus) => {
    const icons = {
      borrador: AlertCircle,
      enviada: Truck,
      confirmada: CheckCircle2,
      entregada: CheckCircle2,
      cancelada: AlertCircle,
    }
    return icons[status]
  }

  const getStatusColor = (status: POStatus) => {
    const colors = {
      borrador: 'text-amber-400 bg-amber-500/10',
      enviada: 'text-blue-400 bg-blue-500/10',
      confirmada: 'text-green-400 bg-green-500/10',
      entregada: 'text-emerald-400 bg-emerald-500/10',
      cancelada: 'text-red-400 bg-red-500/10',
    }
    return colors[status]
  }

  if (ordenesError) {
    return (
      <main className="relative min-h-screen">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-center text-muted-foreground">{t('common.error')}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Órdenes de Compra
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona todas tus órdenes de compra</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Orden
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número de orden o proveedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border/30"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
            <SelectTrigger className="w-40 bg-secondary/50 border-border/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos los estados</SelectItem>
              <SelectItem value="borrador">Borrador</SelectItem>
              <SelectItem value="enviada">Enviada</SelectItem>
              <SelectItem value="confirmada">Confirmada</SelectItem>
              <SelectItem value="entregada">Entregada</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <Card className="glass-card border-border/30">
          <CardContent className="p-0">
            {!ordenes ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Cargando órdenes...</p>
              </div>
            ) : filteredOrdenes.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No hay órdenes de compra registradas</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/30">
                    <TableHead className="text-xs">Número PO</TableHead>
                    <TableHead className="text-xs">Proveedor</TableHead>
                    <TableHead className="text-xs">Fecha</TableHead>
                    <TableHead className="text-xs text-right">Total</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                    <TableHead className="text-xs w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrdenes.map((orden: PurchaseOrder) => {
                    const StatusIcon = getStatusIcon(orden.estado)
                    return (
                      <TableRow key={orden.id} className="border-b border-border/20 hover:bg-secondary/30">
                        <TableCell className="text-sm font-mono">{orden.numero_po}</TableCell>
                        <TableCell className="text-sm">{orden.proveedor?.nombre || 'N/A'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(orden.fecha_orden).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-right font-semibold">
                          ${orden.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(orden.estado)}`}>
                            <StatusIcon className="h-3 w-3" />
                            {orden.estado}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(orden)} className="gap-2">
                                <Edit className="h-3.5 w-3.5" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(orden.id)} className="gap-2 text-red-400">
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
            )}
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="glass-card border-border/30 sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPO ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}</DialogTitle>
              <DialogDescription>
                {editingPO ? 'Modifica los detalles de la orden' : 'Crea una nueva orden de compra'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
              {saveStatus && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${saveStatus.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {saveStatus.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {saveStatus.message}
                </div>
              )}

              <div className="grid gap-2">
                <Label className="text-xs">Proveedor</Label>
                <Select value={formData.id_proveedor} onValueChange={(v) => setFormData({ ...formData, id_proveedor: v })}>
                  <SelectTrigger className="bg-secondary/50 border-border/30">
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {(proveedores || []).map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs">Fecha de Entrega Esperada</Label>
                <Input
                  type="date"
                  value={formData.fecha_entrega_esperada}
                  onChange={(e) => setFormData({ ...formData, fecha_entrega_esperada: e.target.value })}
                  className="bg-secondary/50 border-border/30"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border/30">
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Orden'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}

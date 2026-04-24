"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Download,
  ShoppingCart,
  Truck,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  id_venta?: string | null
  id_compra?: string | null
}

interface Producto {
  id: string
  nombre: string
  sku: string | null
  stock: number
  precio_costo: number
  precio_venta: number
}

interface Cliente {
  id: string
  nombre: string
  apellido: string | null
}

interface Proveedor {
  id: string
  nombre: string
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
  const [compraOpen, setCompraOpen] = useState(false)
  const [ventaOpen, setVentaOpen] = useState(false)
  const [savingCompra, setSavingCompra] = useState(false)
  const [savingVenta, setSavingVenta] = useState(false)
  const [compraForm, setCompraForm] = useState({ id_proveedor: "", id_producto: "", cantidad: "", precio_unitario: "" })
  const [ventaForm, setVentaForm] = useState({ id_cliente: "", id_producto: "", cantidad: "", precio_unitario: "" })

  const apiUrl = `/api/movimientos?tipo=${tipo}&periodo=${periodo}`
  const { data, error, isLoading } = useSWR(apiUrl, fetcher, { refreshInterval: 15000 })
  const { data: prodData } = useSWR("/api/productos", fetcher)
  const { data: clientesData } = useSWR("/api/clientes", fetcher)
  const { data: proveedoresData } = useSWR("/api/proveedores", fetcher)

  const movimientos: Movimiento[] = data?.movimientos || []
  const stats = data?.stats || { entradas: 0, salidas: 0, neto: 0, total: 0 }
  const productos: Producto[] = prodData?.productos || []
  const clientes: Cliente[] = clientesData?.clientes || []
  const proveedores: Proveedor[] = proveedoresData?.proveedores || []

  const handleExportCSV = () => {
    window.open(`/api/movimientos?tipo=${tipo}&periodo=${periodo}&export=csv`, "_blank")
  }

  const handleCompra = async () => {
    if (!compraForm.id_proveedor || !compraForm.id_producto || !compraForm.cantidad || !compraForm.precio_unitario) return
    setSavingCompra(true)
    try {
      const res = await fetch("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_proveedor: compraForm.id_proveedor,
          items: [{ id_producto: compraForm.id_producto, cantidad: Number(compraForm.cantidad), precio_unitario: Number(compraForm.precio_unitario) }],
        }),
      })
      if (res.ok) {
        mutate(apiUrl)
        mutate("/api/productos")
        setCompraOpen(false)
        setCompraForm({ id_proveedor: "", id_producto: "", cantidad: "", precio_unitario: "" })
      }
    } finally {
      setSavingCompra(false)
    }
  }

  const handleVenta = async () => {
    if (!ventaForm.id_cliente || !ventaForm.id_producto || !ventaForm.cantidad || !ventaForm.precio_unitario) return
    setSavingVenta(true)
    try {
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cliente: ventaForm.id_cliente,
          items: [{ id_producto: ventaForm.id_producto, cantidad: Number(ventaForm.cantidad), precio_unitario: Number(ventaForm.precio_unitario) }],
        }),
      })
      if (res.ok) {
        mutate(apiUrl)
        mutate("/api/productos")
        setVentaOpen(false)
        setVentaForm({ id_cliente: "", id_producto: "", cantidad: "", precio_unitario: "" })
      }
    } finally {
      setSavingVenta(false)
    }
  }

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (error || data?.error) return <div className="flex items-center justify-center min-h-[60vh]"><AlertTriangle className="h-8 w-8 text-amber-400" /></div>

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Movimientos</h1>
          <p className="text-sm text-muted-foreground mt-1">El inventario solo cambia por compras y ventas (no por ajustes manuales).</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={compraOpen} onOpenChange={setCompraOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Truck className="h-4 w-4" />Registrar Compra</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nueva compra</DialogTitle><DialogDescription>Debes seleccionar proveedor y producto.</DialogDescription></DialogHeader>
              <div className="grid gap-3">
                <Label>Proveedor</Label>
                <Select value={compraForm.id_proveedor} onValueChange={(v) => setCompraForm({ ...compraForm, id_proveedor: v })}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{proveedores.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}</SelectContent></Select>
                <Label>Producto</Label>
                <Select value={compraForm.id_producto} onValueChange={(v) => setCompraForm({ ...compraForm, id_producto: v })}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{productos.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}</SelectContent></Select>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Cantidad</Label><Input type="number" min="1" value={compraForm.cantidad} onChange={(e) => setCompraForm({ ...compraForm, cantidad: e.target.value })} /></div>
                  <div><Label>Precio</Label><Input type="number" min="0" value={compraForm.precio_unitario} onChange={(e) => setCompraForm({ ...compraForm, precio_unitario: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter><Button onClick={handleCompra} disabled={savingCompra || !compraForm.id_proveedor || !compraForm.id_producto || !compraForm.cantidad || !compraForm.precio_unitario}>{savingCompra ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Guardar compra</Button></DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={ventaOpen} onOpenChange={setVentaOpen}>
            <DialogTrigger asChild><Button variant="outline" className="gap-2"><ShoppingCart className="h-4 w-4" />Registrar Venta</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nueva venta</DialogTitle><DialogDescription>Debes seleccionar cliente y producto.</DialogDescription></DialogHeader>
              <div className="grid gap-3">
                <Label>Cliente</Label>
                <Select value={ventaForm.id_cliente} onValueChange={(v) => setVentaForm({ ...ventaForm, id_cliente: v })}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre} {c.apellido || ""}</SelectItem>)}</SelectContent></Select>
                <Label>Producto</Label>
                <Select value={ventaForm.id_producto} onValueChange={(v) => setVentaForm({ ...ventaForm, id_producto: v })}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{productos.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre} · Stock {p.stock}</SelectItem>)}</SelectContent></Select>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Cantidad</Label><Input type="number" min="1" value={ventaForm.cantidad} onChange={(e) => setVentaForm({ ...ventaForm, cantidad: e.target.value })} /></div>
                  <div><Label>Precio</Label><Input type="number" min="0" value={ventaForm.precio_unitario} onChange={(e) => setVentaForm({ ...ventaForm, precio_unitario: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter><Button onClick={handleVenta} disabled={savingVenta || !ventaForm.id_cliente || !ventaForm.id_producto || !ventaForm.cantidad || !ventaForm.precio_unitario}>{savingVenta ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Guardar venta</Button></DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="border-border/30 gap-2 text-sm" onClick={handleExportCSV}><Download className="h-4 w-4" />Exportar CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-0"><div className="flex items-center gap-3"><ArrowDownLeft className="h-5 w-5 text-green-400" /><div><p className="text-xs text-muted-foreground">Entradas</p><p className="text-xl font-bold text-foreground">{stats.entradas.toLocaleString()}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-0"><div className="flex items-center gap-3"><ArrowUpRight className="h-5 w-5 text-red-400" /><div><p className="text-xs text-muted-foreground">Salidas</p><p className="text-xl font-bold text-foreground">{stats.salidas.toLocaleString()}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-0"><div className="flex items-center gap-3"><ArrowLeftRight className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Neto</p><p className="text-xl font-bold text-foreground">{stats.neto >= 0 ? "+" : ""}{stats.neto.toLocaleString()}</p></div></div></CardContent></Card>
      </div>

      <div className="flex items-center gap-3">
        <Select value={tipo} onValueChange={setTipo}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="entradas">Entradas</SelectItem><SelectItem value="salidas">Salidas</SelectItem></SelectContent></Select>
        <Select value={periodo} onValueChange={setPeriodo}><SelectTrigger className="w-40"><Calendar className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1d">Hoy</SelectItem><SelectItem value="7d">Últimos 7 días</SelectItem><SelectItem value="30d">Últimos 30 días</SelectItem></SelectContent></Select>
      </div>

      <Card>
        <CardContent className="pt-0">
          <Table>
            <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Producto</TableHead><TableHead>Tipo</TableHead><TableHead>Cantidad</TableHead><TableHead>Stock</TableHead><TableHead>Documento</TableHead></TableRow></TableHeader>
            <TableBody>
              {movimientos.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No hay movimientos para mostrar</TableCell></TableRow> : movimientos.map((m) => {
                const typeInfo = formatMovementType(m.tipo)
                return <TableRow key={m.id}><TableCell>{new Date(m.creado_en).toLocaleString("es-CR")}</TableCell><TableCell>{m.producto}</TableCell><TableCell><Badge variant={typeInfo.variant === "entrada" ? "default" : "destructive"}>{typeInfo.label}</Badge></TableCell><TableCell>{m.cantidad}</TableCell><TableCell>{m.stock_antes} → {m.stock_despues}</TableCell><TableCell>{m.id_compra ? `Compra ${m.id_compra.slice(0, 8)}` : m.id_venta ? `Venta ${m.id_venta.slice(0, 8)}` : "-"}</TableCell></TableRow>
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

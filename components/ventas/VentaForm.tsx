"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Loader2, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Venta {
  id: string
  numero: number
  estado: string
  venta_detalle: Array<{
    id: string
    id_producto: string
    cantidad: number
    precio_unitario: number
    descuento: number
    subtotal: number
    producto: { nombre: string; sku: string }
  }>
  monto_total: number
}

interface VentaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  venta?: Venta | null
  onSuccess?: () => void
}

export function VentaForm({ open, onOpenChange, venta, onSuccess }: VentaFormProps) {
  const { data: clientesData } = useSWR("/api/clientes", fetcher)
  const { data: productosData } = useSWR("/api/productos", fetcher)

  const [loading, setLoading] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState("")
  const [selectedProducto, setSelectedProducto] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [precioUnitario, setPrecioUnitario] = useState("")
  const [descuento, setDescuento] = useState("0")
  const [detalles, setDetalles] = useState<Venta["venta_detalle"]>([])

  const clientes = clientesData?.clientes || []
  const productos = productosData?.productos || []

  useEffect(() => {
    if (venta) {
      setSelectedCliente(venta.id || "")
      setDetalles(venta.venta_detalle || [])
    }
  }, [venta])

  const handleAgregarProducto = () => {
    if (!selectedProducto || !cantidad || !precioUnitario) {
      alert("Completa todos los campos")
      return
    }

    const producto = productos.find((p: any) => p.id === selectedProducto)
    if (!producto) return

    const cantidadInt = parseInt(cantidad)
    if (cantidadInt > producto.stock) {
      alert(`Stock insuficiente. Disponible: ${producto.stock}`)
      return
    }

    const precioTotal = cantidadInt * parseFloat(precioUnitario)
    const descuentoNum = parseFloat(descuento) || 0
    const subtotal = precioTotal - descuentoNum

    const nuevoDetalle = {
      id: Math.random().toString(),
      id_producto: selectedProducto,
      cantidad: cantidadInt,
      precio_unitario: parseFloat(precioUnitario),
      descuento: descuentoNum,
      subtotal: subtotal,
      producto: { nombre: producto.nombre, sku: producto.sku },
    }

    setDetalles([...detalles, nuevoDetalle])
    setSelectedProducto("")
    setCantidad("")
    setPrecioUnitario("")
    setDescuento("0")
  }

  const handleEliminarDetalle = (id: string) => {
    setDetalles(detalles.filter((d) => d.id !== id))
  }

  const handleGuardar = async () => {
    if (detalles.length === 0) {
      alert("Agrega al menos un producto")
      return
    }

    setLoading(true)
    try {
      // Crear venta
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cliente: selectedCliente || null,
        }),
      })

      const { venta: nuevaVenta } = await res.json()
      if (!res.ok) throw new Error()

      // Agregar detalles
      for (const detalle of detalles) {
        await fetch(`/api/ventas/${nuevaVenta.id}/detalle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_producto: detalle.id_producto,
            cantidad: detalle.cantidad,
            precio_unitario: detalle.precio_unitario,
            descuento: detalle.descuento,
          }),
        })
      }

      onSuccess?.()
      onOpenChange(false)
      setDetalles([])
      setSelectedCliente("")
    } catch (error) {
      console.error("Error:", error)
      alert("Error al guardar la venta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva Venta</DialogTitle>
          <DialogDescription>Crea una nueva orden de venta</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seleccionar Cliente (Opcional) */}
          <div className="grid gap-2">
            <Label className="text-sm">Cliente (Opcional)</Label>
            <Select value={selectedCliente} onValueChange={setSelectedCliente}>
              <SelectTrigger className="bg-secondary/50 border-border/30">
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent className="glass-card border-border/30">
                <SelectItem value="">Sin cliente</SelectItem>
                {clientes.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Productos */}
          <div className="space-y-2">
            <Label className="text-sm">Agregar Productos</Label>
            <div className="grid grid-cols-12 gap-2">
              <Select value={selectedProducto} onValueChange={setSelectedProducto}>
                <SelectTrigger className="col-span-5 bg-secondary/50 border-border/30">
                  <SelectValue placeholder="Producto" />
                </SelectTrigger>
                <SelectContent className="glass-card border-border/30">
                  {productos
                    .filter((p: any) => p.stock > 0)
                    .map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre} (Stock: {p.stock})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="col-span-2.5 bg-secondary/50 border-border/30"
              />
              <Input
                type="number"
                placeholder="Precio"
                value={precioUnitario}
                onChange={(e) => setPrecioUnitario(e.target.value)}
                className="col-span-2.5 bg-secondary/50 border-border/30"
              />
              <Input
                type="number"
                placeholder="Descuento"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
                className="col-span-2 bg-secondary/50 border-border/30"
              />
            </div>
            <Button
              onClick={handleAgregarProducto}
              size="sm"
              variant="outline"
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Línea
            </Button>
          </div>

          {/* Detalle de Venta */}
          {detalles.length > 0 && (
            <div className="border border-border/30 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/30 bg-secondary/30">
                    <TableHead className="text-xs">Producto</TableHead>
                    <TableHead className="text-xs text-right">Cantidad</TableHead>
                    <TableHead className="text-xs text-right">Precio</TableHead>
                    <TableHead className="text-xs text-right">Descuento</TableHead>
                    <TableHead className="text-xs text-right">Subtotal</TableHead>
                    <TableHead className="text-xs w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalles.map((d) => (
                    <TableRow key={d.id} className="border-b border-border/20">
                      <TableCell className="text-xs py-2">{d.producto.nombre}</TableCell>
                      <TableCell className="text-xs text-right py-2">{d.cantidad}</TableCell>
                      <TableCell className="text-xs text-right py-2">
                        ${d.precio_unitario.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-right py-2">
                        ${d.descuento.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-right py-2 font-medium">
                        ${d.subtotal.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className="text-xs py-2 cursor-pointer hover:text-red-500"
                        onClick={() => handleEliminarDetalle(d.id)}
                      >
                        <X className="h-4 w-4" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="text-right font-medium">
            Total: ${detalles.reduce((s, d) => s + d.subtotal, 0).toFixed(2)}
          </div>

          {/* Botones */}
          <div className="flex gap-2 justify-end pt-4 border-t border-border/30">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              disabled={loading || detalles.length === 0}
              className="gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar Venta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

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

interface Compra {
  id: string
  numero: number
  estado: string
  compra_detalle: Array<{
    id: string
    id_producto: string
    cantidad: number
    precio_unitario: number
    subtotal: number
    producto: { nombre: string; sku: string }
  }>
  monto_total: number
}

interface CompraFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  compra?: Compra | null
  onSuccess?: () => void
}

export function CompraForm({ open, onOpenChange, compra, onSuccess }: CompraFormProps) {
  const { data: proveedoresData } = useSWR("/api/proveedores", fetcher)
  const { data: productosData } = useSWR("/api/productos", fetcher)

  const [loading, setLoading] = useState(false)
  const [selectedProveedor, setSelectedProveedor] = useState("__placeholder__")
  const [selectedProducto, setSelectedProducto] = useState("__placeholder__")
  const [cantidad, setCantidad] = useState("")
  const [precioUnitario, setPrecioUnitario] = useState("")
  const [detalles, setDetalles] = useState<Compra["compra_detalle"]>([])

  const proveedores = proveedoresData?.proveedores || []
  const productos = productosData?.productos || []

  useEffect(() => {
    if (compra) {
      setSelectedProveedor(compra.id || "")
      setDetalles(compra.compra_detalle || [])
    }
  }, [compra])

  const handleAgregarProducto = () => {
    if (!selectedProducto || !cantidad || !precioUnitario) {
      alert("Completa todos los campos")
      return
    }

    const producto = productos.find((p: any) => p.id === selectedProducto)
    if (!producto) return

    const nuevoDetalle = {
      id: Math.random().toString(),
      id_producto: selectedProducto,
      cantidad: parseInt(cantidad),
      precio_unitario: parseFloat(precioUnitario),
      subtotal: parseInt(cantidad) * parseFloat(precioUnitario),
      producto: { nombre: producto.nombre, sku: producto.sku },
    }

    setDetalles([...detalles, nuevoDetalle])
    setSelectedProducto("")
    setCantidad("")
    setPrecioUnitario("")
  }

  const handleEliminarDetalle = (id: string) => {
    setDetalles(detalles.filter((d) => d.id !== id))
  }

  const handleGuardar = async () => {
    if (!selectedProveedor) {
      alert("Selecciona un proveedor")
      return
    }

    if (detalles.length === 0) {
      alert("Agrega al menos un producto")
      return
    }

    setLoading(true)
    try {
      // Crear compra
      const res = await fetch("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_proveedor: selectedProveedor,
        }),
      })

      const { compra: nuevaCompra } = await res.json()
      if (!res.ok) throw new Error()

      // Agregar detalles
      for (const detalle of detalles) {
        await fetch(`/api/compras/${nuevaCompra.id}/detalle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_producto: detalle.id_producto,
            cantidad: detalle.cantidad,
            precio_unitario: detalle.precio_unitario,
          }),
        })
      }

      onSuccess?.()
      onOpenChange(false)
      setDetalles([])
      setSelectedProveedor("__placeholder__")
      setCantidad("")
      setPrecioUnitario("")
    } catch (error) {
      console.error("Error:", error)
      alert("Error al guardar la compra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva Compra</DialogTitle>
          <DialogDescription>Crea una nueva orden de compra</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seleccionar Proveedor */}
          <div className="grid gap-2">
            <Label className="text-sm">Proveedor</Label>
            <Select value={selectedProveedor} onValueChange={setSelectedProveedor}>
              <SelectTrigger className="bg-secondary/50 border-border/30">
                <SelectValue placeholder="Selecciona un proveedor" />
              </SelectTrigger>
              <SelectContent className="glass-card border-border/30">
                <SelectItem value="__placeholder__" disabled>
                  Selecciona un proveedor
                </SelectItem>
                {proveedores.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
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
                <SelectTrigger className="col-span-6 bg-secondary/50 border-border/30">
                  <SelectValue placeholder="Producto" />
                </SelectTrigger>
                <SelectContent className="glass-card border-border/30">
                  <SelectItem value="__placeholder__" disabled>
                    Selecciona un producto
                  </SelectItem>
                  {productos.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="col-span-3 bg-secondary/50 border-border/30"
              />
              <Input
                type="number"
                placeholder="Precio"
                value={precioUnitario}
                onChange={(e) => setPrecioUnitario(e.target.value)}
                className="col-span-3 bg-secondary/50 border-border/30"
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

          {/* Detalle de Compra */}
          {detalles.length > 0 && (
            <div className="border border-border/30 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/30 bg-secondary/30">
                    <TableHead className="text-xs">Producto</TableHead>
                    <TableHead className="text-xs text-right">Cantidad</TableHead>
                    <TableHead className="text-xs text-right">Precio</TableHead>
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
              disabled={loading || !selectedProveedor || detalles.length === 0}
              className="gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar Compra
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import useSWR from "swr"
import { Trash2, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Venta {
  id: string
  numero: number
  estado: "pendiente" | "completada" | "cancelada" | "anulada"
  subtotal: number
  descuento: number
  impuesto: number
  monto_total: number
  creado_en: string
  cliente?: { nombre: string } | null
  venta_detalle?: Array<{ id: string; cantidad: number; precio_unitario: number }>
}

interface VentasTableProps {
  onEdit?: (venta: Venta) => void
  onComplete?: (ventaId: string) => void
}

export function VentasTable({ onEdit, onComplete }: VentasTableProps) {
  const { data, isLoading, error } = useSWR("/api/ventas", fetcher, { refreshInterval: 5000 })
  const ventas: Venta[] = data?.ventas || []

  const estadoBadge = (estado: string) => {
    const variants: Record<string, string> = {
      pendiente: "bg-yellow-500/20 text-yellow-700 border-yellow-300/50",
      completada: "bg-green-500/20 text-green-700 border-green-300/50",
      cancelada: "bg-red-500/20 text-red-700 border-red-300/50",
      anulada: "bg-red-500/20 text-red-700 border-red-300/50",
    }
    return variants[estado] || "bg-gray-500/20 text-gray-700 border-gray-300/50"
  }

  return (
    <div className="rounded-lg border border-border/30 overflow-hidden">
      {isLoading ? (
        <div className="p-4 text-sm text-muted-foreground">Cargando ventas...</div>
      ) : error ? (
        <div className="p-4 text-sm text-red-500">Error al cargar ventas</div>
      ) : ventas.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <p>No hay ventas registradas</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/30">
              <TableHead className="w-20">Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-24">Estado</TableHead>
              <TableHead className="text-right w-32">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ventas.map((venta) => (
              <TableRow key={venta.id} className="border-b border-border/20 hover:bg-secondary/30">
                <TableCell className="font-medium">#{venta.numero}</TableCell>
                <TableCell>{venta.cliente?.nombre || "Cliente sin asignar"}</TableCell>
                <TableCell className="text-right">
                  ${venta.monto_total.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge className={`${estadoBadge(venta.estado)} border`}>
                    {venta.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    {venta.estado === "pendiente" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit?.(venta)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onComplete?.(venta.id)}
                          className="h-8 w-8 p-0 hover:bg-green-500/10"
                        >
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

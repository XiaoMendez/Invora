"use client"

import { useState } from "react"
import useSWR from "swr"
import { Trash2, Edit2, Check, X, Plus } from "lucide-react"
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
import { useTranslation } from "@/hooks/useTranslation"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Compra {
  id: string
  numero: number
  estado: "pendiente" | "recibida" | "cancelada"
  subtotal: number
  impuesto: number
  monto_total: number
  creado_en: string
  proveedor?: { nombre: string }
  compra_detalle?: Array<{ id: string; cantidad: number; precio_unitario: number }>
}

interface ComprasTableProps {
  onEdit?: (compra: Compra) => void
  onReceive?: (compraId: string) => void
}

export function ComprasTable({ onEdit, onReceive }: ComprasTableProps) {
  const { t } = useTranslation()
  const { data, isLoading, error } = useSWR("/api/compras", fetcher, { refreshInterval: 5000 })
  const compras: Compra[] = data?.compras || []

  const estadoBadge = (estado: string) => {
    const variants: Record<string, string> = {
      pendiente: "bg-yellow-500/20 text-yellow-700 border-yellow-300/50",
      recibida: "bg-green-500/20 text-green-700 border-green-300/50",
      cancelada: "bg-red-500/20 text-red-700 border-red-300/50",
    }
    return variants[estado] || "bg-gray-500/20 text-gray-700 border-gray-300/50"
  }

  return (
    <div className="rounded-lg border border-border/30 overflow-hidden">
      {isLoading ? (
        <div className="p-4 text-sm text-muted-foreground">{t("purchases.loading")}</div>
      ) : error ? (
        <div className="p-4 text-sm text-red-500">{t("purchases.error")}</div>
      ) : compras.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <p>{t("purchases.noPurchases")}</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/30">
              <TableHead className="w-20">{t("sales.colNumber")}</TableHead>
              <TableHead>{t("suppliers.title")}</TableHead>
              <TableHead className="text-right">{t("sales.colTotal")}</TableHead>
              <TableHead className="w-24">{t("sales.colStatus")}</TableHead>
              <TableHead className="text-right w-32">{t("sales.colActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {compras.map((compra) => (
              <TableRow key={compra.id} className="border-b border-border/20 hover:bg-secondary/30">
                <TableCell className="font-medium">#{compra.numero}</TableCell>
                <TableCell>{compra.proveedor?.nombre || t("common.unassigned")}</TableCell>
                <TableCell className="text-right">
                  ${compra.monto_total.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge className={`${estadoBadge(compra.estado)} border`}>
                    {compra.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    {compra.estado === "pendiente" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit?.(compra)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReceive?.(compra.id)}
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

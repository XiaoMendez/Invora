"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ComprasTable } from "@/components/compras/ComprasTable"
import { CompraForm } from "@/components/compras/CompraForm"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ComprasPage() {
  const [formOpen, setFormOpen] = useState(false)
  const { data: comprasData } = useSWR("/api/compras", fetcher, { refreshInterval: 5000 })

  const handleReceive = async (compraId: string) => {
    if (!confirm("¿Recibir esta compra? Esto actualizará automáticamente el inventario.")) {
      return
    }

    try {
      const res = await fetch(`/api/compras/${compraId}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "recibida" }),
      })

      if (res.ok) {
        mutate("/api/compras")
        alert("Compra recibida correctamente")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al recibir la compra")
    }
  }

  const compras = comprasData?.compras || []
  const pendientes = compras.filter((c: any) => c.estado === "pendiente").length
  const recibidas = compras.filter((c: any) => c.estado === "recibida").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compras</h1>
          <p className="text-muted-foreground">Gestiona todas tus órdenes de compra</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Compra
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-secondary/50 border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{compras.length}</div>
            <p className="text-xs text-muted-foreground">Todas las compras registradas</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50 border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendientes}</div>
            <p className="text-xs text-muted-foreground">Aguardando recepción</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50 border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recibidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{recibidas}</div>
            <p className="text-xs text-muted-foreground">Procesadas al inventario</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Compras */}
      <Card className="border-border/30">
        <CardHeader>
          <CardTitle>Órdenes de Compra</CardTitle>
          <CardDescription>Lista de todas tus compras, filtra por estado o proveedor</CardDescription>
        </CardHeader>
        <CardContent>
          <ComprasTable onReceive={handleReceive} />
        </CardContent>
      </Card>

      {/* Form Modal */}
      <CompraForm open={formOpen} onOpenChange={setFormOpen} onSuccess={() => mutate("/api/compras")} />
    </div>
  )
}

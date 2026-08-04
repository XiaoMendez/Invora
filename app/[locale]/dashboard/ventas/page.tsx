"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VentasTable } from "@/components/ventas/VentasTable"
import { VentaForm } from "@/components/ventas/VentaForm"
import { useTranslation } from "@/hooks/useTranslation"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function VentasPage() {
  const { t } = useTranslation()
  const [formOpen, setFormOpen] = useState(false)
  const { data: ventasData } = useSWR("/api/ventas", fetcher, { refreshInterval: 5000 })

  const handleComplete = async (ventaId: string) => {
    if (!confirm(t("sales.confirmComplete"))) return

    try {
      const res = await fetch(`/api/ventas/${ventaId}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "completada" }),
      })

      if (res.ok) {
        mutate("/api/ventas")
        alert(t("sales.confirmCompleted"))
      }
    } catch (error) {
      console.error("Error:", error)
      alert(t("sales.confirmError"))
    }
  }

  const ventas = ventasData?.ventas || []
  const pendientes = ventas.filter((v: any) => v.estado === "pendiente").length
  const completadas = ventas.filter((v: any) => v.estado === "completada").length
  const totalVentas = ventas
    .filter((v: any) => v.estado === "completada")
    .reduce((sum: number, v: any) => sum + v.monto_total, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("sales.title")}</h1>
          <p className="text-muted-foreground">{t("sales.subtitle")}</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("sales.new")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-secondary/50 border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("sales.statTotal")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ventas.length}</div>
            <p className="text-xs text-muted-foreground">{t("sales.statTotalDesc")}</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50 border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("sales.statPending")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendientes}</div>
            <p className="text-xs text-muted-foreground">{t("sales.statPendingDesc")}</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50 border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("sales.statCompleted")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completadas}</div>
            <p className="text-xs text-muted-foreground">{t("sales.statCompletedDesc")}</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50 border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("sales.statAmount")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalVentas.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">{t("sales.statAmountDesc")}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/30">
        <CardHeader>
          <CardTitle>{t("sales.tableTitle")}</CardTitle>
          <CardDescription>{t("sales.tableDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <VentasTable onComplete={handleComplete} />
        </CardContent>
      </Card>

      <VentaForm open={formOpen} onOpenChange={setFormOpen} onSuccess={() => mutate("/api/ventas")} />
    </div>
  )
}

"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ComprasTable } from "@/components/compras/ComprasTable"
import { CompraForm } from "@/components/compras/CompraForm"
import { useTranslation } from "@/hooks/useTranslation"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ComprasPage() {
  const { t } = useTranslation()
  const [formOpen, setFormOpen] = useState(false)
  const { data: comprasData } = useSWR("/api/compras", fetcher, { refreshInterval: 5000 })

  const handleReceive = async (compraId: string) => {
    if (!confirm(t("purchases.confirmReceive"))) return

    try {
      const res = await fetch(`/api/compras/${compraId}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "recibida" }),
      })

      if (res.ok) {
        mutate("/api/compras")
        alert(t("purchases.confirmReceived"))
      }
    } catch (error) {
      console.error("Error:", error)
      alert(t("purchases.confirmError"))
    }
  }

  const compras = comprasData?.compras || []
  const pendientes = compras.filter((c: any) => c.estado === "pendiente").length
  const recibidas = compras.filter((c: any) => c.estado === "recibida").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("purchases.title")}</h1>
          <p className="text-muted-foreground">{t("purchases.subtitle")}</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("purchases.new")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-secondary/50 border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("purchases.statTotal")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{compras.length}</div>
            <p className="text-xs text-muted-foreground">{t("purchases.statTotalDesc")}</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50 border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("purchases.statPending")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendientes}</div>
            <p className="text-xs text-muted-foreground">{t("purchases.statPendingDesc")}</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50 border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("purchases.statReceived")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{recibidas}</div>
            <p className="text-xs text-muted-foreground">{t("purchases.statReceivedDesc")}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/30">
        <CardHeader>
          <CardTitle>{t("purchases.tableTitle")}</CardTitle>
          <CardDescription>{t("purchases.tableDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ComprasTable onReceive={handleReceive} />
        </CardContent>
      </Card>

      <CompraForm open={formOpen} onOpenChange={setFormOpen} onSuccess={() => mutate("/api/compras")} />
    </div>
  )
}

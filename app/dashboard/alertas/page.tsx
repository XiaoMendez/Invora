"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Bell,
  AlertTriangle,
  XCircle,
  Clock,
  Mail,
  Loader2,
  Send,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Alerta {
  id: string
  tipo: "warning" | "critical"
  titulo: string
  descripcion: string
  producto: string
  sku: string | null
  stock: number
  stock_minimo: number
  faltante: number
  categoria: string | null
  leida: boolean
  fecha: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function getAlertIcon(tipo: Alerta["tipo"]) {
  switch (tipo) {
    case "critical":
      return <XCircle className="h-5 w-5 text-red-400" />
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-400" />
  }
}

function getAlertBadge(tipo: Alerta["tipo"]) {
  switch (tipo) {
    case "critical":
      return { label: "Critica", className: "bg-red-500/10 text-red-400 border-red-500/20" }
    case "warning":
      return { label: "Advertencia", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
  }
}

export default function AlertasPage() {
  const [sending, setSending] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{ success: boolean; message: string } | null>(null)

  const { data, error, isLoading } = useSWR("/api/alertas", fetcher, { refreshInterval: 30000 })

  const alertas: Alerta[] = data?.alertas || []
  const criticas = data?.criticas || 0
  const advertencias = data?.advertencias || 0
  const email = data?.email || ""

  const handleSendEmail = async () => {
    setSending(true)
    setEmailStatus(null)

    try {
      const res = await fetch("/api/alertas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_email_alerts" }),
      })

      const result = await res.json()

      if (result.success) {
        setEmailStatus({ success: true, message: result.message })
      } else {
        setEmailStatus({ success: false, message: result.error || result.message })
      }
    } catch (err) {
      setEmailStatus({ success: false, message: "Error al enviar alertas" })
    } finally {
      setSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando alertas...</p>
        </div>
      </div>
    )
  }

  if (error || data?.error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-muted-foreground">Error al cargar alertas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Alertas
            {alertas.length > 0 && (
              <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                {alertas.length} activas
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Notificaciones de stock bajo en tiempo real.
          </p>
        </div>
        <Button
          variant="outline"
          className="border-border/30 gap-2 text-sm"
          onClick={handleSendEmail}
          disabled={sending || alertas.length === 0}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Enviar Alertas por Email
        </Button>
      </div>

      {/* Email Status */}
      {emailStatus && (
        <Card className={`glass-card border-border/30 ${emailStatus.success ? "border-l-2 border-l-green-500" : "border-l-2 border-l-red-500"}`}>
          <CardContent className="pt-0 flex items-center gap-3">
            {emailStatus.success ? (
              <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400 shrink-0" />
            )}
            <div>
              <p className="text-sm text-foreground">{emailStatus.message}</p>
              {email && emailStatus.success && (
                <p className="text-xs text-muted-foreground mt-0.5">Enviado a: {email}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Criticas", count: criticas, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Advertencias", count: advertencias, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Total Alertas", count: alertas.length, color: "text-primary", bg: "bg-primary/10" },
          { label: "Email Destino", count: email || "No configurado", color: "text-muted-foreground", bg: "bg-secondary/50", isText: true },
        ].map((item) => (
          <Card key={item.label} className="glass-card border-border/30">
            <CardContent className="pt-0 flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                {item.isText ? (
                  <Mail className={`h-4 w-4 ${item.color}`} />
                ) : (
                  <span className={`text-sm font-bold ${item.color}`}>{item.count}</span>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                {item.isText && (
                  <p className="text-xs text-foreground truncate">{item.count}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts List */}
      {alertas.length > 0 ? (
        <div className="flex flex-col gap-3">
          {alertas.map((alert) => {
            const badge = getAlertBadge(alert.tipo)
            return (
              <Card
                key={alert.id}
                className={`glass-card border-border/30 transition-all duration-300 hover:border-primary/20 ${
                  alert.tipo === "critical" ? "border-l-2 border-l-red-500" : "border-l-2 border-l-amber-500"
                }`}
              >
                <CardContent className="pt-0">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">{getAlertIcon(alert.tipo)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-medium text-foreground">{alert.titulo}</h3>
                        <Badge variant="secondary" className={`text-[10px] ${badge.className}`}>
                          {badge.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-primary mb-1">
                        {alert.producto}
                        {alert.sku && <span className="text-muted-foreground ml-1">({alert.sku})</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{alert.descripcion}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(alert.fecha).toLocaleDateString("es-CR", { dateStyle: "medium" })}
                          </span>
                        </div>
                        {alert.categoria && (
                          <Badge variant="secondary" className="text-[10px] bg-secondary/50">
                            {alert.categoria}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-lg font-bold ${alert.stock === 0 ? "text-red-400" : "text-amber-400"}`}>
                        {alert.stock}
                      </p>
                      <p className="text-[10px] text-muted-foreground">de {alert.stock_minimo} min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="glass-card border-border/30">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 mb-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">Sin alertas activas</h3>
              <p className="text-xs text-muted-foreground">
                Todos tus productos tienen stock suficiente. ¡Excelente!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

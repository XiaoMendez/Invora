"use client"

import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Alert {
  id: string
  tipo: "warning" | "critical" | "info" | "resolved"
  titulo: string
  descripcion: string
  producto?: string
  fecha: string
  leida: boolean
}

const alerts: Alert[] = [
  {
    id: "ALT-001",
    tipo: "critical",
    titulo: "Stock agotado",
    descripcion: "El producto ha llegado a stock 0. Se requiere reabastecimiento urgente.",
    producto: "Leche Dos Pinos 1L",
    fecha: "Hace 2 horas",
    leida: false,
  },
  {
    id: "ALT-002",
    tipo: "warning",
    titulo: "Stock bajo",
    descripcion: "El stock actual esta por debajo del minimo establecido (8 de 20 unidades).",
    producto: "Frijoles Ducal 400g",
    fecha: "Hace 5 horas",
    leida: false,
  },
  {
    id: "ALT-003",
    tipo: "warning",
    titulo: "Stock bajo",
    descripcion: "El stock actual esta por debajo del minimo establecido (5 de 15 unidades).",
    producto: "Aceite Clover 750ml",
    fecha: "Hace 8 horas",
    leida: false,
  },
  {
    id: "ALT-004",
    tipo: "info",
    titulo: "Reporte mensual disponible",
    descripcion: "El reporte de inventario del mes de febrero 2026 esta listo para descarga.",
    fecha: "Hace 1 dia",
    leida: true,
  },
  {
    id: "ALT-005",
    tipo: "resolved",
    titulo: "Stock restaurado",
    descripcion: "El producto fue reabastecido exitosamente (100 unidades agregadas).",
    producto: "Arroz Tio Pelon 1kg",
    fecha: "Hace 2 dias",
    leida: true,
  },
  {
    id: "ALT-006",
    tipo: "resolved",
    titulo: "Stock restaurado",
    descripcion: "El producto fue reabastecido exitosamente (80 unidades agregadas).",
    producto: "Jugo Del Valle 1L",
    fecha: "Hace 3 dias",
    leida: true,
  },
]

function getAlertIcon(tipo: Alert["tipo"]) {
  switch (tipo) {
    case "critical":
      return <XCircle className="h-5 w-5 text-red-400" />
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-400" />
    case "info":
      return <Info className="h-5 w-5 text-blue-400" />
    case "resolved":
      return <CheckCircle className="h-5 w-5 text-green-400" />
  }
}

function getAlertBadge(tipo: Alert["tipo"]) {
  switch (tipo) {
    case "critical":
      return { label: "Critica", className: "bg-red-500/10 text-red-400 border-red-500/20" }
    case "warning":
      return { label: "Advertencia", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
    case "info":
      return { label: "Info", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" }
    case "resolved":
      return { label: "Resuelta", className: "bg-green-500/10 text-green-400 border-green-500/20" }
  }
}

export default function AlertasPage() {
  const unread = alerts.filter((a) => !a.leida).length

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Alertas
            {unread > 0 && (
              <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                {unread} nuevas
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Notificaciones de tu inventario en tiempo real.
          </p>
        </div>
        <Button variant="outline" className="border-border/30 text-sm">
          Marcar todas como leidas
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Criticas", count: alerts.filter((a) => a.tipo === "critical").length, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Advertencias", count: alerts.filter((a) => a.tipo === "warning").length, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Informativas", count: alerts.filter((a) => a.tipo === "info").length, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Resueltas", count: alerts.filter((a) => a.tipo === "resolved").length, color: "text-green-400", bg: "bg-green-500/10" },
        ].map((item) => (
          <Card key={item.label} className="glass-card border-border/30">
            <CardContent className="pt-0 flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                <span className={`text-sm font-bold ${item.color}`}>{item.count}</span>
              </div>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts List */}
      <div className="flex flex-col gap-3">
        {alerts.map((alert) => {
          const badge = getAlertBadge(alert.tipo)
          return (
            <Card
              key={alert.id}
              className={`glass-card border-border/30 transition-all duration-300 hover:border-primary/20 ${
                !alert.leida ? "border-l-2 border-l-primary" : ""
              }`}
            >
              <CardContent className="pt-0">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">{getAlertIcon(alert.tipo)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-foreground">{alert.titulo}</h3>
                      <Badge variant="secondary" className={`text-[10px] ${badge.className}`}>
                        {badge.label}
                      </Badge>
                      {!alert.leida && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    {alert.producto && (
                      <p className="text-xs text-primary mb-1">{alert.producto}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{alert.descripcion}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">{alert.fecha}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

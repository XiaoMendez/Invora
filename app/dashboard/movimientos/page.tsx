"use client"

import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Download,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const movements = [
  { id: "MOV-001", producto: "Cafe Britt Clasico 500g", tipo: "Entrada", cantidad: 50, fecha: "2 Mar 2026, 14:30", usuario: "Maria Lopez", nota: "Reabastecimiento semanal" },
  { id: "MOV-002", producto: "Detergente Irex 1L", tipo: "Salida", cantidad: 25, fecha: "2 Mar 2026, 13:15", usuario: "Carlos Ramirez", nota: "Despacho al por mayor" },
  { id: "MOV-003", producto: "Arroz Tio Pelon 1kg", tipo: "Entrada", cantidad: 100, fecha: "2 Mar 2026, 11:00", usuario: "Maria Lopez", nota: "Pedido proveedor" },
  { id: "MOV-004", producto: "Leche Dos Pinos 1L", tipo: "Salida", cantidad: 40, fecha: "2 Mar 2026, 10:45", usuario: "Ana Sanchez", nota: "Distribucion tiendas" },
  { id: "MOV-005", producto: "Jabon Palmolive 100g", tipo: "Salida", cantidad: 15, fecha: "1 Mar 2026, 17:30", usuario: "Carlos Ramirez", nota: "Despacho directo" },
  { id: "MOV-006", producto: "Jugo Del Valle 1L", tipo: "Entrada", cantidad: 80, fecha: "1 Mar 2026, 15:00", usuario: "Maria Lopez", nota: "Restock" },
  { id: "MOV-007", producto: "Papel Higienico Scott x4", tipo: "Salida", cantidad: 20, fecha: "1 Mar 2026, 14:20", usuario: "Ana Sanchez", nota: "Pedido cliente" },
  { id: "MOV-008", producto: "Frijoles Ducal 400g", tipo: "Entrada", cantidad: 60, fecha: "1 Mar 2026, 09:30", usuario: "Maria Lopez", nota: "Compra urgente" },
  { id: "MOV-009", producto: "Aceite Clover 750ml", tipo: "Salida", cantidad: 10, fecha: "28 Feb 2026, 16:00", usuario: "Carlos Ramirez", nota: "Despacho" },
  { id: "MOV-010", producto: "Azucar Dona Maria 1kg", tipo: "Entrada", cantidad: 50, fecha: "28 Feb 2026, 10:00", usuario: "Maria Lopez", nota: "Restock mensual" },
]

export default function MovimientosPage() {
  const entradas = movements.filter((m) => m.tipo === "Entrada").reduce((sum, m) => sum + m.cantidad, 0)
  const salidas = movements.filter((m) => m.tipo === "Salida").reduce((sum, m) => sum + m.cantidad, 0)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Movimientos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Historial de entradas y salidas de inventario.
          </p>
        </div>
        <Button variant="outline" className="border-border/30 gap-2 text-sm">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-border/30">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <ArrowDownLeft className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Entradas</p>
                <p className="text-xl font-bold text-foreground">{entradas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <ArrowUpRight className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salidas</p>
                <p className="text-xl font-bold text-foreground">{salidas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ArrowLeftRight className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Neto</p>
                <p className="text-xl font-bold text-foreground">+{entradas - salidas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select defaultValue="todos">
          <SelectTrigger className="w-36 bg-secondary/50 border-border/30 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-card border-border/30">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="entradas">Entradas</SelectItem>
            <SelectItem value="salidas">Salidas</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="7d">
          <SelectTrigger className="w-40 bg-secondary/50 border-border/30 text-sm">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-card border-border/30">
            <SelectItem value="1d">Hoy</SelectItem>
            <SelectItem value="7d">Ultimos 7 dias</SelectItem>
            <SelectItem value="30d">Ultimos 30 dias</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="glass-card border-border/30">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-xs">ID</TableHead>
                <TableHead className="text-xs">Producto</TableHead>
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs text-right">Cantidad</TableHead>
                <TableHead className="text-xs">Fecha</TableHead>
                <TableHead className="text-xs">Usuario</TableHead>
                <TableHead className="text-xs">Nota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((mov) => (
                <TableRow key={mov.id} className="border-border/20">
                  <TableCell className="text-xs font-mono text-muted-foreground">{mov.id}</TableCell>
                  <TableCell className="text-xs text-foreground font-medium">{mov.producto}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        mov.tipo === "Entrada"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {mov.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-right text-foreground">{mov.cantidad}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{mov.fecha}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{mov.usuario}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{mov.nota}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

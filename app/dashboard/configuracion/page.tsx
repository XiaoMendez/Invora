"use client"

import {
  Settings,
  Building,
  Users,
  Bell,
  Shield,
  Palette,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ConfiguracionPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuracion</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administra las preferencias de tu cuenta y empresa.
        </p>
      </div>

      <Tabs defaultValue="empresa" className="w-full">
        <TabsList className="bg-secondary/30 border border-border/30">
          <TabsTrigger value="empresa" className="text-xs gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Building className="h-3.5 w-3.5" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="text-xs gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Bell className="h-3.5 w-3.5" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="text-xs gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Shield className="h-3.5 w-3.5" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="mt-6">
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                Datos de la Empresa
              </CardTitle>
              <CardDescription>Informacion general de tu negocio.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 max-w-lg">
                <div className="grid gap-2">
                  <Label className="text-xs">Nombre de la Empresa</Label>
                  <Input defaultValue="Mi PYME S.A." className="bg-secondary/50 border-border/30" />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Cedula Juridica</Label>
                  <Input defaultValue="3-101-123456" className="bg-secondary/50 border-border/30" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs">Telefono</Label>
                    <Input defaultValue="+506 2234-5678" className="bg-secondary/50 border-border/30" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Email</Label>
                    <Input defaultValue="info@mipyme.cr" className="bg-secondary/50 border-border/30" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Direccion</Label>
                  <Input defaultValue="San Jose, Costa Rica" className="bg-secondary/50 border-border/30" />
                </div>
                <Separator className="bg-border/30" />
                <Button className="w-fit bg-primary text-primary-foreground hover:bg-primary/90">
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones" className="mt-6">
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Preferencias de Notificaciones
              </CardTitle>
              <CardDescription>Configura como y cuando recibir alertas.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6 max-w-lg">
                {[
                  { label: "Alertas de stock bajo", description: "Notificar cuando un producto baje del minimo.", default: true },
                  { label: "Stock agotado", description: "Alerta inmediata cuando un producto llega a 0.", default: true },
                  { label: "Movimientos grandes", description: "Notificar movimientos que superen cierta cantidad.", default: false },
                  { label: "Reportes semanales", description: "Recibir resumen semanal por email.", default: true },
                  { label: "Notificaciones push", description: "Recibir notificaciones en el navegador.", default: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                    <Switch defaultChecked={item.default} />
                  </div>
                ))}
                <Separator className="bg-border/30" />
                <Button className="w-fit bg-primary text-primary-foreground hover:bg-primary/90">
                  Guardar Preferencias
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguridad" className="mt-6">
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Seguridad de la Cuenta
              </CardTitle>
              <CardDescription>Gestiona la seguridad de tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 max-w-lg">
                <div className="grid gap-2">
                  <Label className="text-xs">Contrasena Actual</Label>
                  <Input type="password" className="bg-secondary/50 border-border/30" />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Nueva Contrasena</Label>
                  <Input type="password" className="bg-secondary/50 border-border/30" />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Confirmar Nueva Contrasena</Label>
                  <Input type="password" className="bg-secondary/50 border-border/30" />
                </div>
                <Separator className="bg-border/30" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">Autenticacion de dos factores</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Agrega una capa extra de seguridad a tu cuenta.
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator className="bg-border/30" />
                <Button className="w-fit bg-primary text-primary-foreground hover:bg-primary/90">
                  Actualizar Seguridad
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

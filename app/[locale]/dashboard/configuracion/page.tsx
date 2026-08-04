"use client"

import { useState, useEffect } from "react"
import useSWR, { mutate } from "swr"
import {
  Building,
  Bell,
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "@/hooks/useTranslation"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ConfiguracionPage() {
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null)

  const { data, error, isLoading } = useSWR("/api/empresa", fetcher)

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    id_fiscal: "",
  })

  useEffect(() => {
    if (data?.empresa) {
      setFormData({
        nombre: data.empresa.nombre || "",
        telefono: data.empresa.telefono || "",
        direccion: data.empresa.direccion || "",
        id_fiscal: data.empresa.id_fiscal || "",
      })
    }
  }, [data])

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      setSaveStatus({ success: false, message: t("configuracion.nameRequired") })
      return
    }

    setSaving(true)
    setSaveStatus(null)

    try {
      const res = await fetch("/api/empresa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await res.json()

      if (result.success) {
        setSaveStatus({ success: true, message: t("configuracion.savedOk") })
        mutate("/api/empresa")
      } else {
        setSaveStatus({ success: false, message: result.error || t("configuracion.savedError") })
      }
    } catch (err) {
      setSaveStatus({ success: false, message: t("configuracion.savedError") })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("configuracion.loading")}</p>
        </div>
      </div>
    )
  }

  if (error || data?.error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-muted-foreground">{t("configuracion.error")}</p>
        </div>
      </div>
    )
  }

  const notifications = [
    { key: "notif1", descKey: "notif1desc", defaultChecked: true },
    { key: "notif2", descKey: "notif2desc", defaultChecked: true },
    { key: "notif3", descKey: "notif3desc", defaultChecked: false },
    { key: "notif4", descKey: "notif4desc", defaultChecked: true },
  ] as const

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("configuracion.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("configuracion.subtitle")}</p>
      </div>

      <Tabs defaultValue="empresa" className="w-full">
        <TabsList className="bg-secondary/30 border border-border/30">
          <TabsTrigger value="empresa" className="text-xs gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Building className="h-3.5 w-3.5" />
            {t("configuracion.tabCompany")}
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="text-xs gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Bell className="h-3.5 w-3.5" />
            {t("configuracion.tabNotifications")}
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="text-xs gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Shield className="h-3.5 w-3.5" />
            {t("configuracion.tabSecurity")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="mt-6">
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                {t("configuracion.companyData")}
              </CardTitle>
              <CardDescription>{t("configuracion.companyDataDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {saveStatus && (
                <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg ${saveStatus.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  {saveStatus.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <span className="text-sm">{saveStatus.message}</span>
                </div>
              )}

              <div className="grid gap-6 max-w-lg">
                <div className="grid gap-2">
                  <Label className="text-xs">{t("configuracion.companyName")}</Label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="bg-secondary/50 border-border/30"
                    placeholder="Mi PYME S.A."
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">{t("configuracion.taxId")}</Label>
                  <Input
                    value={formData.id_fiscal}
                    onChange={(e) => setFormData({ ...formData, id_fiscal: e.target.value })}
                    className="bg-secondary/50 border-border/30"
                    placeholder="3-101-123456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs">{t("configuracion.phone")}</Label>
                    <Input
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="bg-secondary/50 border-border/30"
                      placeholder="+506 2234-5678"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">{t("configuracion.email")}</Label>
                    <Input
                      value={data?.userEmail || ""}
                      disabled
                      className="bg-secondary/30 border-border/30 text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">{t("configuracion.address")}</Label>
                  <Input
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="bg-secondary/50 border-border/30"
                    placeholder="San Jose, Costa Rica"
                  />
                </div>
                <Separator className="bg-border/30" />
                <Button
                  className="w-fit bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {t("configuracion.saveChanges")}
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
                {t("configuracion.notifTitle")}
              </CardTitle>
              <CardDescription>{t("configuracion.notifDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6 max-w-lg">
                {notifications.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">{t(`configuracion.${item.key}`)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t(`configuracion.${item.descKey}`)}</p>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                ))}
                <Separator className="bg-border/30" />
                <p className="text-xs text-muted-foreground">
                  {t("configuracion.alertsEmail")} <strong>{data?.userEmail || t("configuracion.notConfigured")}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguridad" className="mt-6">
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                {t("configuracion.secTitle")}
              </CardTitle>
              <CardDescription>{t("configuracion.secDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 max-w-lg">
                <div className="grid gap-2">
                  <Label className="text-xs">{t("configuracion.currentPassword")}</Label>
                  <Input type="password" className="bg-secondary/50 border-border/30" />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">{t("configuracion.newPassword")}</Label>
                  <Input type="password" className="bg-secondary/50 border-border/30" />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">{t("configuracion.confirmNewPassword")}</Label>
                  <Input type="password" className="bg-secondary/50 border-border/30" />
                </div>
                <Separator className="bg-border/30" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">{t("configuracion.twoFactor")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("configuracion.twoFactorDesc")}</p>
                  </div>
                  <Switch />
                </div>
                <Separator className="bg-border/30" />
                <Button className="w-fit bg-primary text-primary-foreground hover:bg-primary/90">
                  {t("configuracion.updateSecurity")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

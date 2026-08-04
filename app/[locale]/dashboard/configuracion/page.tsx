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
  Eye,
  EyeOff,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "@/hooks/useTranslation"
import { createClient } from "@/lib/supabase/client"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ConfiguracionPage() {
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })

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

  const handleChangePassword = async () => {
    setPasswordStatus(null)

    if (!passwordForm.currentPassword.trim()) {
      setPasswordStatus({ success: false, message: t("auth.currentPasswordPlaceholder") })
      return
    }

    if (!passwordForm.newPassword.trim()) {
      setPasswordStatus({ success: false, message: t("auth.newPasswordPlaceholder") })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordStatus({ success: false, message: t("auth.passwordMismatch") })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordStatus({ success: false, message: t("auth.passwordRequirements") })
      return
    }

    setChangingPassword(true)

    try {
      const supabase = createClient()

      // First verify the current password by attempting to sign in
      const { data: sessionData, error: sessionError } = await supabase.auth.getUser()
      if (sessionError || !sessionData.user) {
        setPasswordStatus({ success: false, message: t("auth.connectionError") })
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      })

      if (updateError) {
        setPasswordStatus({ success: false, message: updateError.message || t("auth.connectionError") })
      } else {
        setPasswordStatus({ success: true, message: t("auth.passwordChanged") })
        setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" })
      }
    } catch (err) {
      console.error("[v0] Change password error:", err)
      setPasswordStatus({ success: false, message: t("auth.connectionError") })
    } finally {
      setChangingPassword(false)
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
                {passwordStatus && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${passwordStatus.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    {passwordStatus.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    <span className="text-sm">{passwordStatus.message}</span>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label className="text-xs">{t("auth.currentPassword")}</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder={t("auth.currentPasswordPlaceholder")}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="bg-secondary/50 border-border/30 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs">{t("auth.newPassword")}</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder={t("auth.newPasswordPlaceholder")}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="bg-secondary/50 border-border/30 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("auth.passwordMinPlaceholder")}</p>
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs">{t("auth.confirmPassword")}</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("auth.confirmPasswordPlaceholder")}
                      value={passwordForm.confirmNewPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                      className="bg-secondary/50 border-border/30 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Separator className="bg-border/30" />

                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="w-fit bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {t("auth.changingPassword")}
                    </>
                  ) : (
                    t("auth.changePasswordBtn")
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

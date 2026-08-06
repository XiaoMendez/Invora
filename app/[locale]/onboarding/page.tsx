"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { usePreferences } from "@/contexts/PreferencesContext"
import { useTranslation } from "@/hooks/useTranslation"
import { useToast } from "@/contexts/ToastContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StarsBackground } from "@/components/space-scene"
import { Building2, Loader2, Rocket, Moon, Sun, Monitor, Globe, Check } from "lucide-react"
import { ThemeLogo } from "@/components/theme-logo"

type Step = "language" | "theme" | "company" | "complete"

const languages = [
  { code: "es", name: "Español", flag: "ES" },
  { code: "en", name: "English", flag: "US" },
  { code: "pt", name: "Português", flag: "BR" },
]

const themeConfig = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { setTheme: setNTheme } = useTheme()
  const { setTheme, setLocale } = usePreferences()
  const { t } = useTranslation()
  const { addToast } = useToast()
  const [step, setStep] = useState<Step>("language")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("es")
  const [selectedTheme, setSelectedTheme] = useState("system")
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    id_fiscal: "",
  })

  const handleLanguageSelect = (lang: string) => {
    setSelectedLanguage(lang)
    setLocale(lang as 'es' | 'en' | 'pt')
    addToast("Language selected successfully", "success")
    setStep("theme")
  }

  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme)
    setTheme(theme as 'light' | 'dark' | 'system')
    setNTheme(theme)
    addToast("Theme applied", "success")
    setStep("company")
  }

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.nombre.trim()) {
      setError(t('errors.required'))
      addToast(t('errors.required'), 'error')
      return
    }

    if (!formData.email.trim()) {
      setError(t('errors.required'))
      addToast(t('errors.required'), 'error')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/empresa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || t('errors.setupFailed'))
      }

      localStorage.setItem("onboarding_completed", "true")
      addToast(t('onboarding.complete'), 'success')

      setStep("complete")
      setTimeout(() => {
        router.push(`/${selectedLanguage}/dashboard`)
      }, 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.setupFailed')
      setError(message)
      addToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <StarsBackground />

      <Card className="w-full max-w-lg bg-card/95 backdrop-blur-sm border-border/50 z-10">
        {/* Language Step */}
        {step === "language" && (
          <>
            <CardHeader className="text-center space-y-4 bg-gradient-to-b from-accent/10 to-transparent">
              <div className="flex justify-center">
                <ThemeLogo
                  width={480}
                  height={120}
                  alt="INVORA"
                  className="h-14 w-auto"
                />
              </div>
              <div className="space-y-3">
                <CardTitle className="text-3xl font-bold">{t('onboarding.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('onboarding.step1')}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className="flex items-center gap-4 p-4 rounded-lg border-2 border-border/30 hover:border-accent hover:bg-accent/10 transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-secondary group-hover:bg-accent/20 flex items-center justify-center font-bold text-sm">
                      {lang.flag}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-foreground">{lang.name}</p>
                      <p className="text-xs text-muted-foreground">{lang.code.toUpperCase()}</p>
                    </div>
                    <Check className="h-5 w-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </CardContent>
          </>
        )}

        {/* Theme Step */}
        {step === "theme" && (
          <>
            <CardHeader className="text-center space-y-3 bg-gradient-to-b from-accent/10 to-transparent">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">{t('onboarding.step2')}</CardTitle>
                <CardDescription className="text-base">
                  {t('onboarding.description')}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-2">
                {themeConfig.map((theme) => {
                  const ThemeIcon = theme.icon
                  const themeLabel = theme.value === 'light' ? t('common.lightTheme') : theme.value === 'dark' ? t('common.darkTheme') : t('common.systemTheme')
                  return (
                    <button
                      key={theme.value}
                      onClick={() => handleThemeSelect(theme.value)}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 group ${
                        selectedTheme === theme.value
                          ? "border-accent bg-accent/10"
                          : "border-border/30 hover:border-accent hover:bg-accent/5"
                      }`}
                    >
                      <div className={`p-3 rounded-lg ${selectedTheme === theme.value ? 'bg-accent/20' : 'bg-secondary group-hover:bg-accent/10'}`}>
                        <ThemeIcon className={`h-6 w-6 ${selectedTheme === theme.value ? 'text-accent' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-foreground">{themeLabel}</p>
                      </div>
                      {selectedTheme === theme.value && (
                        <Check className="h-5 w-5 text-accent" />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep("language")}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {t('onboarding.back')}
                </Button>
                <Button
                  onClick={() => setStep("company")}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {t('onboarding.next')}
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Company Setup Step */}
        {step === "company" && (
          <>
            <CardHeader className="text-center space-y-3 bg-gradient-to-b from-accent/10 to-transparent">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <Building2 className="h-6 w-6 text-accent" />
                  </div>
                  {t('onboarding.step3')}
                </CardTitle>
                <CardDescription className="text-base">
                  {t('onboarding.description')}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCompanySubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-950/20 border border-red-700/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="nombre">
                    {t('onboarding.companyName')} <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    placeholder="Mi Empresa S.A."
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    disabled={isLoading}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t('onboarding.companyEmail')} <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="empresa@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">{t('onboarding.phone')}</Label>
                  <Input
                    id="telefono"
                    placeholder="+1 (555) 000-0000"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    disabled={isLoading}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">{t('onboarding.address')}</Label>
                  <Input
                    id="direccion"
                    placeholder="Calle Principal 123"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    disabled={isLoading}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_fiscal">{t('onboarding.taxId')}</Label>
                  <Input
                    id="id_fiscal"
                    placeholder="RUC / RFC / NIT / CIF..."
                    value={formData.id_fiscal}
                    onChange={(e) => setFormData({ ...formData, id_fiscal: e.target.value })}
                    disabled={isLoading}
                    className="h-10"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("theme")}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {t('onboarding.back')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('common.loading')}
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        {t('onboarding.finish')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <>
            <CardHeader className="text-center space-y-4 bg-gradient-to-b from-accent/10 to-transparent">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
                    <Check className="h-10 w-10 text-accent" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">{t('onboarding.complete')}</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {t('onboarding.redirecting')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </>
        )}
      </Card>
    </div>
  )
}

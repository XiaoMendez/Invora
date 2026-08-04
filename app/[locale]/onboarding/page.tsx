"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { usePreferences } from "@/contexts/PreferencesContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StarsBackground } from "@/components/space-scene"
import { Building2, Loader2, Rocket, Moon, Sun, Monitor, Globe } from "lucide-react"
import Image from "next/image"

type Step = "language" | "theme" | "company" | "complete"

const languages = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
]

const themes = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { setTheme: setNTheme } = useTheme()
  const { setTheme, setLocale } = usePreferences()
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
    setStep("theme")
  }

  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme)
    setTheme(theme as 'light' | 'dark' | 'system')
    setNTheme(theme)
    setStep("company")
  }

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.nombre.trim()) {
      setError("El nombre de la empresa es requerido")
      return
    }

    if (!formData.email.trim()) {
      setError("El email de la empresa es requerido")
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
        throw new Error(data.error || "Error al configurar la empresa")
      }

      // Marcar onboarding como completado
      localStorage.setItem("onboarding_completed", "true")

      setStep("complete")
      setTimeout(() => {
        router.push(`/${selectedLanguage}/dashboard`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al configurar la empresa")
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
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <Image
                  src="/images/invora-logo.png"
                  alt="Invora"
                  width={360}
                  height={120}
                  className="h-20 w-auto"
                />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  Bienvenido a Invora
                </CardTitle>
                <CardDescription>
                  Selecciona tu idioma preferido
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border/30 hover:border-primary/50 hover:bg-secondary/50 transition-all duration-200"
                  >
                    <span className="text-3xl">{lang.flag}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{lang.name}</p>
                      <p className="text-sm text-muted-foreground">{lang.code.toUpperCase()}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </>
        )}

        {/* Theme Step */}
        {step === "theme" && (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="space-y-2">
                <CardTitle className="text-2xl">Elige tu Tema</CardTitle>
                <CardDescription>
                  Personaliza la apariencia de Invora
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3">
                {themes.map((theme) => {
                  const ThemeIcon = theme.icon
                  return (
                    <button
                      key={theme.value}
                      onClick={() => handleThemeSelect(theme.value)}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                        selectedTheme === theme.value
                          ? "border-primary bg-primary/10"
                          : "border-border/30 hover:border-primary/50 hover:bg-secondary/50"
                      }`}
                    >
                      <ThemeIcon className="h-6 w-6 text-primary" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">{theme.label}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("language")}
                  className="flex-1"
                >
                  Atrás
                </Button>
                <Button
                  onClick={() => setStep("company")}
                  className="flex-1"
                >
                  Siguiente
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Company Setup Step */}
        {step === "company" && (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="space-y-2">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  Configura tu Empresa
                </CardTitle>
                <CardDescription>
                  Necesitamos algunos datos para personalizar tu experiencia
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCompanySubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="nombre">
                    Nombre de la Empresa <span className="text-destructive">*</span>
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
                    Email <span className="text-destructive">*</span>
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
                  <Label htmlFor="telefono">Teléfono</Label>
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
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    placeholder="Calle Principal 123"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    disabled={isLoading}
                    className="h-10"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("theme")}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Configurando...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Comenzar
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
            <CardHeader className="text-center space-y-4">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Rocket className="h-8 w-8 text-primary animate-bounce" />
                  </div>
                </div>
                <CardTitle className="text-2xl">¡Configuración Completada!</CardTitle>
                <CardDescription>
                  Redirigiendo al panel de control...
                </CardDescription>
              </div>
            </CardHeader>
          </>
        )}
      </Card>
    </div>
  )
}

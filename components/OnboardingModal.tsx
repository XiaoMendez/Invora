'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { usePreferences } from '@/contexts/PreferencesContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Moon, Sun, Monitor, Globe } from 'lucide-react'

// Static labels per language — no hook needed here since locale isn't set yet
const staticLabels: Record<string, Record<string, string>> = {
  es: { title: 'Bienvenido a Invora', subtitle: 'Configura tu experiencia inicial', selectLang: 'Selecciona tu idioma', selectTheme: 'Selecciona tu tema', skip: 'Omitir', cont: 'Continuar', light: 'Claro', dark: 'Oscuro', system: 'Sistema' },
  en: { title: 'Welcome to Invora', subtitle: 'Set up your initial experience', selectLang: 'Select your language', selectTheme: 'Select your theme', skip: 'Skip', cont: 'Continue', light: 'Light', dark: 'Dark', system: 'System' },
  pt: { title: 'Bem-vindo ao Invora', subtitle: 'Configure sua experiência inicial', selectLang: 'Selecione seu idioma', selectTheme: 'Selecione seu tema', skip: 'Pular', cont: 'Continuar', light: 'Claro', dark: 'Escuro', system: 'Sistema' },
}

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [selectedLang, setSelectedLang] = useState<'es' | 'en' | 'pt'>('es')
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('dark')
  const [mounted, setMounted] = useState(false)
  const { setTheme } = useTheme()
  const { setLocale, setTheme: setPrefTheme } = usePreferences()
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  const labels = staticLabels[selectedLang]

  const handleContinue = () => {
    // Persist preferences
    setPrefTheme(selectedTheme)
    setTheme(selectedTheme)
    // Mark done BEFORE changing locale (which navigates)
    localStorage.setItem('onboarding_done', 'true')
    onClose()
    // Navigate to the selected locale's root — the route always exists
    router.push(`/${selectedLang}`)
    // Update locale in context after navigation is queued
    setLocale(selectedLang)
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding_done', 'true')
    onClose()
  }

  if (!isOpen || !mounted) return null

  const languages = [
    { code: 'es' as const, name: 'Español', abbr: 'ES' },
    { code: 'en' as const, name: 'English', abbr: 'US' },
    { code: 'pt' as const, name: 'Português', abbr: 'BR' },
  ]

  const themes = [
    { value: 'light' as const, icon: Sun },
    { value: 'dark' as const, icon: Moon },
    { value: 'system' as const, icon: Monitor },
  ]

  const themeLabels = { light: labels.light, dark: labels.dark, system: labels.system }

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-border shadow-2xl bg-card dark:bg-slate-900">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-xl bg-primary/10">
              <Globe className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{labels.title}</CardTitle>
          <CardDescription>{labels.subtitle}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">{labels.selectLang}</p>
            <div className="grid grid-cols-3 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 ${
                    selectedLang === lang.code
                      ? 'border-primary bg-primary/15 dark:bg-primary/10'
                      : 'border-border/70 hover:border-primary/60 hover:bg-secondary/60 dark:border-border dark:hover:bg-secondary/40'
                  }`}
                >
                  <span className="text-xs font-bold text-muted-foreground">{lang.abbr}</span>
                  <span className="text-xs font-medium text-foreground">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">{labels.selectTheme}</p>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((theme) => {
                const ThemeIcon = theme.icon
                return (
                  <button
                    key={theme.value}
                    onClick={() => setSelectedTheme(theme.value)}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      selectedTheme === theme.value
                        ? 'border-primary bg-primary/15 dark:bg-primary/10'
                        : 'border-border/70 hover:border-primary/60 hover:bg-secondary/60 dark:border-border dark:hover:bg-secondary/40'
                    }`}
                  >
                    <ThemeIcon className="h-5 w-5 text-foreground" />
                    <span className="text-xs font-medium text-foreground">{themeLabels[theme.value]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              {labels.skip}
            </Button>
            <Button onClick={handleContinue} className="flex-1">
              {labels.cont}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

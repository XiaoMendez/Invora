'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Moon, Sun, Monitor, Globe } from 'lucide-react'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [selectedLang, setSelectedLang] = useState<string>('es')
  const [selectedTheme, setSelectedTheme] = useState<string>('dark')
  const [mounted, setMounted] = useState(false)
  const { setTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleContinue = () => {
    localStorage.setItem('NEXT_LOCALE', selectedLang)
    localStorage.setItem('onboarding_done', 'true')
    setTheme(selectedTheme)

    onClose()

    // Redirigir al idioma seleccionado
    router.push(`/${selectedLang}/onboarding/complete`)
  }

  if (!isOpen || !mounted) {
    return null
  }

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
  ]

  const themes = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Oscuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 justify-center mb-4">
            <Globe className="h-6 w-6" />
          </div>
          <CardTitle className="text-center text-2xl">Bienvenido a Invora</CardTitle>
          <CardDescription className="text-center">
            Configura tu experiencia inicial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Language Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Selecciona tu idioma</label>
            <div className="grid grid-cols-3 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    selectedLang === lang.code
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-xl mb-1">{lang.flag}</div>
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Selecciona tu tema</label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((theme) => {
                const ThemeIcon = theme.icon
                return (
                  <button
                    key={theme.value}
                    onClick={() => setSelectedTheme(theme.value)}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      selectedTheme === theme.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <ThemeIcon className="h-5 w-5" />
                    <span className="text-xs font-medium">{theme.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                localStorage.setItem('onboarding_done', 'true')
                onClose()
              }}
              className="flex-1"
            >
              Omitir
            </Button>
            <Button onClick={handleContinue} className="flex-1">
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

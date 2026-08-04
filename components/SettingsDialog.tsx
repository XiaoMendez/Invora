'use client'

import { useState } from 'react'
import { Settings, X, Sun, Moon, Monitor, Globe } from 'lucide-react'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useTheme } from 'next-themes'
import { useToast } from '@/contexts/ToastContext'

const themes = [
  { value: 'light', label: 'Claro', icon: Sun, description: 'Tema claro para mejor legibilidad' },
  { value: 'dark', label: 'Oscuro', icon: Moon, description: 'Tema oscuro para reducir fatiga' },
  { value: 'system', label: 'Sistema', icon: Monitor, description: 'Automático según tu sistema' },
]

const languages = [
  { code: 'es', name: 'Español', flag: 'ES', description: 'Español - España y Latinoamérica' },
  { code: 'en', name: 'English', flag: 'US', description: 'English - United States' },
  { code: 'pt', name: 'Português', flag: 'BR', description: 'Português - Brasil' },
]

export function SettingsDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const { preferences, setLocale, setTheme } = usePreferences()
  const { setTheme: setNTheme } = useTheme()
  const { addToast } = useToast()

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    if (preferences.theme === theme) return
    setTheme(theme)
    setNTheme(theme)
    const themeLabels = { light: 'Claro', dark: 'Oscuro', system: 'Sistema' }
    addToast(`Tema cambiado a ${themeLabels[theme]}`, 'success')
  }

  const handleLanguageChange = (lang: 'es' | 'en' | 'pt') => {
    if (preferences.locale === lang) return
    setLocale(lang)
    const langLabels = { es: 'Español', en: 'English', pt: 'Português' }
    addToast(`Idioma cambiado a ${langLabels[lang]}`, 'success')
  }

  return (
    <>
      {/* Floating Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl hover:shadow-2xl transition-all hover:scale-110 active:scale-95"
        aria-label="Configuración"
      >
        <Settings className="h-6 w-6" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Settings Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md z-50 bg-card border-l border-border/30 shadow-2xl transform transition-all duration-300 overflow-hidden flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/30 bg-gradient-to-r from-accent/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <Settings className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Configuración</h2>
              <p className="text-xs text-muted-foreground">Personaliza tu experiencia</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-8">
          {/* Theme Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <Sun className="h-4 w-4 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Tema Visual</h3>
            </div>

            <div className="space-y-2">
              {themes.map((t) => {
                const Icon = t.icon
                const isSelected = preferences.theme === t.value
                return (
                  <button
                    key={t.value}
                    onClick={() => handleThemeChange(t.value as 'light' | 'dark' | 'system')}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-accent bg-accent/10'
                        : 'border-border/30 hover:border-border/50 hover:bg-secondary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-accent/20' : 'bg-secondary'}`}>
                        <Icon className={`h-5 w-5 ${isSelected ? 'text-accent' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{t.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Language Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <Globe className="h-4 w-4 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Idioma</h3>
            </div>

            <div className="space-y-2">
              {languages.map((lang) => {
                const isSelected = preferences.locale === lang.code
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code as 'es' | 'en' | 'pt')}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-accent bg-accent/10'
                        : 'border-border/30 hover:border-border/50 hover:bg-secondary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-semibold ${isSelected ? 'bg-accent/20 text-accent' : 'bg-secondary text-muted-foreground'}`}>
                        {lang.flag}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{lang.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{lang.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Los cambios se aplican automáticamente en toda la aplicación. Tus preferencias se guardan localmente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/30 bg-card/95 backdrop-blur-sm">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-medium transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </>
  )
}

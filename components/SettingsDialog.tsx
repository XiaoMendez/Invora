'use client'

import { useState } from 'react'
import { Settings, X } from 'lucide-react'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useTheme } from 'next-themes'

const themes = [
  { value: 'light', label: 'Claro', icon: '☀️' },
  { value: 'dark', label: 'Oscuro', icon: '🌙' },
  { value: 'system', label: 'Sistema', icon: '⚙️' },
]

const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
]

export function SettingsDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const { preferences, setLocale, setTheme } = usePreferences()
  const { setTheme: setNTheme } = useTheme()

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setTheme(theme)
    setNTheme(theme)
  }

  const handleLanguageChange = (lang: 'es' | 'en' | 'pt') => {
    setLocale(lang)
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40"
        title="Configuración de personalización"
      >
        <Settings className="h-6 w-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setIsOpen(false)
              handleReset()
            }}
          />

          {/* Dialog */}
          <div className="relative bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border/30 bg-card/95 backdrop-blur-sm">
              <h2 className="text-2xl font-bold">Personalización</h2>
              <button
                onClick={() => {
                  setIsOpen(false)
                  handleReset()
                }}
                className="p-1 hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Tema */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Tema</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Elige tu tema preferido
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {themes.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => handleThemeChange(t.value as 'light' | 'dark' | 'system')}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        preferences.theme === t.value
                          ? 'border-accent bg-accent/10'
                          : 'border-border/30 hover:border-border/50'
                      }`}
                    >
                      <span className="text-2xl">{t.icon}</span>
                      <span className="text-sm font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Idioma */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Idioma</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecciona tu idioma preferido
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as 'es' | 'en' | 'pt')}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        preferences.locale === lang.code
                          ? 'border-accent bg-accent/10'
                          : 'border-border/30 hover:border-border/50'
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer - Info */}
            <div className="sticky bottom-0 p-6 border-t border-border/30 bg-card/95 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground text-center">
                Los cambios se aplican automáticamente
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

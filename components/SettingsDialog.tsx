'use client'

import { useState } from 'react'
import { Settings, X, RotateCcw, Check } from 'lucide-react'
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
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark' | 'system' | null>(null)
  const [previewLanguage, setPreviewLanguage] = useState<'es' | 'en' | 'pt' | null>(null)
  const { preferences, setLocale, setTheme, completeOnboarding } = usePreferences()
  const { theme: currentTheme } = useTheme()

  const effectiveTheme = previewTheme || preferences.theme
  const effectiveLanguage = previewLanguage || preferences.locale

  const handleSave = () => {
    if (previewTheme) {
      setTheme(previewTheme)
      setPreviewTheme(null)
    }
    if (previewLanguage && previewLanguage !== preferences.locale) {
      setLocale(previewLanguage)
    }
    setIsOpen(false)
  }

  const handleReset = () => {
    setPreviewTheme(null)
    setPreviewLanguage(null)
  }

  const hasChanges = previewTheme !== null || previewLanguage !== null

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
                      onClick={() => setPreviewTheme(t.value as 'light' | 'dark' | 'system')}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        effectiveTheme === t.value
                          ? 'border-accent bg-accent/10'
                          : 'border-border/30 hover:border-border/50'
                      }`}
                    >
                      <span className="text-2xl">{t.icon}</span>
                      <span className="text-sm font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>

                {/* Preview de tema */}
                <div className={`p-4 rounded-lg border border-border/30 ${
                  effectiveTheme === 'dark' || (effectiveTheme === 'system' && currentTheme === 'dark')
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-black'
                }`}>
                  <p className="text-sm font-medium mb-2">Vista previa:</p>
                  <div className="space-y-2">
                    <div className="h-8 bg-opacity-20 rounded" />
                    <div className="h-4 bg-opacity-10 rounded w-3/4" />
                  </div>
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
                      onClick={() => setPreviewLanguage(lang.code as 'es' | 'en' | 'pt')}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        effectiveLanguage === lang.code
                          ? 'border-accent bg-accent/10'
                          : 'border-border/30 hover:border-border/50'
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>

                {/* Preview de idioma */}
                <div className="p-4 rounded-lg border border-border/30 bg-secondary/30">
                  <p className="text-sm font-medium mb-2">
                    {effectiveLanguage === 'es' && 'Vista previa en español:'}
                    {effectiveLanguage === 'en' && 'Preview in English:'}
                    {effectiveLanguage === 'pt' && 'Visualizar em português:'}
                  </p>
                  <p className="text-sm">
                    {effectiveLanguage === 'es' && '¡Bienvenido a Invora!'}
                    {effectiveLanguage === 'en' && 'Welcome to Invora!'}
                    {effectiveLanguage === 'pt' && 'Bem-vindo ao Invora!'}
                  </p>
                </div>
              </div>

              {/* Resumen de cambios */}
              {hasChanges && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                  <p className="text-sm font-medium mb-2">Cambios pendientes:</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {previewTheme && (
                      <li>
                        • Tema: {preferences.theme} → {previewTheme}
                      </li>
                    )}
                    {previewLanguage && previewLanguage !== preferences.locale && (
                      <li>
                        • Idioma: {preferences.locale} → {previewLanguage}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex gap-3 p-6 border-t border-border/30 bg-card/95 backdrop-blur-sm">
              <button
                onClick={handleReset}
                disabled={!hasChanges}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border/30 hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Restablecer
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="h-4 w-4" />
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Locale = 'es' | 'en' | 'pt'
export type Theme = 'light' | 'dark' | 'system'

interface Preferences {
  locale: Locale
  theme: Theme
  firstTime: boolean
}

interface PreferencesContextType {
  preferences: Preferences
  setLocale: (locale: Locale) => void
  setTheme: (theme: Theme) => void
  completeOnboarding: () => void
  isLoading: boolean
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>({
    locale: 'es',
    theme: 'system',
    firstTime: true,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Cargar preferencias del localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('preferences')
      if (stored) {
        const parsed = JSON.parse(stored)
        setPreferences(parsed)
      }
    } catch (error) {
      console.error('[v0] Error loading preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setLocale = (locale: Locale) => {
    const updated = { ...preferences, locale }
    setPreferences(updated)
    localStorage.setItem('preferences', JSON.stringify(updated))
    // Cambiar el idioma en la URL si es necesario
    const currentPath = window.location.pathname
    const pathSegments = currentPath.split('/')
    if (['es', 'en', 'pt'].includes(pathSegments[1])) {
      pathSegments[1] = locale
    } else {
      pathSegments.splice(1, 0, locale)
    }
    window.location.pathname = pathSegments.join('/')
  }

  const setTheme = (theme: Theme) => {
    const updated = { ...preferences, theme }
    setPreferences(updated)
    localStorage.setItem('preferences', JSON.stringify(updated))
    localStorage.setItem('theme', theme)
  }

  const completeOnboarding = () => {
    const updated = { ...preferences, firstTime: false }
    setPreferences(updated)
    localStorage.setItem('preferences', JSON.stringify(updated))
  }

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        setLocale,
        setTheme,
        completeOnboarding,
        isLoading,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return context
}

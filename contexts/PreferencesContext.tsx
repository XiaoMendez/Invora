'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

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
  const router = useRouter()
  const pathname = usePathname()
  
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
    localStorage.setItem('NEXT_LOCALE', locale)
    
    // Cambiar el idioma en la URL
    const pathSegments = pathname.split('/')
    const currentLocale = pathSegments[1]
    
    if (['es', 'en', 'pt'].includes(currentLocale)) {
      pathSegments[1] = locale
    } else {
      pathSegments.splice(1, 0, locale)
    }
    
    const newPath = pathSegments.join('/')
    router.push(newPath)
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

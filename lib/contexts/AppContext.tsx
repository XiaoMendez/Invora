'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AppContextType {
  locale: string
  setLocale: (locale: string) => void
  onboardingDone: boolean
  setOnboardingDone: (done: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<string>('es')
  const [onboardingDone, setOnboardingDone] = useState<boolean>(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Cargar preferencias del localStorage
  useEffect(() => {
    const savedLocale = localStorage.getItem('NEXT_LOCALE') || 'es'
    const savedOnboarding = localStorage.getItem('onboarding_done') === 'true'

    setLocale(savedLocale)
    setOnboardingDone(savedOnboarding)
    setMounted(true)
  }, [])

  // Guardar cambios de idioma
  const handleSetLocale = (newLocale: string) => {
    setLocale(newLocale)
    localStorage.setItem('NEXT_LOCALE', newLocale)
    // Recargar página con nuevo idioma
    router.push(`/${newLocale}`)
  }

  // Guardar que el onboarding se completó
  const handleSetOnboarding = (done: boolean) => {
    setOnboardingDone(done)
    localStorage.setItem('onboarding_done', done ? 'true' : 'false')
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <AppContext.Provider
      value={{
        locale,
        setLocale: handleSetLocale,
        onboardingDone,
        setOnboardingDone: handleSetOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext debe ser usado dentro de AppProvider')
  }
  return context
}

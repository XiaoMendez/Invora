'use client'

import { useEffect, useState } from 'react'
import { OnboardingModal } from '@/components/OnboardingModal'

export function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onboardingDone = localStorage.getItem('onboarding_done')
    if (!onboardingDone) {
      setShowOnboarding(true)
    }
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <>
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      {children}
    </>
  )
}

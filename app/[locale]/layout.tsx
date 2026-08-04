'use client'

import { ReactNode } from 'react'
import { OnboardingWrapper } from '@/components/OnboardingWrapper'
import { SettingsDialog } from '@/components/SettingsDialog'

interface LocaleLayoutProps {
  children: ReactNode
}

export default function LocaleLayout({ children }: LocaleLayoutProps) {
  return (
    <>
      <OnboardingWrapper>{children}</OnboardingWrapper>
      <SettingsDialog />
    </>
  )
}

'use client'

import { ReactNode } from 'react'
import { OnboardingWrapper } from '@/components/OnboardingWrapper'

interface LocaleLayoutProps {
  children: ReactNode
}

export default function LocaleLayout({ children }: LocaleLayoutProps) {
  return (
    <OnboardingWrapper>{children}</OnboardingWrapper>
  )
}

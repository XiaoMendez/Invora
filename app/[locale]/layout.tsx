'use client'

import { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from '@/components/theme-provider'
import { OnboardingWrapper } from '@/components/OnboardingWrapper'
import { useMessages } from 'next-intl'

interface LocaleLayoutProps {
  children: ReactNode
}

export default function LocaleLayout({ children }: LocaleLayoutProps) {
  const messages = useMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <OnboardingWrapper>{children}</OnboardingWrapper>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}

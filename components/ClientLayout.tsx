'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { NextIntlClientProvider } from 'next-intl'

interface ClientLayoutProps {
  children: ReactNode
  locale: string
  messages: Record<string, any>
}

export function ClientLayout({ children, locale, messages }: ClientLayoutProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}

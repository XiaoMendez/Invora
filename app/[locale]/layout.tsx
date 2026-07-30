import { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from '@/components/theme-provider'
import { OnboardingWrapper } from '@/components/OnboardingWrapper'
import { getMessages } from 'next-intl/server'

interface LocaleLayoutProps {
  children: ReactNode
  params: { locale: string }
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <OnboardingWrapper>{children}</OnboardingWrapper>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}

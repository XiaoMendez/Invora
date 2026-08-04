import { getRequestConfig } from 'next-intl/server'

export const locales = ['es', 'en', 'pt'] as const
export const defaultLocale = 'es' as const

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) {
    return getRequestConfig(async () => ({
      messages: (await import(`./public/locales/${defaultLocale}.json`)).default,
    }))
  }

  return {
    messages: (await import(`./public/locales/${locale}.json`)).default,
  }
})

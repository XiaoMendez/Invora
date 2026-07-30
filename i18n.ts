import { getRequestConfig } from 'next-intl/server'

const locales = ['es', 'en', 'pt'] as const
export type Locale = typeof locales[number]

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}))

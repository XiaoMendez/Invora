export const defaultLocale = 'es'
export const locales = ['es', 'en', 'pt'] as const
export type Locale = (typeof locales)[number]

export const languageNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
}

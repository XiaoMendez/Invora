import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => {
  // Validate locale
  if (!['es', 'en', 'pt'].includes(locale)) {
    return {
      messages: {},
    }
  }

  try {
    const messages = await import(`./lib/i18n/locales/${locale}.json`).then(
      (module) => module.default
    )

    return {
      messages,
      timeZone: 'UTC',
      now: new Date(),
    }
  } catch (error) {
    console.error(`[v0] Error loading messages for locale ${locale}:`, error)
    return {
      messages: {},
    }
  }
})

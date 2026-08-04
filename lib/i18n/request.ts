{
  import { getRequestConfig } from 'next-intl/server'
  import { locales, defaultLocale } from './config'
  
  export default getRequestConfig(async ({ locale }) => {
    const messages = await import(`./locales/${locale}.json`).then(
      (module) => module.default
    )
    
    return {
      messages,
      timeZone: 'UTC',
      now: new Date(),
    }
  })
}

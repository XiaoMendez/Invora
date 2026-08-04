'use client'

import { usePreferences } from '@/contexts/PreferencesContext'
import { useMemo } from 'react'

type TranslationKey = string

interface Translations {
  [key: string]: any
}

const translationsMap: Record<string, Translations> = {
  es: require('@/lib/i18n/locales/es.json'),
  en: require('@/lib/i18n/locales/en.json'),
  pt: require('@/lib/i18n/locales/pt.json'),
}

export function useTranslation() {
  const { preferences } = usePreferences()

  const t = useMemo(() => {
    return (key: TranslationKey, defaultValue?: string): string => {
      const keys = key.split('.')
      let value: any = translationsMap[preferences.locale] || translationsMap.es

      for (const k of keys) {
        value = value?.[k]
      }

      return typeof value === 'string' ? value : defaultValue || key
    }
  }, [preferences.locale])

  return { t, locale: preferences.locale }
}

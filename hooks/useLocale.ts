'use client'

import { useLocale as useIntlLocale } from 'next-intl'

export function useLocale() {
  return useIntlLocale()
}

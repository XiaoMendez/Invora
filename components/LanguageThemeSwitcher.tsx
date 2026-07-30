'use client'

import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { Globe, Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

export function LanguageThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)

  // Usar useEffect para evitar hydration mismatch
  if (typeof window !== 'undefined' && !mounted) {
    setMounted(true)
  }

  const handleLanguageChange = (locale: string) => {
    startTransition(() => {
      localStorage.setItem('NEXT_LOCALE', locale)
      router.push(`/${locale}`)
    })
  }

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Globe className="h-4 w-4 rotate-0 scale-100 transition-all" />
          <span className="sr-only">Toggle language and theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Language Section */}
        <DropdownMenuLabel className="text-xs font-semibold">
          {t('common.language')}
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleLanguageChange('es')} disabled={isPending}>
          <span className="text-sm">Español</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('en')} disabled={isPending}>
          <span className="text-sm">English</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('pt')} disabled={isPending}>
          <span className="text-sm">Português</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Theme Section */}
        <DropdownMenuLabel className="text-xs font-semibold">
          {t('common.theme')}
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="h-4 w-4 mr-2" />
          <span className="text-sm">{t('common.light')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="h-4 w-4 mr-2" />
          <span className="text-sm">{t('common.dark')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="h-4 w-4 mr-2" />
          <span className="text-sm">{t('common.system')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

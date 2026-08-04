'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface ThemeLogoProps {
  width?: number
  height?: number
  alt?: string
  className?: string
}

export function ThemeLogo({ 
  width = 800, 
  height = 200, 
  alt = 'INVORA',
  className = 'h-24 w-auto'
}: ThemeLogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Use resolved theme to handle system preference
  const isDark = mounted && (theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark'))
  const logoSrc = isDark ? '/images/invora-logo.png' : '/images/invora-logo-light.png'

  return (
    <Image
      src={logoSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}

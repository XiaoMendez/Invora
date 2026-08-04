'use client'

import Image from 'next/image'

interface ThemeLogoProps {
  width?: number
  height?: number
  alt?: string
  className?: string
}

/**
 * Renders both logos and toggles them with Tailwind's `dark:` variant,
 * which is driven by the class "dark" on <html> (added by next-themes with
 * attribute="class"). No JS state needed — works on first paint with no flash.
 *
 * Default (no "dark" class on html) = light mode → show light logo.
 * "dark" class on html              = dark mode  → show dark logo.
 */
export function ThemeLogo({
  width = 800,
  height = 200,
  alt = 'INVORA',
  className = 'h-14 w-auto',
}: ThemeLogoProps) {
  return (
    <>
      {/* Light logo: visible in light mode, hidden in dark mode */}
      <Image
        src="/images/invora-logo-light.png"
        alt={alt}
        width={width}
        height={height}
        className={`${className} object-contain block dark:hidden`}
        priority
      />
      {/* Dark logo: hidden in light mode, visible in dark mode */}
      <Image
        src="/images/invora-logo.png"
        alt={alt}
        width={width}
        height={height}
        className={`${className} object-contain hidden dark:block`}
        priority
      />
    </>
  )
}

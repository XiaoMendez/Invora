'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const themes = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Oscuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ]

  const currentTheme = themes.find((t) => t.value === theme)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-sm"
        title="Cambiar tema"
      >
        {currentTheme && <currentTheme.icon className="h-4 w-4" />}
        <span className="flex-1 text-left">{currentTheme?.label || 'Tema'}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-full bg-[oklch(0.13_0.015_280)] border border-border/30 rounded-lg shadow-lg z-50">
          {themes.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.value}
                onClick={() => {
                  setTheme(t.value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  theme === t.value
                    ? 'bg-accent/20 text-accent'
                    : 'hover:bg-secondary/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

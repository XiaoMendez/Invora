'use client'

import { useToast, ToastType } from '@/contexts/ToastContext'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

const typeStyles: Record<ToastType, { bar: string; text: string }> = {
  success: { bar: 'bg-emerald-500', text: 'text-emerald-500' },
  error:   { bar: 'bg-red-500',     text: 'text-red-500' },
  warning: { bar: 'bg-amber-500',   text: 'text-amber-500' },
  info:    { bar: 'bg-primary',     text: 'text-primary' },
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-72">
      {toasts.map((toast) => {
        const style = typeStyles[toast.type]
        return (
          <div
            key={toast.id}
            className="relative overflow-hidden rounded-lg bg-card border border-border/40 shadow-lg animate-in slide-in-from-bottom-4 duration-200"
          >
            {/* Accent bar on the left */}
            <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${style.bar}`} />

            <div className="flex items-center gap-3 px-4 py-3 pl-5">
              <p className="flex-1 text-sm text-foreground leading-snug">
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

'use client'

import { useToast, ToastType } from '@/contexts/ToastContext'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'

const toastStyles: Record<ToastType, { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-green-950/80 backdrop-blur',
    border: 'border-green-700/50',
    icon: <CheckCircle className="h-5 w-5 text-green-400" />,
  },
  error: {
    bg: 'bg-red-950/80 backdrop-blur',
    border: 'border-red-700/50',
    icon: <AlertCircle className="h-5 w-5 text-red-400" />,
  },
  warning: {
    bg: 'bg-amber-950/80 backdrop-blur',
    border: 'border-amber-700/50',
    icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
  },
  info: {
    bg: 'bg-blue-950/80 backdrop-blur',
    border: 'border-blue-700/50',
    icon: <Info className="h-5 w-5 text-blue-400" />,
  },
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => {
        const style = toastStyles[toast.type]
        return (
          <div
            key={toast.id}
            className={`${style.bg} ${style.border} border rounded-lg p-4 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200`}
          >
            <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
            <div className="flex-1">
              <p className="text-sm text-foreground">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-foreground/60 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

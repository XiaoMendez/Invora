import { AlertCircle, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  value: string | number
  onChange: (value: string) => void
  error?: string
  success?: boolean
  required?: boolean
  disabled?: boolean
  maxLength?: number
  hint?: string
  className?: string
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  required = false,
  disabled = false,
  maxLength,
  hint,
  className = '',
}: FormFieldProps) {
  const hasError = !!error
  const showSuccess = success && !hasError

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor={name} className="text-sm text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {maxLength && (
          <span className={`text-xs ${String(value).length > maxLength * 0.9 ? 'text-amber-500' : 'text-muted-foreground'}`}>
            {String(value).length}/{maxLength}
          </span>
        )}
      </div>

      <div className="relative">
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={maxLength}
          className={`bg-secondary/50 border-border/30 ${
            hasError
              ? 'border-destructive/50 focus-visible:border-destructive focus-visible:ring-destructive/20'
              : showSuccess
              ? 'border-green-500/50 focus-visible:border-green-500 focus-visible:ring-green-500/20'
              : ''
          }`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : hint ? `${name}-hint` : undefined}
        />

        {showSuccess && (
          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
        {hasError && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
        )}
      </div>

      {hasError && (
        <p id={`${name}-error`} className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {hint && !hasError && (
        <p id={`${name}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  )
}

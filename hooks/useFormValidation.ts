import { useState, useCallback } from 'react'

interface FieldValidator {
  (value: any): { valid: boolean; error?: string }
}

interface FormFieldState {
  value: any
  error?: string
  touched: boolean
}

interface UseFormValidationOptions {
  initialValues: Record<string, any>
  validators?: Record<string, FieldValidator>
  onSubmit?: (values: Record<string, any>) => void | Promise<void>
}

export function useFormValidation({
  initialValues,
  validators = {},
  onSubmit,
}: UseFormValidationOptions) {
  const [fields, setFields] = useState<Record<string, FormFieldState>>(
    Object.entries(initialValues).reduce((acc, [key, value]) => {
      acc[key] = { value, error: undefined, touched: false }
      return acc
    }, {} as Record<string, FormFieldState>)
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState<string>()

  // Validate a single field
  const validateField = useCallback(
    (fieldName: string, value: any) => {
      const validator = validators[fieldName]
      if (!validator) return { valid: true }

      const result = validator(value)
      return result
    },
    [validators]
  )

  // Update field value
  const setFieldValue = useCallback((fieldName: string, value: any) => {
    setFields((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        error: undefined, // Clear error when user starts typing
      },
    }))
  }, [])

  // Mark field as touched and validate
  const setFieldTouched = useCallback(
    (fieldName: string) => {
      const field = fields[fieldName]
      const validation = validateField(fieldName, field.value)

      setFields((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          touched: true,
          error: !validation.valid ? validation.error : undefined,
        },
      }))
    },
    [fields, validateField]
  )

  // Handle field blur
  const handleBlur = useCallback(
    (fieldName: string) => {
      setFieldTouched(fieldName)
    },
    [setFieldTouched]
  )

  // Handle field change
  const handleChange = useCallback(
    (fieldName: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value
      setFieldValue(fieldName, value)
    },
    [setFieldValue]
  )

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors: Record<string, string> = {}
    const validationResults: Record<string, boolean> = {}

    Object.entries(fields).forEach(([fieldName, field]) => {
      const validation = validateField(fieldName, field.value)
      validationResults[fieldName] = validation.valid

      if (!validation.valid && validation.error) {
        newErrors[fieldName] = validation.error
      }
    })

    setFields((prev) =>
      Object.entries(prev).reduce(
        (acc, [fieldName, field]) => {
          acc[fieldName] = {
            ...field,
            touched: true,
            error: newErrors[fieldName],
          }
          return acc
        },
        {} as Record<string, FormFieldState>
      )
    )

    return Object.values(validationResults).every((v) => v === true)
  }, [fields, validateField])

  // Handle form submission
  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault()
      setGlobalError(undefined)

      if (!validateAll()) {
        return
      }

      setIsSubmitting(true)

      try {
        const values = Object.entries(fields).reduce(
          (acc, [key, field]) => {
            acc[key] = field.value
            return acc
          },
          {} as Record<string, any>
        )

        await onSubmit?.(values)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred'
        setGlobalError(message)
      } finally {
        setIsSubmitting(false)
      }
    },
    [fields, validateAll, onSubmit]
  )

  // Reset form
  const reset = useCallback(() => {
    setFields(
      Object.entries(initialValues).reduce((acc, [key, value]) => {
        acc[key] = { value, error: undefined, touched: false }
        return acc
      }, {} as Record<string, FormFieldState>)
    )
    setGlobalError(undefined)
  }, [initialValues])

  // Get field props for easy integration
  const getFieldProps = useCallback(
    (fieldName: string) => ({
      value: fields[fieldName]?.value ?? '',
      onChange: handleChange(fieldName),
      onBlur: () => handleBlur(fieldName),
      error: fields[fieldName]?.error,
      touched: fields[fieldName]?.touched,
    }),
    [fields, handleChange, handleBlur]
  )

  return {
    fields,
    isSubmitting,
    globalError,
    setGlobalError,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    validateAll,
    reset,
    getFieldProps,
  }
}

/**
 * Validation utilities for form inputs
 * All validators return { valid: boolean, error?: string }
 */

interface ValidationResult {
  valid: boolean
  error?: string
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  if (!email?.trim()) {
    return { valid: false, error: "Email is required" }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Please enter a valid email address" }
  }

  return { valid: true }
}

// Password validation
export function validatePassword(password: string, minLength = 8): ValidationResult {
  if (!password) {
    return { valid: false, error: "Password is required" }
  }

  if (password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters` }
  }

  // Check for at least one uppercase letter, one lowercase letter, and one number
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      valid: false,
      error: "Password must contain uppercase, lowercase, and number",
    }
  }

  return { valid: true }
}

// Password match validation
export function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword) {
    return { valid: false, error: "Please confirm your password" }
  }

  if (password !== confirmPassword) {
    return { valid: false, error: "Passwords do not match" }
  }

  return { valid: true }
}

// Phone number validation (basic international format)
export function validatePhone(phone: string): ValidationResult {
  if (!phone?.trim()) {
    return { valid: false, error: "Phone number is required" }
  }

  // Remove common separators and spaces
  const cleaned = phone.replace(/[\s\-\(\)]/g, "")

  // Check if it's a valid length (10-15 digits for international)
  if (!/^[\d+]{10,15}$/.test(cleaned)) {
    return { valid: false, error: "Please enter a valid phone number" }
  }

  return { valid: true }
}

// URL validation
export function validateURL(url: string): ValidationResult {
  if (!url?.trim()) {
    return { valid: false, error: "URL is required" }
  }

  try {
    new URL(url)
    return { valid: true }
  } catch {
    return { valid: false, error: "Please enter a valid URL" }
  }
}

// Required field validation
export function validateRequired(value: string | null | undefined, fieldName = "This field"): ValidationResult {
  if (!value || !value.trim()) {
    return { valid: false, error: `${fieldName} is required` }
  }

  return { valid: true }
}

// Min length validation
export function validateMinLength(value: string, minLength: number, fieldName = "This field"): ValidationResult {
  if (!value) {
    return { valid: false, error: `${fieldName} is required` }
  }

  if (value.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` }
  }

  return { valid: true }
}

// Max length validation
export function validateMaxLength(value: string, maxLength: number, fieldName = "This field"): ValidationResult {
  if (!value) {
    return { valid: true } // Empty is allowed for max length
  }

  if (value.length > maxLength) {
    return { valid: false, error: `${fieldName} cannot exceed ${maxLength} characters` }
  }

  return { valid: true }
}

// Number validation
export function validateNumber(value: string | number, fieldName = "This field"): ValidationResult {
  if (value === "" || value === null || value === undefined) {
    return { valid: false, error: `${fieldName} is required` }
  }

  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number` }
  }

  return { valid: true }
}

// Positive number validation
export function validatePositiveNumber(value: string | number, fieldName = "This field"): ValidationResult {
  const numValidation = validateNumber(value, fieldName)
  if (!numValidation.valid) {
    return numValidation
  }

  const num = typeof value === "string" ? parseFloat(value) : value
  if (num <= 0) {
    return { valid: false, error: `${fieldName} must be greater than 0` }
  }

  return { valid: true }
}

// Range validation (min-max)
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName = "This field"
): ValidationResult {
  if (value < min || value > max) {
    return { valid: false, error: `${fieldName} must be between ${min} and ${max}` }
  }

  return { valid: true }
}

// Company name validation
export function validateCompanyName(name: string): ValidationResult {
  if (!name?.trim()) {
    return { valid: false, error: "Company name is required" }
  }

  if (name.length < 2) {
    return { valid: false, error: "Company name must be at least 2 characters" }
  }

  if (name.length > 100) {
    return { valid: false, error: "Company name cannot exceed 100 characters" }
  }

  return { valid: true }
}

// Tax ID validation (basic format for CR: 12-345678-9)
export function validateTaxID(taxId: string): ValidationResult {
  if (!taxId?.trim()) {
    return { valid: false, error: "Tax ID is required" }
  }

  // Allow flexible formats: XX-XXXXXX-X, XXXXXXXXX, etc.
  const cleaned = taxId.replace(/[\s\-]/g, "")
  if (!/^\d{9,12}$/.test(cleaned)) {
    return { valid: false, error: "Please enter a valid Tax ID format" }
  }

  return { valid: true }
}

// Validate multiple fields at once
export function validateForm(
  fields: Record<string, { value: string | number; validator: (val: any) => ValidationResult }>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  for (const [key, { value, validator }] of Object.entries(fields)) {
    const result = validator(value)
    if (!result.valid && result.error) {
      errors[key] = result.error
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Environment variable configuration for Invora
 * 
 * Required variables are validated on startup
 * Optional variables have fallbacks or are only needed for specific features
 */

// Required environment variables for the app to function
const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const

// Optional but recommended for full functionality
const RECOMMENDED_ENV_VARS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "AUTH_SECRET",
] as const

// Database connection - at least one is required for database features
const DATABASE_ENV_VARS = [
  "POSTGRES_URL",
  "DATABASE_URL", 
  "POSTGRES_URL_NON_POOLING",
] as const

export function validateEnvironment() {
  const missing = REQUIRED_ENV_VARS.filter((envVar) => !process.env[envVar])

  if (missing.length > 0) {
    console.error(
      "[Invora] Missing required environment variables:",
      missing.join(", ")
    )
    throw new Error(
      `Missing environment variables: ${missing.join(", ")}. ` +
      `Please set them in your hosting provider's environment settings. ` +
      `See .env.example for details.`
    )
  }

  // Warn about missing recommended variables (non-blocking)
  const missingRecommended = RECOMMENDED_ENV_VARS.filter(
    (envVar) => !process.env[envVar]
  )
  if (missingRecommended.length > 0 && process.env.NODE_ENV === "development") {
    console.warn(
      "[Invora] Missing recommended environment variables:",
      missingRecommended.join(", ")
    )
  }

  // Check if at least one database URL is set
  const hasDbConnection = DATABASE_ENV_VARS.some(
    (envVar) => process.env[envVar]
  )
  if (!hasDbConnection && process.env.NODE_ENV === "development") {
    console.warn(
      "[Invora] No database connection string found. " +
      "Set POSTGRES_URL, DATABASE_URL, or POSTGRES_URL_NON_POOLING for database features."
    )
  }
}

/**
 * Get environment variable with type safety
 */
export function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key]
  if (!value && !fallback) {
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value || fallback!
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development"
}

// Validate on module load
validateEnvironment()

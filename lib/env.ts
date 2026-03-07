export function validateEnvironment() {
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar])

  if (missing.length > 0) {
    console.error(
      "[v0] Missing environment variables:",
      missing.join(", ")
    )
    throw new Error(
      `Missing environment variables: ${missing.join(", ")}. Please set them in your Vercel project settings.`
    )
  }
}

// Validate on module load
validateEnvironment()

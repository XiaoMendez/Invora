/**
 * Type definitions for environment variables
 * This provides TypeScript IntelliSense for process.env
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // Node environment
    NODE_ENV: "development" | "production" | "test"

    // Supabase Configuration (Public)
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    SUPABASE_URL?: string
    SUPABASE_ANON_KEY?: string

    // Supabase Configuration (Secret - Server only)
    SUPABASE_SERVICE_ROLE_KEY?: string
    SUPABASE_JWT_SECRET?: string

    // Database Configuration
    POSTGRES_URL?: string
    POSTGRES_PRISMA_URL?: string
    POSTGRES_URL_NON_POOLING?: string
    DATABASE_URL?: string
    POSTGRES_HOST?: string
    POSTGRES_USER?: string
    POSTGRES_PASSWORD?: string
    POSTGRES_DATABASE?: string

    // Authentication
    AUTH_SECRET?: string

    // AI Services
    ANTHROPIC_AUTH_TOKEN?: string
    AI_GATEWAY_API_KEY?: string

    // Analytics
    VERCEL_WEB_ANALYTICS_ID?: string
  }
}

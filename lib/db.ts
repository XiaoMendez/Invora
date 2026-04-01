import { Pool } from "pg"

let pool: Pool

/**
 * Gets or creates a PostgreSQL connection pool
 * Supports multiple connection string environment variables for flexibility
 * when migrating between different hosting providers
 */
function getPool() {
  if (!pool) {
    // Try multiple connection string environment variables
    // Priority: POSTGRES_URL > DATABASE_URL > POSTGRES_URL_NON_POOLING
    const connectionString = 
      process.env.POSTGRES_URL || 
      process.env.DATABASE_URL || 
      process.env.POSTGRES_URL_NON_POOLING

    if (!connectionString) {
      throw new Error(
        "Database connection string not found. " +
        "Please set one of: POSTGRES_URL, DATABASE_URL, or POSTGRES_URL_NON_POOLING"
      )
    }

    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  }
  return pool
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const client = await getPool().connect()
  try {
    const result = await client.query(text, params)
    return result.rows as T[]
  } finally {
    client.release()
  }
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] || null
}

export default getPool

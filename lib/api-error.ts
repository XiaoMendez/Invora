/**
 * Extracts a readable message + Postgres/PostgREST diagnostic fields from any
 * error thrown inside an API route, so it can be surfaced in the JSON
 * response instead of getting swallowed into a generic "Error al..." string.
 *
 * Supabase/PostgREST errors typically look like:
 * { message, details, hint, code }
 */
export function describeError(error: unknown) {
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>
    return {
      message: typeof e.message === "string" ? e.message : String(error),
      code: e.code ?? null,
      details: e.details ?? null,
      hint: e.hint ?? null,
    }
  }
  return { message: String(error), code: null, details: null, hint: null }
}

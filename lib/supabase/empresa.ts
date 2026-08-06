import { SupabaseClient } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/server"

export class EmpresaNotConfiguredError extends Error {
  constructor() {
    super("Usuario no tiene una empresa configurada. Completa el onboarding.")
    this.name = "EmpresaNotConfiguredError"
  }
}

export class UserNotAuthenticatedError extends Error {
  constructor() {
    super("Usuario no autenticado")
    this.name = "UserNotAuthenticatedError"
  }
}

/**
 * Get the empresa ID for the authenticated user.
 * Uses the admin client for the DB lookup so RLS never blocks it —
 * the regular client's policies on usuario_empresa can silently return
 * null for freshly-created accounts, causing false 403/500 errors across
 * every API route that calls this helper.
 */
export async function getEmpresaId(supabase: SupabaseClient): Promise<string> {
  // Auth check uses the cookie-bound client (correct)
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new UserNotAuthenticatedError()
  }

  // DB lookup uses admin client to bypass RLS
  const adminClient = createAdminClient()
  const { data: userEmpresa, error } = await adminClient
    .from("usuario_empresa")
    .select("id_empresa")
    .eq("id_usuario", user.id)
    .single()

  if (error || !userEmpresa?.id_empresa) {
    throw new EmpresaNotConfiguredError()
  }

  return userEmpresa.id_empresa
}

/**
 * Get the user object with their empresa information.
 */
export async function getUserWithEmpresa(supabase: SupabaseClient) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new UserNotAuthenticatedError()
  }

  const empresaId = await getEmpresaId(supabase)

  return { user, empresaId }
}

/**
 * Check if user has a configured empresa.
 */
export async function hasEmpresaConfigured(supabase: SupabaseClient): Promise<boolean> {
  try {
    await getEmpresaId(supabase)
    return true
  } catch {
    return false
  }
}

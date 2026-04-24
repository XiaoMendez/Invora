import { SupabaseClient } from "@supabase/supabase-js"

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
 * Get the empresa ID for the authenticated user
 * Uses the user's ID to find their associated empresa in usuario_empresa table
 */
export async function getEmpresaId(supabase: SupabaseClient): Promise<string> {
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new UserNotAuthenticatedError()
  }

  // Query the usuario_empresa table to get the empresa
  const { data: userEmpresa, error } = await supabase
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
 * Get the user object with their empresa information
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
 * Check if user has a configured empresa
 */
export async function hasEmpresaConfigured(supabase: SupabaseClient): Promise<boolean> {
  try {
    await getEmpresaId(supabase)
    return true
  } catch {
    return false
  }
}

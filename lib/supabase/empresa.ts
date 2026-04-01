import { SupabaseClient } from "@supabase/supabase-js"

/**
 * Get the empresa ID for the authenticated user
 * Uses the user's ID to find their associated empresa in usuario_empresa table
 */
export async function getEmpresaId(supabase: SupabaseClient): Promise<string> {
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("Usuario no autenticado")
  }

  // Query the usuario_empresa table to get the empresa
  const { data: userEmpresa, error } = await supabase
    .from("usuario_empresa")
    .select("id_empresa")
    .eq("id_usuario", user.id)
    .single()

  if (error || !userEmpresa) {
    throw new Error("Usuario no tiene acceso a ninguna empresa")
  }

  return userEmpresa.id_empresa
}

/**
 * Get the user object with their empresa information
 */
export async function getUserWithEmpresa(supabase: SupabaseClient) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("Usuario no autenticado")
  }

  const empresaId = await getEmpresaId(supabase)

  return { user, empresaId }
}

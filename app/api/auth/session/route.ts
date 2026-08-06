import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Use regular client ONLY for auth check (reads from cookies)
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Use admin client for DB reads so RLS never blocks the session check.
    // The regular client's RLS on empresa_select_own does a sub-SELECT on
    // usuario_empresa which can silently return null for freshly-created
    // accounts, causing needsOnboarding to flip true incorrectly.
    const adminClient = createAdminClient()

    const { data: userEmpresa } = await adminClient
      .from("usuario_empresa")
      .select("id_empresa, rol")
      .eq("id_usuario", user.id)
      .single()

    let empresa = null
    if (userEmpresa?.id_empresa) {
      const { data: empresaData } = await adminClient
        .from("empresa")
        .select("id, nombre, email")
        .eq("id", userEmpresa.id_empresa)
        .single()
      empresa = empresaData ?? null
    }

    const hasEmpresa = !!empresa

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
      empresa,
      rol: userEmpresa?.rol || null,
      needsOnboarding: !hasEmpresa,
    })
  } catch (error) {
    console.error("[v0] Session error:", error)
    return NextResponse.json(
      { authenticated: false, error: "Error al obtener la sesion" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
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

    // Get empresa data through usuario_empresa relationship
    const { data: userEmpresa } = await supabase
      .from("usuario_empresa")
      .select("id_empresa, rol, empresa:id_empresa(id, nombre, email)")
      .eq("id_usuario", user.id)
      .single()

    // Check if user has an empresa configured
    const hasEmpresa = userEmpresa && userEmpresa.empresa
    const empresa = hasEmpresa ? (userEmpresa.empresa as { id: string; nombre: string; email: string }) : null

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
      empresa: empresa,
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

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contrasenya son requeridos" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message || "Error al crear la cuenta" },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Error al crear la cuenta" },
        { status: 500 }
      )
    }

    // Do NOT create empresa here - let the user complete onboarding
    // The empresa and usuario_empresa records will be created in /api/empresa/setup

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      message: "Cuenta creada exitosamente. Verifica tu correo para confirmar.",
      needsOnboarding: true,
    })
  } catch (error) {
    console.error("[v0] Register error:", error)
    const message =
      error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

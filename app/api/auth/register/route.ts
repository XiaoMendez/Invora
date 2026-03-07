import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, email, password } = body

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          empresa_nombre: nombre.trim(),
        },
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

    // Create empresa record in database with the user's ID
    try {
      await supabase.from("empresa").insert({
        id: data.user.id,
        nombre: nombre.trim(),
        email: email.toLowerCase().trim(),
      })

      // Create default categories
      const categorias = [
        { nombre: "General", descripcion: "Categoría general" },
        { nombre: "Alimentos", descripcion: "Productos alimenticios" },
        { nombre: "Bebidas", descripcion: "Bebidas y líquidos" },
        { nombre: "Limpieza", descripcion: "Productos de limpieza" },
      ]

      await supabase.from("categoria").insert(
        categorias.map((cat) => ({
          id_empresa: data.user.id,
          ...cat,
        }))
      )
    } catch (dbError) {
      console.error("[v0] Error creating empresa or categories:", dbError)
      // Don't fail registration if db creation fails
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      message: "Cuenta creada exitosamente. Verifica tu correo para confirmar.",
    })
  } catch (error) {
    console.error("[v0] Register error:", error)
    const message =
      error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

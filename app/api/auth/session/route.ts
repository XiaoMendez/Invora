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

    // Get empresa data from database
    const { data: empresa } = await supabase
      .from("empresa")
      .select("id, nombre, email")
      .eq("id", user.id)
      .single()

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
      empresa: empresa || {
        id: user.id,
        nombre: user.user_metadata?.empresa_nombre || "Mi Empresa",
        email: user.email,
      },
    })
  } catch (error) {
    console.error("[v0] Session error:", error)
    return NextResponse.json(
      { authenticated: false, error: "Error al obtener la sesión" },
      { status: 500 }
    )
  }
}

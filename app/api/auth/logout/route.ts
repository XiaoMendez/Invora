import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()
    
    await supabase.auth.signOut()

    return NextResponse.json(
      { success: true, message: "Sesión cerrada exitosamente" },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    )
  }
}

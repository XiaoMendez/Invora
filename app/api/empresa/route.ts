import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { data: empresa, error } = await supabase
      .from("empresa")
      .select("id, nombre, email, telefono, direccion, id_fiscal, logo_url")
      .eq("id", user.id)
      .single()

    if (error && error.code !== "PGRST116") throw error

    return NextResponse.json({ empresa: empresa || null, userEmail: user.email })
  } catch (error) {
    console.error("[empresa GET]", error)
    return NextResponse.json({ error: "Error al cargar datos de empresa" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { nombre, telefono, direccion, id_fiscal } = body

    if (!nombre?.trim()) {
      return NextResponse.json({ error: "El nombre de la empresa es requerido" }, { status: 400 })
    }

    // Check if empresa exists
    const { data: existing } = await supabase
      .from("empresa")
      .select("id")
      .eq("id", user.id)
      .single()

    let empresa
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("empresa")
        .update({
          nombre: nombre.trim(),
          telefono: telefono?.trim() || null,
          direccion: direccion?.trim() || null,
          id_fiscal: id_fiscal?.trim() || null,
        })
        .eq("id", user.id)
        .select("id, nombre, email, telefono, direccion, id_fiscal")
        .single()

      if (error) throw error
      empresa = data
    } else {
      // Create new
      const { data, error } = await supabase
        .from("empresa")
        .insert({
          id: user.id,
          nombre: nombre.trim(),
          email: user.email,
          telefono: telefono?.trim() || null,
          direccion: direccion?.trim() || null,
          id_fiscal: id_fiscal?.trim() || null,
        })
        .select("id, nombre, email, telefono, direccion, id_fiscal")
        .single()

      if (error) throw error
      empresa = data
    }

    return NextResponse.json({ empresa, success: true })
  } catch (error) {
    console.error("[empresa PUT]", error)
    return NextResponse.json({ error: "Error al actualizar empresa" }, { status: 500 })
  }
}

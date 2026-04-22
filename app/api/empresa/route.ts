import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 })
    }

    const empresaId = await getEmpresaId(supabase)

    const { data: empresa, error } = await supabase
      .from("empresa")
      .select("id, nombre, email, telefono, direccion, id_fiscal, logo_url")
      .eq("id", empresaId)
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
      return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 })
    }

    const empresaId = await getEmpresaId(supabase)

    const body = await request.json()
    const { nombre, telefono, direccion, id_fiscal } = body

    if (!nombre?.trim()) {
      return NextResponse.json({ error: "El nombre de la empresa es requerido" }, { status: 400 })
    }

    // Check if empresa exists
    const { data: existing } = await supabase
      .from("empresa")
      .select("id")
      .eq("id", empresaId)
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
        .eq("id", empresaId)
        .select("id, nombre, email, telefono, direccion, id_fiscal")
        .single()

      if (error) throw error
      empresa = data
    } else {
      // Create new - this is for first-time setup, user creates their empresa
      // In normal flow, empresa is created during registration
      return NextResponse.json(
        { error: "Debe crear la empresa primero durante el registro" },
        { status: 404 }
      )
    }

    return NextResponse.json({ empresa, success: true })
  } catch (error) {
    console.error("[empresa PUT]", error)
    return NextResponse.json({ error: "Error al actualizar empresa" }, { status: 500 })
  }
}

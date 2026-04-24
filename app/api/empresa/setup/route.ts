import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    // Check if user already has an empresa
    const { data: existingRelation } = await supabase
      .from("usuario_empresa")
      .select("id_empresa")
      .eq("id_usuario", user.id)
      .single()

    if (existingRelation?.id_empresa) {
      return NextResponse.json(
        { error: "Ya tienes una empresa configurada" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { nombre, email, telefono, direccion, id_fiscal } = body

    if (!nombre?.trim()) {
      return NextResponse.json(
        { error: "El nombre de la empresa es requerido" },
        { status: 400 }
      )
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "El email de la empresa es requerido" },
        { status: 400 }
      )
    }

    // Create empresa record (columns: id, nombre, email, telefono, direccion, id_fiscal, logo_url, activo, creado_en, actualizado_en)
    const { data: empresa, error: empresaError } = await supabase
      .from("empresa")
      .insert({
        nombre: nombre.trim(),
        email: email.toLowerCase().trim(),
        telefono: telefono?.trim() || null,
        direccion: direccion?.trim() || null,
        id_fiscal: id_fiscal?.trim() || null,
      })
      .select("id")
      .single()

    if (empresaError) {
      console.error("[v0] Error creating empresa:", empresaError)
      return NextResponse.json(
        { error: "Error al crear la empresa" },
        { status: 500 }
      )
    }

    // Create usuario_empresa relationship
    const { error: relationError } = await supabase
      .from("usuario_empresa")
      .insert({
        id_usuario: user.id,
        id_empresa: empresa.id,
        rol: "admin",
      })

    if (relationError) {
      console.error("[v0] Error creating usuario_empresa:", relationError)
      // Rollback empresa creation
      await supabase.from("empresa").delete().eq("id", empresa.id)
      return NextResponse.json(
        { error: "Error al vincular usuario con empresa" },
        { status: 500 }
      )
    }

    // Create default categories
    const categorias = [
      { nombre: "General", descripcion: "Categoria general" },
      { nombre: "Alimentos", descripcion: "Productos alimenticios" },
      { nombre: "Bebidas", descripcion: "Bebidas y liquidos" },
      { nombre: "Limpieza", descripcion: "Productos de limpieza" },
      { nombre: "Electronica", descripcion: "Productos electronicos" },
    ]

    await supabase.from("categoria").insert(
      categorias.map((cat) => ({
        id_empresa: empresa.id,
        ...cat,
      }))
    )

    return NextResponse.json({
      success: true,
      empresa: {
        id: empresa.id,
        nombre: nombre.trim(),
        email: email.trim(),
      },
      message: "Empresa configurada exitosamente",
    })
  } catch (error) {
    console.error("[v0] Setup empresa error:", error)
    const message = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

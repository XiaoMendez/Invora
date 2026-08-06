import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    // Use regular client for authentication check
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    // Use admin client for database operations (bypasses RLS)
    const adminClient = createAdminClient()

    // Check if user already has a fully configured empresa — if so, just return success
    const { data: existingRelation } = await adminClient
      .from("usuario_empresa")
      .select("id_empresa")
      .eq("id_usuario", user.id)
      .single()

    if (existingRelation?.id_empresa) {
      const { data: existingEmpresa } = await adminClient
        .from("empresa")
        .select("id, nombre, email")
        .eq("id", existingRelation.id_empresa)
        .single()

      return NextResponse.json({
        success: true,
        empresa: existingEmpresa,
        message: "Empresa ya configurada",
      })
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

    const emailNormalized = email.toLowerCase().trim()

    // Check if email is already taken by another empresa
    const { data: emailConflict } = await adminClient
      .from("empresa")
      .select("id")
      .eq("email", emailNormalized)
      .single()

    if (emailConflict) {
      return NextResponse.json(
        { error: "Ya existe una empresa registrada con ese email. Usa otro email." },
        { status: 409 }
      )
    }

    // Create empresa record using admin client (bypasses RLS)
    const { data: empresa, error: empresaError } = await adminClient
      .from("empresa")
      .insert({
        nombre: nombre.trim(),
        email: emailNormalized,
        telefono: telefono?.trim() || null,
        direccion: direccion?.trim() || null,
        id_fiscal: id_fiscal?.trim() || null,
      })
      .select("id")
      .single()

    if (empresaError) {
      console.error("[v0] Error creating empresa:", empresaError)
      // Handle unique email violation gracefully
      if (empresaError.code === "23505") {
        return NextResponse.json(
          { error: "Ya existe una empresa con ese email. Usa otro email." },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: "Error al crear la empresa: " + empresaError.message },
        { status: 500 }
      )
    }

    // Create usuario_empresa relationship
    const { error: relationError } = await adminClient
      .from("usuario_empresa")
      .insert({
        id_usuario: user.id,
        id_empresa: empresa.id,
        rol: "admin",
      })

    if (relationError) {
      console.error("[v0] Error creating usuario_empresa:", relationError)
      // Rollback empresa creation
      await adminClient.from("empresa").delete().eq("id", empresa.id)
      return NextResponse.json(
        { error: "Error al vincular usuario con empresa: " + relationError.message },
        { status: 500 }
      )
    }

    // Create default categories (best-effort, don't fail setup if this errors)
    const categorias = [
      { nombre: "General", descripcion: "Categoria general" },
      { nombre: "Alimentos", descripcion: "Productos alimenticios" },
      { nombre: "Bebidas", descripcion: "Bebidas y liquidos" },
      { nombre: "Limpieza", descripcion: "Productos de limpieza" },
      { nombre: "Electronica", descripcion: "Productos electronicos" },
    ]

    const { error: catError } = await adminClient.from("categoria").insert(
      categorias.map((cat) => ({ id_empresa: empresa.id, ...cat }))
    )

    if (catError) {
      console.error("[v0] Warning: could not create default categories:", catError.message)
    }

    return NextResponse.json({
      success: true,
      empresa: {
        id: empresa.id,
        nombre: nombre.trim(),
        email: emailNormalized,
      },
      message: "Empresa configurada exitosamente",
    })
  } catch (error) {
    console.error("[v0] Setup empresa error:", error)
    const message = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

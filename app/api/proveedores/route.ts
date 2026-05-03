import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId, EmpresaNotConfiguredError, UserNotAuthenticatedError } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    let query = supabase
      .from("proveedor")
      .select("*")
      .eq("id_empresa", empresaId)
      .order("nombre", { ascending: true })

    if (search) {
      query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%,telefono.ilike.%${search}%`)
    }

    const { data: proveedores, error } = await query

    if (error) throw error

    return NextResponse.json({ proveedores: proveedores || [] })
  } catch (error) {
    console.error("[proveedores GET]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al cargar proveedores" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const body = await request.json()
    const { nombre, email, telefono, direccion, notas } = body

    if (!nombre?.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    const { data: proveedor, error } = await supabase
      .from("proveedor")
      .insert({
        id_empresa: empresaId,
        nombre: nombre.trim(),
        email: email?.toLowerCase().trim() || null,
        telefono: telefono?.trim() || null,
        direccion: direccion?.trim() || null,
        notas: notas?.trim() || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ proveedor })
  } catch (error) {
    console.error("[proveedores POST]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al crear proveedor" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const body = await request.json()
    const { id, nombre, email, telefono, direccion, notas, activo } = body

    if (!id) {
      return NextResponse.json({ error: "ID es requerido" }, { status: 400 })
    }

    if (!nombre?.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    const { data: proveedor, error } = await supabase
      .from("proveedor")
      .update({
        nombre: nombre.trim(),
        email: email?.toLowerCase().trim() || null,
        telefono: telefono?.trim() || null,
        direccion: direccion?.trim() || null,
        notas: notas?.trim() || null,
        activo: activo !== undefined ? activo : true,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("id_empresa", empresaId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ proveedor })
  } catch (error) {
    console.error("[proveedores PUT]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al actualizar proveedor" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID es requerido" }, { status: 400 })
    }

    const { error } = await supabase
      .from("proveedor")
      .delete()
      .eq("id", id)
      .eq("id_empresa", empresaId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[proveedores DELETE]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al eliminar proveedor" }, { status: 500 })
  }
}

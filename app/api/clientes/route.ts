import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getEmpresaId, EmpresaNotConfiguredError, UserNotAuthenticatedError } from "@/lib/supabase/empresa"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let query = supabase
      .from("cliente")
      .select("*")
      .eq("id_empresa", empresaId)
      .order("nombre", { ascending: true })

    if (search) {
      query = query.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%,correo.ilike.%${search}%,telefono.ilike.%${search}%`)
    }

    const { data: clientes, error } = await query

    if (error) throw error

    return NextResponse.json({ clientes })
  } catch (error) {
    console.error("[clientes GET]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const empresaId = await getEmpresaId(supabase)

    const body = await request.json()
    const { nombre, apellido, correo, telefono, direccion } = body

    if (!nombre?.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    const { data: cliente, error } = await adminClient
      .from("cliente")
      .insert({
        id_empresa: empresaId,
        nombre: nombre.trim(),
        apellido: apellido?.trim() || null,
        correo: correo?.toLowerCase().trim() || null,
        telefono: telefono?.trim() || null,
        direccion: direccion?.trim() || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ cliente })
  } catch (error) {
    console.error("[clientes POST]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const empresaId = await getEmpresaId(supabase)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const body = await request.json()
    const { nombre, apellido, correo, telefono, direccion, activo } = body

    if (!id) {
      return NextResponse.json({ error: "ID es requerido" }, { status: 400 })
    }

    if (!nombre?.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    const { data: cliente, error } = await adminClient
      .from("cliente")
      .update({
        nombre: nombre.trim(),
        apellido: apellido?.trim() || null,
        correo: correo?.toLowerCase().trim() || null,
        telefono: telefono?.trim() || null,
        direccion: direccion?.trim() || null,
        activo: activo !== undefined ? activo : true,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("id_empresa", empresaId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ cliente })
  } catch (error) {
    console.error("[clientes PUT]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const empresaId = await getEmpresaId(supabase)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID es requerido" }, { status: 400 })
    }

    const { error } = await adminClient
      .from("cliente")
      .delete()
      .eq("id", id)
      .eq("id_empresa", empresaId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[clientes DELETE]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al eliminar cliente" }, { status: 500 })
  }
}

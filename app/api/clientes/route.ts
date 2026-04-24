import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { data, error } = await supabase
      .from("cliente")
      .select("id, nombre, apellido, correo, telefono")
      .eq("id_empresa", empresaId)
      .eq("activo", true)
      .order("nombre", { ascending: true })

    if (error) throw error
    return NextResponse.json({ clientes: data || [] })
  } catch (error) {
    console.error("[clientes GET]", error)
    return NextResponse.json({ error: "Error al cargar clientes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const body = await request.json()

    const nombre = (body.nombre as string | undefined)?.trim()
    const apellido = (body.apellido as string | undefined)?.trim() || null
    const correo = (body.correo as string | undefined)?.trim() || null
    const telefono = (body.telefono as string | undefined)?.trim() || null

    if (!nombre) {
      return NextResponse.json({ error: "El nombre del cliente es requerido" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("cliente")
      .insert({
        id_empresa: empresaId,
        nombre,
        apellido,
        correo,
        telefono,
      })
      .select("id, nombre, apellido, correo, telefono")
      .single()

    if (error) throw error

    return NextResponse.json({ cliente: data, success: true })
  } catch (error) {
    console.error("[clientes POST]", error)
    const message = error instanceof Error ? error.message : "Error al crear cliente"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

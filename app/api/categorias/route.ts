import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { data: categorias, error } = await supabase
      .from("categoria")
      .select("id, nombre, descripcion")
      .eq("id_empresa", empresaId)
      .order("nombre", { ascending: true })

    if (error) throw error
    return NextResponse.json({ categorias: categorias || [] })
  } catch (error) {
    console.error("[categorias GET]", error)
    return NextResponse.json({ error: "Error al cargar categorias" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const body = await request.json()
    const { nombre, descripcion } = body

    if (!nombre?.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    const { data: categoria, error } = await supabase
      .from("categoria")
      .insert({ id_empresa: empresaId, nombre: nombre.trim(), descripcion: descripcion?.trim() || null })
      .select("id, nombre, descripcion")
      .single()

    if (error) throw error
    return NextResponse.json({ categoria, success: true })
  } catch (error) {
    console.error("[categorias POST]", error)
    return NextResponse.json({ error: "Error al crear categoria" }, { status: 500 })
  }
}

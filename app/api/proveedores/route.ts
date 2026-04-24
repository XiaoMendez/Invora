import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { data, error } = await supabase
      .from("proveedor")
      .select("id, nombre, correo, telefono")
      .eq("id_empresa", empresaId)
      .eq("activo", true)
      .order("nombre", { ascending: true })

    if (error) throw error
    return NextResponse.json({ proveedores: data || [] })
  } catch (error) {
    console.error("[proveedores GET]", error)
    return NextResponse.json({ error: "Error al cargar proveedores" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const body = await request.json()

    const nombre = (body.nombre as string | undefined)?.trim()
    const correo = (body.correo as string | undefined)?.trim() || null
    const telefono = (body.telefono as string | undefined)?.trim() || null

    if (!nombre) {
      return NextResponse.json({ error: "El nombre del proveedor es requerido" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("proveedor")
      .insert({
        id_empresa: empresaId,
        nombre,
        correo,
        telefono,
      })
      .select("id, nombre, correo, telefono")
      .single()

    if (error) throw error

    return NextResponse.json({ proveedor: data, success: true })
  } catch (error) {
    console.error("[proveedores POST]", error)
    const message = error instanceof Error ? error.message : "Error al crear proveedor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

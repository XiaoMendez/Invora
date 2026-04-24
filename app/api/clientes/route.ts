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
      .select("id, nombre, apellido")
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

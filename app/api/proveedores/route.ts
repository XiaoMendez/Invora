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
      .select("id, nombre")
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

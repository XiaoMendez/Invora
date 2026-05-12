import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getEmpresaId, EmpresaNotConfiguredError, UserNotAuthenticatedError } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

// GET - Obtener proveedores de un producto
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    await getEmpresaId(supabase)

    const { searchParams } = new URL(request.url)
    const idProducto = searchParams.get("id_producto")

    if (!idProducto) {
      return NextResponse.json({ error: "id_producto es requerido" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("producto_proveedor")
      .select("*, proveedor(id, nombre, correo, telefono)")
      .eq("id_producto", idProducto)
      .order("es_principal", { ascending: false })

    if (error) throw error

    return NextResponse.json({ producto_proveedores: data || [] })
  } catch (error) {
    console.error("[producto-proveedor GET]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al cargar proveedores del producto" }, { status: 500 })
  }
}

// POST - Asociar un proveedor a un producto
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    await getEmpresaId(supabase)

    const body = await request.json()
    const { id_producto, id_proveedor, precio_compra, codigo_proveedor, es_principal } = body

    if (!id_producto || !id_proveedor) {
      return NextResponse.json({ error: "id_producto e id_proveedor son requeridos" }, { status: 400 })
    }

    // Si es principal, quitar el flag de otros proveedores del mismo producto
    if (es_principal) {
      await adminClient
        .from("producto_proveedor")
        .update({ es_principal: false })
        .eq("id_producto", id_producto)
    }

    const { data, error } = await adminClient
      .from("producto_proveedor")
      .upsert({
        id_producto,
        id_proveedor,
        precio_compra: parseFloat(precio_compra) || 0,
        codigo_proveedor: codigo_proveedor?.trim() || null,
        es_principal: es_principal ?? false,
      }, { onConflict: "id_producto,id_proveedor" })
      .select("*, proveedor(id, nombre)")
      .single()

    if (error) throw error

    return NextResponse.json({ producto_proveedor: data, success: true })
  } catch (error) {
    console.error("[producto-proveedor POST]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al asociar proveedor" }, { status: 500 })
  }
}

// DELETE - Eliminar asociación producto-proveedor
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    await getEmpresaId(supabase)

    const { searchParams } = new URL(request.url)
    const idProducto = searchParams.get("id_producto")
    const idProveedor = searchParams.get("id_proveedor")

    if (!idProducto || !idProveedor) {
      return NextResponse.json({ error: "id_producto e id_proveedor son requeridos" }, { status: 400 })
    }

    const { error } = await adminClient
      .from("producto_proveedor")
      .delete()
      .eq("id_producto", idProducto)
      .eq("id_proveedor", idProveedor)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[producto-proveedor DELETE]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al eliminar asociación" }, { status: 500 })
  }
}

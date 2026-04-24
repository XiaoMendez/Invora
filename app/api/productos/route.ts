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
    const categoria = searchParams.get("categoria") || ""

    let query = supabase
      .from("producto")
      .select("id, nombre, sku, stock, stock_minimo, precio_costo, precio_venta, activo, creado_en, id_categoria, categoria(id, nombre)")
      .eq("id_empresa", empresaId)
      .order("nombre", { ascending: true })

    if (search) {
      query = query.or(`nombre.ilike.%${search}%,sku.ilike.%${search}%`)
    }
    if (categoria && categoria !== "todas") {
      query = query.eq("id_categoria", categoria)
    }

    const { data: productos, error } = await query
    if (error) throw error

    return NextResponse.json({ productos: productos || [] })
  } catch (error) {
    console.error("[productos GET]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al cargar productos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const body = await request.json()
    const { nombre, sku, id_categoria, stock, stock_minimo, precio_costo, precio_venta, descripcion } = body

    if (!nombre?.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    const insertData: Record<string, unknown> = {
      id_empresa: empresaId,
      nombre: nombre.trim(),
      stock: parseInt(stock) || 0,
      stock_minimo: parseInt(stock_minimo) || 0,
      precio_costo: parseFloat(precio_costo) || 0,
      precio_venta: parseFloat(precio_venta) || 0,
    }
    if (sku?.trim()) insertData.sku = sku.trim()
    if (id_categoria) insertData.id_categoria = id_categoria
    if (descripcion?.trim()) insertData.descripcion = descripcion.trim()

    const { data: producto, error } = await supabase
      .from("producto")
      .insert(insertData)
      .select("id, nombre, sku, stock, stock_minimo, precio_costo, precio_venta, activo, id_categoria, categoria(id, nombre)")
      .single()

    if (error) throw error

    // Record initial stock movement
    if (parseInt(stock) > 0) {
      await supabase
        .from("movimiento_inventario")
        .insert({
          id_empresa: empresaId,
          id_producto: producto.id,
          tipo: "entrada",
          cantidad: parseInt(stock),
          stock_antes: 0,
          stock_despues: parseInt(stock),
          motivo: "Stock inicial al crear producto",
        })
    }

    return NextResponse.json({ producto, success: true })
  } catch (error) {
    console.error("[productos POST]", error)
    const msg = error instanceof Error ? error.message : "Error al crear producto"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const body = await request.json()
    const { id, nombre, sku, id_categoria, stock_minimo, precio_costo, precio_venta, activo } = body

    if (!id) {
      return NextResponse.json({ error: "ID del producto requerido" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (nombre !== undefined) updateData.nombre = nombre.trim()
    if (sku !== undefined) updateData.sku = sku?.trim() || null
    if (id_categoria !== undefined) updateData.id_categoria = id_categoria || null
    if (stock_minimo !== undefined) updateData.stock_minimo = parseInt(stock_minimo) || 0
    if (precio_costo !== undefined) updateData.precio_costo = parseFloat(precio_costo) || 0
    if (precio_venta !== undefined) updateData.precio_venta = parseFloat(precio_venta) || 0
    if (activo !== undefined) updateData.activo = activo

    const { data: producto, error } = await supabase
      .from("producto")
      .update(updateData)
      .eq("id", id)
      .eq("id_empresa", empresaId)
      .select("id, nombre, sku, stock, stock_minimo, precio_costo, precio_venta, activo, id_categoria, categoria(id, nombre)")
      .single()

    if (error) throw error

    return NextResponse.json({ producto, success: true })
  } catch (error) {
    console.error("[productos PUT]", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID del producto requerido" }, { status: 400 })
    }

    const { error } = await supabase
      .from("producto")
      .delete()
      .eq("id", id)
      .eq("id_empresa", empresaId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[productos DELETE]", error)
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}

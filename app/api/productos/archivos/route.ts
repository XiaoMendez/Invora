import { put, del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getEmpresaId, EmpresaNotConfiguredError, UserNotAuthenticatedError } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

// GET - List archivos for a product
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { searchParams } = new URL(request.url)
    const idProducto = searchParams.get("id_producto")

    if (!idProducto) {
      return NextResponse.json({ error: "id_producto es requerido" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("producto_archivo")
      .select("id, nombre, url, tipo, tamano, creado_en")
      .eq("id_producto", idProducto)
      .eq("id_empresa", empresaId)
      .order("creado_en", { ascending: false })

    if (error) throw error

    return NextResponse.json({ archivos: data || [] })
  } catch (error) {
    console.error("[producto archivos GET]", error)
    if (error instanceof UserNotAuthenticatedError) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    if (error instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: "Empresa no configurada" }, { status: 403 })
    return NextResponse.json({ error: "Error al obtener archivos" }, { status: 500 })
  }
}

// POST - Upload a file for a product
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()
    const empresaId = await getEmpresaId(supabase)

    const formData = await request.formData()
    const file = formData.get("file") as File
    const idProducto = formData.get("id_producto") as string

    if (!file) return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    if (!idProducto) return NextResponse.json({ error: "id_producto es requerido" }, { status: 400 })

    // Validate type
    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain", "text/csv",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 })
    }

    const maxSize = 20 * 1024 * 1024 // 20MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "El archivo excede el tamaño máximo de 20MB" }, { status: 400 })
    }

    const timestamp = Date.now()
    const ext = file.name.split(".").pop() || "bin"
    const filename = `productos/${empresaId}/${idProducto}/${timestamp}.${ext}`

    const blob = await put(filename, file, { access: "private" })

    const { data: archivo, error: dbError } = await admin
      .from("producto_archivo")
      .insert({
        id_producto: idProducto,
        id_empresa: empresaId,
        nombre: file.name,
        url: blob.url,
        tipo: file.type,
        tamano: file.size,
      })
      .select("id, nombre, url, tipo, tamano, creado_en")
      .single()

    if (dbError) throw dbError

    return NextResponse.json({ archivo })
  } catch (error) {
    console.error("[producto archivos POST]", error)
    if (error instanceof UserNotAuthenticatedError) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    if (error instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: "Empresa no configurada" }, { status: 403 })
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 })
  }
}

// DELETE - Remove a file
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()
    const empresaId = await getEmpresaId(supabase)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "ID es requerido" }, { status: 400 })

    // Get the file first to confirm ownership and get url
    const { data: archivo, error: fetchError } = await supabase
      .from("producto_archivo")
      .select("id, url, id_empresa")
      .eq("id", id)
      .eq("id_empresa", empresaId)
      .single()

    if (fetchError || !archivo) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    // Delete from Vercel Blob
    try {
      await del(archivo.url)
    } catch (blobErr) {
      console.error("[producto archivos DELETE blob]", blobErr)
    }

    // Delete from DB
    const { error: dbError } = await admin
      .from("producto_archivo")
      .delete()
      .eq("id", id)
      .eq("id_empresa", empresaId)

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[producto archivos DELETE]", error)
    if (error instanceof UserNotAuthenticatedError) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    if (error instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: "Empresa no configurada" }, { status: 403 })
    return NextResponse.json({ error: "Error al eliminar archivo" }, { status: 500 })
  }
}

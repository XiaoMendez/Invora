import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId } from "@/lib/supabase/empresa"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    // Validar tipo de archivo (imágenes y PDFs)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG, WebP, GIF) y PDF." 
      }, { status: 400 })
    }

    // Limitar tamaño a 10MB
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "El archivo excede el tamaño máximo de 10MB" }, { status: 400 })
    }

    // Generar nombre único
    const timestamp = Date.now()
    const extension = file.name.split(".").pop() || "jpg"
    const filename = `comprobantes/${empresaId}/${timestamp}.${extension}`

    // Subir a Vercel Blob (público para fácil acceso)
    const blob = await put(filename, file, {
      access: "public",
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error subiendo comprobante:", error)
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 })
  }
}

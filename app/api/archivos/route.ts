import { get } from "@vercel/blob"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEmpresaId, EmpresaNotConfiguredError, UserNotAuthenticatedError } from "@/lib/supabase/empresa"

export const dynamic = "force-dynamic"

/**
 * Proxy de descarga/visualización para archivos privados de Vercel Blob.
 *
 * El store de Blob de este proyecto está configurado como "private", así que
 * las URLs que guardamos en la base de datos (producto_archivo.url,
 * movimiento.comprobante_url) NO son accesibles directamente desde el
 * navegador: un <a href="https://xxx.private.blob.vercel-storage.com/...">
 * devuelve 403 Forbidden porque esa URL exige autenticación en el servidor.
 *
 * Esta ruta hace de intermediario: valida que el usuario esté autenticado y
 * que el archivo pertenezca a su empresa (comprobando que el pathname
 * contenga "/<empresaId>/"), y solo entonces usa el SDK de @vercel/blob para
 * leer el archivo y transmitirlo de vuelta.
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")
    const download = searchParams.get("download") === "1"

    if (!url) {
      return NextResponse.json({ error: "Parámetro 'url' es requerido" }, { status: 400 })
    }

    // Solo permitimos proxear blobs del store de Vercel, nunca URLs arbitrarias.
    let pathname: string
    try {
      pathname = new URL(url).pathname
    } catch {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 })
    }
    if (!/\.(public|private)\.blob\.vercel-storage\.com$/.test(new URL(url).hostname)) {
      return NextResponse.json({ error: "URL no permitida" }, { status: 400 })
    }

    // Verificación de propiedad: nuestras rutas de subida guardan los
    // archivos bajo "comprobantes/<empresaId>/..." o
    // "productos/<empresaId>/<idProducto>/...", así que la empresa del
    // usuario debe aparecer como segmento del path.
    if (!pathname.split("/").includes(empresaId)) {
      return NextResponse.json({ error: "No autorizado para ver este archivo" }, { status: 403 })
    }

    const result = await get(url, { access: "private" })
    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    const filename = pathname.split("/").pop() || "archivo"

    return new Response(result.stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("[archivos GET]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada" }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al obtener el archivo" }, { status: 500 })
  }
}

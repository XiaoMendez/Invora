import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getEmpresaId, EmpresaNotConfiguredError, UserNotAuthenticatedError } from "@/lib/supabase/empresa"
import { parseNumero, parseTexto } from "@/lib/import/producto-mapping"

export const dynamic = "force-dynamic"

interface CommitBody {
  mapping: Record<string, number | null>
  rows: (string | number)[][]
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const admin = createAdminClient()

    const body: CommitBody = await request.json()
    const { mapping, rows } = body

    if (!mapping || !rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: "Datos de importación inválidos" }, { status: 400 })
    }
    if (mapping.nombre === undefined || mapping.nombre === null) {
      return NextResponse.json({ error: "Debes mapear la columna de nombre del producto" }, { status: 400 })
    }
    if (rows.length === 0) {
      return NextResponse.json({ creados: 0, actualizados: 0, omitidos: 0, errores: [] })
    }

    const get = (row: (string | number)[], campo: string): string | number | undefined => {
      const idx = mapping[campo]
      if (idx === null || idx === undefined) return undefined
      return row[idx]
    }

    // Cache de categorías de la empresa para no consultar la BD por cada fila.
    const { data: categoriasActuales } = await admin
      .from("categoria")
      .select("id, nombre")
      .eq("id_empresa", empresaId)

    const categoriaPorNombre = new Map<string, string>()
    for (const c of categoriasActuales || []) {
      categoriaPorNombre.set(c.nombre.trim().toLowerCase(), c.id)
    }

    // Cache de productos existentes por SKU (dentro de esta empresa).
    const { data: productosActuales } = await admin
      .from("producto")
      .select("id, sku, stock")
      .eq("id_empresa", empresaId)
      .not("sku", "is", null)

    const productoPorSku = new Map<string, { id: string; stock: number }>()
    for (const p of productosActuales || []) {
      if (p.sku) productoPorSku.set(p.sku.trim().toLowerCase(), { id: p.id, stock: p.stock })
    }

    let creados = 0
    let actualizados = 0
    let omitidos = 0
    const errores: { fila: number; mensaje: string }[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      try {
        const nombre = parseTexto(get(row, "nombre"))
        if (!nombre) {
          omitidos++
          continue
        }

        const skuRaw = parseTexto(get(row, "sku"))
        const sku = skuRaw || null
        const categoriaNombre = parseTexto(get(row, "categoria"))
        const descripcion = parseTexto(get(row, "descripcion")) || null
        const precio_costo = parseNumero(get(row, "precio_costo"))
        const precio_venta = parseNumero(get(row, "precio_venta"))
        const stock = Math.max(0, Math.round(parseNumero(get(row, "stock"))))
        const stock_minimo = Math.max(0, Math.round(parseNumero(get(row, "stock_minimo"))))

        // Resolver / crear categoría por nombre
        let id_categoria: string | null = null
        if (categoriaNombre) {
          const key = categoriaNombre.toLowerCase()
          if (categoriaPorNombre.has(key)) {
            id_categoria = categoriaPorNombre.get(key)!
          } else {
            const { data: nuevaCategoria, error: errCat } = await admin
              .from("categoria")
              .insert({ id_empresa: empresaId, nombre: categoriaNombre })
              .select("id, nombre")
              .single()
            if (errCat) throw errCat
            categoriaPorNombre.set(key, nuevaCategoria.id)
            id_categoria = nuevaCategoria.id
          }
        }

        const existente = sku ? productoPorSku.get(sku.toLowerCase()) : undefined

        if (existente) {
          // Actualizar producto existente (match por SKU), incluyendo el
          // stock importado en el mismo update.
          const { error: errUpd } = await admin
            .from("producto")
            .update({
              nombre,
              id_categoria,
              descripcion,
              precio_costo,
              precio_venta,
              stock,
              stock_minimo,
            })
            .eq("id", existente.id)
            .eq("id_empresa", empresaId)
          if (errUpd) throw errUpd

          // Si el stock importado difiere del actual, registrar el ajuste
          // como un movimiento de inventario (igual que un ajuste manual).
          const diferencia = stock - existente.stock
          if (diferencia !== 0) {
            await admin.from("movimiento_inventario").insert({
              id_empresa: empresaId,
              id_producto: existente.id,
              tipo: diferencia > 0 ? "ajuste_positivo" : "ajuste_negativo",
              cantidad: Math.abs(diferencia),
              stock_antes: existente.stock,
              stock_despues: stock,
              motivo: "Ajuste por importación desde Excel",
            })
          }

          if (sku) productoPorSku.set(sku.toLowerCase(), { id: existente.id, stock })
          actualizados++
        } else {
          const { data: nuevoProducto, error: errIns } = await admin
            .from("producto")
            .insert({
              id_empresa: empresaId,
              nombre,
              sku,
              id_categoria,
              descripcion,
              precio_costo,
              precio_venta,
              stock,
              stock_minimo,
              es_propio: true,
            })
            .select("id")
            .single()
          if (errIns) throw errIns

          if (stock > 0) {
            await admin.from("movimiento_inventario").insert({
              id_empresa: empresaId,
              id_producto: nuevoProducto.id,
              tipo: "entrada",
              cantidad: stock,
              stock_antes: 0,
              stock_despues: stock,
              motivo: "Stock inicial (importación desde Excel)",
            })
          }

          if (sku) productoPorSku.set(sku.toLowerCase(), { id: nuevoProducto.id, stock })
          creados++
        }
      } catch (rowError) {
        const mensaje = rowError instanceof Error ? rowError.message : "Error desconocido"
        errores.push({ fila: i + 1, mensaje })
      }
    }

    return NextResponse.json({ creados, actualizados, omitidos, errores })
  } catch (error) {
    console.error("[productos/importar/commit]", error)
    if (error instanceof UserNotAuthenticatedError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (error instanceof EmpresaNotConfiguredError) {
      return NextResponse.json({ error: "Empresa no configurada", needsOnboarding: true }, { status: 403 })
    }
    return NextResponse.json({ error: "Error al importar los productos" }, { status: 500 })
  }
}

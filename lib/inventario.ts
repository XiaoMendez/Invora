export function suggestReorderForProducto(p: { id: string; nombre: string; stock: number; stock_minimo: number }) {
  const deficit = p.stock_minimo - p.stock
  const suggested = Math.max(p.stock_minimo * 2 - p.stock, Math.ceil(Math.max(deficit, 0)))
  return {
    id: p.id,
    nombre: p.nombre,
    stock: p.stock,
    stock_minimo: p.stock_minimo,
    faltante: Math.max(p.stock_minimo - p.stock, 0),
    sugerido: suggested,
  }
}

export function suggestReorderList(productos: Array<{ id: string; nombre: string; stock: number; stock_minimo: number }>) {
  return productos.map(suggestReorderForProducto)
}

interface OrdenItemParaStock {
  id_producto: string | null
  cantidad: number
}

/**
 * Aplica los movimientos de inventario correspondientes a los items de una
 * Orden de Compra o de Venta y actualiza el stock de cada producto.
 *
 * Se hace enteramente en la aplicación (sin funciones/triggers de Postgres)
 * a propósito: los triggers de compra/venta fueron la causa de los errores
 * de "search_path" y registros fantasma que motivaron reemplazar esos
 * módulos por Órdenes de Compra/Venta + Movimientos.
 *
 * @param admin cliente de Supabase con permisos de servicio
 * @param empresaId id de la empresa dueña de los productos
 * @param items items de la orden (id_producto + cantidad)
 * @param direccion "entrada" (orden de compra recibida) o "salida" (orden de venta entregada)
 * @param motivo texto descriptivo para el movimiento (ej. "Orden de compra PO-000001")
 * @param refs id_proveedor / id_cliente opcionales para asociar el movimiento
 */
export async function aplicarMovimientosDeOrden(
  admin: any,
  empresaId: string,
  items: OrdenItemParaStock[],
  direccion: "entrada" | "salida",
  motivo: string,
  refs: { id_proveedor?: string | null; id_cliente?: string | null } = {}
): Promise<{ error: string | null }> {
  const tipo = direccion === "entrada" ? "entrada" : "salida"

  // Agrupar cantidades por producto por si el mismo producto aparece en
  // más de una línea de la orden.
  const cantidadPorProducto = new Map<string, number>()
  for (const item of items) {
    if (!item.id_producto || !item.cantidad) continue
    cantidadPorProducto.set(
      item.id_producto,
      (cantidadPorProducto.get(item.id_producto) || 0) + item.cantidad
    )
  }

  for (const [id_producto, cantidad] of cantidadPorProducto.entries()) {
    const { data: producto, error: prodError } = await admin
      .from("producto")
      .select("id, stock")
      .eq("id", id_producto)
      .eq("id_empresa", empresaId)
      .single()

    if (prodError || !producto) continue // producto eliminado o no encontrado: se omite, no se bloquea la orden

    const stockAntes = producto.stock
    const stockDespues = direccion === "salida" ? stockAntes - cantidad : stockAntes + cantidad

    // No bloqueamos ventas por stock insuficiente (puede ser una venta con
    // pedido pendiente de reabastecer); simplemente el stock puede quedar
    // en negativo, visible para el usuario en el listado de productos.
    const { error: movError } = await admin.from("movimiento_inventario").insert({
      id_empresa: empresaId,
      id_producto,
      tipo,
      cantidad,
      stock_antes: stockAntes,
      stock_despues: stockDespues,
      motivo,
      id_cliente: refs.id_cliente || null,
      id_proveedor: refs.id_proveedor || null,
    })

    if (movError) return { error: movError.message }

    const { error: stockError } = await admin
      .from("producto")
      .update({ stock: stockDespues })
      .eq("id", id_producto)
      .eq("id_empresa", empresaId)

    if (stockError) return { error: stockError.message }
  }

  return { error: null }
}

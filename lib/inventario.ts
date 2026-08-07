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

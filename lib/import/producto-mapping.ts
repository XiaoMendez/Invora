// Campos de destino disponibles para el mapeo de importación de productos,
// junto con las variantes de encabezado que reconocemos automáticamente
// (español, inglés y portugués, sin acentos, para que la detección sea
// resistente a como el usuario haya nombrado sus columnas en Excel).

export interface CampoDestino {
  id: string
  requerido: boolean
  alias: string[]
}

export const CAMPOS_DESTINO: CampoDestino[] = [
  {
    id: "nombre",
    requerido: true,
    alias: ["nombre", "producto", "name", "product", "nome", "descripcion corta", "articulo", "item"],
  },
  {
    id: "sku",
    requerido: false,
    alias: ["sku", "codigo", "código", "code", "referencia", "ref", "codigo producto", "codigo de barras", "barcode"],
  },
  {
    id: "categoria",
    requerido: false,
    alias: ["categoria", "categoría", "category", "categoria producto", "rubro", "familia", "linea", "línea"],
  },
  {
    id: "descripcion",
    requerido: false,
    alias: ["descripcion", "descripción", "description", "detalle", "descricao", "descrição", "notas"],
  },
  {
    id: "precio_costo",
    requerido: false,
    alias: [
      "precio costo", "precio de costo", "costo", "precio compra", "precio de compra",
      "cost", "cost price", "purchase price", "preco custo", "preço custo",
    ],
  },
  {
    id: "precio_venta",
    requerido: false,
    alias: [
      "precio venta", "precio de venta", "venta", "precio", "price", "sale price",
      "selling price", "preco venda", "preço venda", "pvp",
    ],
  },
  {
    id: "stock",
    requerido: false,
    alias: ["stock", "cantidad", "existencia", "existencias", "inventario", "quantity", "qty", "stock actual", "unidades"],
  },
  {
    id: "stock_minimo",
    requerido: false,
    alias: [
      "stock minimo", "stock mínimo", "minimo", "mínimo", "stock min", "reorder point",
      "punto de reorden", "reabastecimiento", "min stock",
    ],
  },
]

export function normalizarTexto(texto: string): string {
  return texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
}

/**
 * Dado un listado de encabezados detectados en el Excel, sugiere a qué
 * campo de destino corresponde cada uno comparando contra los alias
 * conocidos. Cada campo solo se asigna a UN encabezado (el de mejor match).
 */
export function sugerirMapeo(headers: string[]): Record<string, number | null> {
  const normalizados = headers.map(normalizarTexto)
  const sugerencia: Record<string, number | null> = {}
  const usados = new Set<number>()
  for (const campo of CAMPOS_DESTINO) sugerencia[campo.id] = null

  // 1) Match exacto: se resuelven TODOS los campos antes de intentar
  //    coincidencias parciales. Si esto no fuera así, un campo con alias
  //    genéricos (ej. "nombre" acepta "producto") podría robarse por
  //    coincidencia parcial una columna que en realidad hace match exacto
  //    con otro campo procesado después (ej. una columna "Código Producto"
  //    terminando asignada a "nombre" en vez de quedar libre para "sku").
  for (const campo of CAMPOS_DESTINO) {
    for (let i = 0; i < normalizados.length; i++) {
      if (usados.has(i)) continue
      if (campo.alias.includes(normalizados[i])) {
        sugerencia[campo.id] = i
        usados.add(i)
        break
      }
    }
  }

  // 2) Coincidencia parcial (contiene), solo para los campos que no
  //    obtuvieron un match exacto en el paso anterior.
  for (const campo of CAMPOS_DESTINO) {
    if (sugerencia[campo.id] !== null) continue
    for (let i = 0; i < normalizados.length; i++) {
      if (usados.has(i)) continue
      if (campo.alias.some((a) => normalizados[i].includes(a) || a.includes(normalizados[i]))) {
        sugerencia[campo.id] = i
        usados.add(i)
        break
      }
    }
  }

  return sugerencia
}

export function parseNumero(valor: unknown): number {
  if (valor === null || valor === undefined || valor === "") return 0
  if (typeof valor === "number") return isFinite(valor) ? valor : 0
  const limpio = String(valor).replace(/[^\d.,-]/g, "").replace(/,(?=\d{3}(\D|$))/g, "")
  const normalizado = limpio.includes(",") && !limpio.includes(".") ? limpio.replace(",", ".") : limpio
  const num = parseFloat(normalizado)
  return isFinite(num) ? num : 0
}

export function parseTexto(valor: unknown): string {
  if (valor === null || valor === undefined) return ""
  return String(valor).trim()
}

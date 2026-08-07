import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getEmpresaId, UserNotAuthenticatedError, EmpresaNotConfiguredError } from "@/lib/supabase/empresa"
import { sendLowStockEmail } from "@/app/api/alertas/route"

export const dynamic = "force-dynamic"

const TIPOS_ENTRADA = ["entrada", "ajuste_positivo", "devolucion_venta"]
const TIPOS_SALIDA = ["salida", "ajuste_negativo", "devolucion_compra"]
const TIPOS_VALIDOS = [...TIPOS_ENTRADA, ...TIPOS_SALIDA]

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)
    const admin = createAdminClient()

    const body = await request.json()
    const {
      id_producto,
      tipo,
      cantidad,
      motivo,
      id_cliente = null,
      id_proveedor = null,
      comprobante_url = null,
    } = body

    if (!id_producto || !tipo || !cantidad) {
      return NextResponse.json(
        { error: "Producto, tipo y cantidad son requeridos" },
        { status: 400 }
      )
    }

    if (!TIPOS_VALIDOS.includes(tipo)) {
      return NextResponse.json(
        { error: `Tipo inválido. Valores permitidos: ${TIPOS_VALIDOS.join(", ")}` },
        { status: 400 }
      )
    }

    const qty = parseInt(cantidad)
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: "La cantidad debe ser un número positivo" }, { status: 400 })
    }

    // Fetch current product stock
    const { data: producto, error: prodError } = await admin
      .from("producto")
      .select("id, nombre, stock")
      .eq("id", id_producto)
      .eq("id_empresa", empresaId)
      .single()

    if (prodError || !producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const stockAntes = producto.stock
    const esSalida = TIPOS_SALIDA.includes(tipo)
    const stockDespues = esSalida ? stockAntes - qty : stockAntes + qty

    if (esSalida && stockDespues < 0) {
      return NextResponse.json(
        { error: `Stock insuficiente. Disponible: ${stockAntes}, Solicitado: ${qty}` },
        { status: 400 }
      )
    }

    // Insert movement record
    const { data: movimiento, error: movError } = await admin
      .from("movimiento_inventario")
      .insert({
        id_empresa: empresaId,
        id_producto,
        tipo,
        cantidad: qty,
        stock_antes: stockAntes,
        stock_despues: stockDespues,
        motivo: motivo || null,
        id_cliente: id_cliente || null,
        id_proveedor: id_proveedor || null,
        comprobante_url: comprobante_url || null,
      })
      .select("id, tipo, cantidad, stock_antes, stock_despues, motivo, creado_en")
      .single()

    if (movError) throw movError

    // Update product stock
    const { error: stockError } = await admin
      .from("producto")
      .update({ stock: stockDespues })
      .eq("id", id_producto)
      .eq("id_empresa", empresaId)

    if (stockError) throw stockError

    // Auto-send low-stock alert email if the updated product is now below minimum
    try {
      const { data: prodActualizado } = await admin
        .from("producto")
        .select("id, nombre, sku, stock, stock_minimo, categoria(nombre)")
        .eq("id", id_producto)
        .single()

      if (prodActualizado && prodActualizado.stock_minimo > 0 && prodActualizado.stock <= prodActualizado.stock_minimo) {
        const { data: empresa } = await admin
          .from("empresa")
          .select("nombre, email")
          .eq("id", empresaId)
          .single()

        if (empresa?.email) {
          // Fire-and-forget — don't block the response
          sendLowStockEmail(empresa.nombre || "Tu empresa", empresa.email, [prodActualizado]).catch(
            (err) => console.error("[ajuste-inventario] auto-alert error:", err)
          )
        }
      }
    } catch (alertErr) {
      // Never fail the main request due to alert sending
      console.error("[ajuste-inventario] alert check failed:", alertErr)
    }

    return NextResponse.json({ movimiento, stockActual: stockDespues })
  } catch (error) {
    console.error("[ajuste-inventario POST]", error)
    if (error instanceof UserNotAuthenticatedError) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    if (error instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: "Empresa no configurada" }, { status: 403 })
    const msg = error instanceof Error ? error.message : "Error al registrar ajuste"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

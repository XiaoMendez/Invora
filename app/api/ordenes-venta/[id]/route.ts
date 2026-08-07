import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getEmpresaId, EmpresaNotConfiguredError, UserNotAuthenticatedError } from '@/lib/supabase/empresa'
import { aplicarMovimientosDeOrden } from '@/lib/inventario'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { data: orden, error } = await supabase
      .from('ordenes_venta')
      .select(`
        id, numero_ov, id_cliente, fecha_orden, fecha_entrega_esperada, estado, total, notas, creado_en,
        cliente(id, nombre, apellido),
        ordenes_venta_items(id, id_producto, descripcion, cantidad, precio_unitario, subtotal, producto(id, nombre, sku))
      `)
      .eq('id', id)
      .eq('id_empresa', empresaId)
      .single()

    if (error) throw error
    return NextResponse.json({ orden })
  } catch (err: any) {
    if (err instanceof UserNotAuthenticatedError) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (err instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: 'Empresa no configurada' }, { status: 403 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const admin = createAdminClient()
    const empresaId = await getEmpresaId(supabase)

    const { id_cliente, fecha_entrega_esperada, estado, notas, items } = await request.json()

    // Verify ownership
    const { data: existing, error: existingError } = await supabase
      .from('ordenes_venta')
      .select('id, estado, id_cliente, stock_aplicado')
      .eq('id', id)
      .eq('id_empresa', empresaId)
      .single()

    // PGRST116 = no rows found (orden realmente no existe / no es de esta empresa).
    // Cualquier otro error (ej. tabla o columna inexistente en la BD) es un problema
    // real de la base de datos y no debe disfrazarse como "Orden no encontrada".
    if (existingError && existingError.code !== 'PGRST116') {
      console.error('[ordenes-venta PUT] error verificando orden:', existingError)
      throw existingError
    }
    if (!existing) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })

    const updateData: Record<string, any> = { actualizado_en: new Date().toISOString() }
    if (id_cliente !== undefined) updateData.id_cliente = id_cliente
    if (fecha_entrega_esperada !== undefined) updateData.fecha_entrega_esperada = fecha_entrega_esperada || null
    if (estado !== undefined) updateData.estado = estado
    if (notas !== undefined) updateData.notas = notas || null

    if (items !== undefined) {
      const total = items.reduce(
        (sum: number, item: any) => sum + ((item.cantidad || 0) * (item.precio_unitario || 0)),
        0
      )
      updateData.total = total

      // Replace items
      await admin.from('ordenes_venta_items').delete().eq('id_orden_venta', id)
      if (items.length > 0) {
        const itemsToInsert = items.map((item: any) => ({
          id_orden_venta: id,
          id_producto: item.id_producto || null,
          descripcion: item.descripcion || null,
          cantidad: parseInt(item.cantidad) || 1,
          precio_unitario: parseFloat(item.precio_unitario) || 0,
          subtotal: (parseInt(item.cantidad) || 1) * (parseFloat(item.precio_unitario) || 0),
        }))
        await admin.from('ordenes_venta_items').insert(itemsToInsert)
      }
    }

    // Si la orden pasa a "entregada" por primera vez, generar las salidas
    // de inventario correspondientes (sin depender de triggers de la BD).
    const pasaAEntregada = estado === 'entregada' && existing.estado !== 'entregada' && !existing.stock_aplicado
    if (pasaAEntregada) {
      updateData.stock_aplicado = true
    }

    const { data: updated, error: updateError } = await admin
      .from('ordenes_venta')
      .update(updateData)
      .eq('id', id)
      .select(`
        id, numero_ov, id_cliente, fecha_orden, fecha_entrega_esperada, estado, total, notas, stock_aplicado,
        cliente(id, nombre, apellido),
        ordenes_venta_items(id, id_producto, descripcion, cantidad, precio_unitario, subtotal, producto(id, nombre, sku))
      `)
      .single()

    if (updateError) throw updateError

    if (pasaAEntregada) {
      const { error: stockErr } = await aplicarMovimientosDeOrden(
        admin,
        empresaId,
        (updated.ordenes_venta_items || []).map((i: any) => ({ id_producto: i.id_producto, cantidad: i.cantidad })),
        'salida',
        `Orden de venta ${updated.numero_ov}`,
        { id_cliente: updated.id_cliente }
      )
      if (stockErr) console.error('[ordenes-venta PUT] error aplicando stock:', stockErr)
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    console.error('[ordenes-venta PUT]', err)
    if (err instanceof UserNotAuthenticatedError) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (err instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: 'Empresa no configurada' }, { status: 403 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const admin = createAdminClient()
    const empresaId = await getEmpresaId(supabase)

    const { data: ov } = await supabase
      .from('ordenes_venta')
      .select('id_empresa')
      .eq('id', id)
      .single()

    if (!ov || ov.id_empresa !== empresaId) {
      return NextResponse.json({ error: 'Orden no encontrada o sin permiso' }, { status: 404 })
    }

    const { error: deleteError } = await admin.from('ordenes_venta').delete().eq('id', id)
    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[ordenes-venta DELETE]', err)
    if (err instanceof UserNotAuthenticatedError) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (err instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: 'Empresa no configurada' }, { status: 403 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

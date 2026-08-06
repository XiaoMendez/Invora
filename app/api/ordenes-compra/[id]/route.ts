import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getEmpresaId, EmpresaNotConfiguredError, UserNotAuthenticatedError } from '@/lib/supabase/empresa'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { data: orden, error } = await supabase
      .from('ordenes_compra')
      .select(`
        id, numero_po, id_proveedor, fecha_orden, fecha_entrega_esperada, estado, total, notas, creado_en,
        proveedor(id, nombre),
        ordenes_compra_items(id, id_producto, descripcion, cantidad, precio_unitario, subtotal, producto(id, nombre, sku))
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

    const { id_proveedor, fecha_entrega_esperada, estado, notas, items } = await request.json()

    // Verify ownership
    const { data: existing } = await supabase
      .from('ordenes_compra')
      .select('id, estado')
      .eq('id', id)
      .eq('id_empresa', empresaId)
      .single()

    if (!existing) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })

    const updateData: Record<string, any> = { actualizado_en: new Date().toISOString() }
    if (id_proveedor !== undefined) updateData.id_proveedor = id_proveedor
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
      await admin.from('ordenes_compra_items').delete().eq('id_orden_compra', id)
      if (items.length > 0) {
        const itemsToInsert = items.map((item: any) => ({
          id_orden_compra: id,
          id_producto: item.id_producto || null,
          descripcion: item.descripcion || null,
          cantidad: parseInt(item.cantidad) || 1,
          precio_unitario: parseFloat(item.precio_unitario) || 0,
          subtotal: (parseInt(item.cantidad) || 1) * (parseFloat(item.precio_unitario) || 0),
        }))
        await admin.from('ordenes_compra_items').insert(itemsToInsert)
      }
    }

    const { data: updated, error: updateError } = await admin
      .from('ordenes_compra')
      .update(updateData)
      .eq('id', id)
      .select(`
        id, numero_po, id_proveedor, fecha_orden, fecha_entrega_esperada, estado, total, notas,
        proveedor(id, nombre),
        ordenes_compra_items(id, id_producto, descripcion, cantidad, precio_unitario, subtotal, producto(id, nombre, sku))
      `)
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    console.error('[ordenes-compra PUT]', err)
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

    const { data: po } = await supabase
      .from('ordenes_compra')
      .select('id_empresa')
      .eq('id', id)
      .single()

    if (!po || po.id_empresa !== empresaId) {
      return NextResponse.json({ error: 'Orden no encontrada o sin permiso' }, { status: 404 })
    }

    const { error: deleteError } = await admin.from('ordenes_compra').delete().eq('id', id)
    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[ordenes-compra DELETE]', err)
    if (err instanceof UserNotAuthenticatedError) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (err instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: 'Empresa no configurada' }, { status: 403 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

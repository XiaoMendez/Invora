import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getEmpresaId, EmpresaNotConfiguredError, UserNotAuthenticatedError } from '@/lib/supabase/empresa'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { data: ordenes, error } = await supabase
      .from('ordenes_venta')
      .select(`
        id, numero_ov, id_cliente, fecha_orden, fecha_entrega_esperada, estado, total, notas, creado_en,
        cliente(id, nombre, apellido),
        ordenes_venta_items(id, id_producto, descripcion, cantidad, precio_unitario, subtotal, producto(id, nombre, sku))
      `)
      .eq('id_empresa', empresaId)
      .order('creado_en', { ascending: false })

    if (error) {
      console.error('[ordenes-venta GET]', error)
      return NextResponse.json({ ordenes_venta: [] })
    }

    return NextResponse.json({ ordenes_venta: ordenes || [] })
  } catch (err: any) {
    if (err instanceof UserNotAuthenticatedError) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (err instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: 'Empresa no configurada', needsOnboarding: true }, { status: 403 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()
    const empresaId = await getEmpresaId(supabase)

    const { id_cliente, fecha_entrega_esperada, notas, items = [] } = await request.json()

    if (!id_cliente) {
      return NextResponse.json({ error: 'El cliente es requerido' }, { status: 400 })
    }

    // Generar número de OV secuencial
    const { data: lastOV } = await supabase
      .from('ordenes_venta')
      .select('numero_ov')
      .eq('id_empresa', empresaId)
      .order('creado_en', { ascending: false })
      .limit(1)
      .maybeSingle()

    const lastNumber = lastOV?.numero_ov ? parseInt(lastOV.numero_ov.split('-')[1] || '0') : 0
    const numero_ov = `OV-${String(lastNumber + 1).padStart(6, '0')}`

    const total = items.reduce(
      (sum: number, item: any) => sum + ((item.cantidad || 0) * (item.precio_unitario || 0)),
      0
    )

    const { data: ov, error: ovError } = await admin
      .from('ordenes_venta')
      .insert({
        id_empresa: empresaId,
        numero_ov,
        id_cliente,
        fecha_entrega_esperada: fecha_entrega_esperada || null,
        estado: 'borrador',
        total,
        notas: notas || null,
      })
      .select('id, numero_ov')
      .single()

    if (ovError) throw ovError

    if (items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        id_orden_venta: ov.id,
        id_producto: item.id_producto || null,
        descripcion: item.descripcion || null,
        cantidad: parseInt(item.cantidad) || 1,
        precio_unitario: parseFloat(item.precio_unitario) || 0,
        subtotal: (parseInt(item.cantidad) || 1) * (parseFloat(item.precio_unitario) || 0),
      }))
      const { error: itemsError } = await admin.from('ordenes_venta_items').insert(itemsToInsert)
      if (itemsError) console.error('[ordenes-venta items insert]', itemsError)
    }

    return NextResponse.json({ success: true, data: ov })
  } catch (err: any) {
    console.error('[ordenes-venta POST]', err)
    if (err instanceof UserNotAuthenticatedError) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (err instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: 'Empresa no configurada', needsOnboarding: true }, { status: 403 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

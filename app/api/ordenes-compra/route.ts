import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getEmpresaId, EmpresaNotConfiguredError, UserNotAuthenticatedError } from '@/lib/supabase/empresa'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { data: ordenes, error } = await supabase
      .from('ordenes_compra')
      .select(`
        id, numero_po, id_proveedor, fecha_orden, fecha_entrega_esperada, estado, total, notas, creado_en,
        proveedor(id, nombre),
        ordenes_compra_items(id, id_producto, descripcion, cantidad, precio_unitario, subtotal, producto(id, nombre, sku))
      `)
      .eq('id_empresa', empresaId)
      .order('creado_en', { ascending: false })

    if (error) {
      console.error('[ordenes-compra GET]', error)
      return NextResponse.json({ ordenes_compra: [] })
    }

    return NextResponse.json({ ordenes_compra: ordenes || [] })
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

    const { id_proveedor, fecha_entrega_esperada, notas, items = [] } = await request.json()

    if (!id_proveedor) {
      return NextResponse.json({ error: 'El proveedor es requerido' }, { status: 400 })
    }

    // Generate PO number
    const { data: lastPO } = await supabase
      .from('ordenes_compra')
      .select('numero_po')
      .eq('id_empresa', empresaId)
      .order('creado_en', { ascending: false })
      .limit(1)
      .maybeSingle()

    const lastNumber = lastPO?.numero_po ? parseInt(lastPO.numero_po.split('-')[1] || '0') : 0
    const numero_po = `PO-${String(lastNumber + 1).padStart(6, '0')}`

    const total = items.reduce(
      (sum: number, item: any) => sum + ((item.cantidad || 0) * (item.precio_unitario || 0)),
      0
    )

    const { data: po, error: poError } = await admin
      .from('ordenes_compra')
      .insert({
        id_empresa: empresaId,
        numero_po,
        id_proveedor,
        fecha_entrega_esperada: fecha_entrega_esperada || null,
        estado: 'borrador',
        total,
        notas: notas || null,
      })
      .select('id, numero_po')
      .single()

    if (poError) throw poError

    if (items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        id_orden_compra: po.id,
        id_producto: item.id_producto || null,
        descripcion: item.descripcion || null,
        cantidad: parseInt(item.cantidad) || 1,
        precio_unitario: parseFloat(item.precio_unitario) || 0,
        subtotal: (parseInt(item.cantidad) || 1) * (parseFloat(item.precio_unitario) || 0),
      }))
      const { error: itemsError } = await admin.from('ordenes_compra_items').insert(itemsToInsert)
      if (itemsError) console.error('[ordenes-compra items insert]', itemsError)
    }

    return NextResponse.json({ success: true, data: po })
  } catch (err: any) {
    console.error('[ordenes-compra POST]', err)
    if (err instanceof UserNotAuthenticatedError) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (err instanceof EmpresaNotConfiguredError) return NextResponse.json({ error: 'Empresa no configurada', needsOnboarding: true }, { status: 403 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

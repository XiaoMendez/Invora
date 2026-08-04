import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getEmpresaId } from '@/lib/supabase/empresa'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    // Get purchase orders - for now, simple approach since table might not exist yet
    const { data: ordenes, error } = await supabase
      .from('ordenes_compra')
      .select('*')
      .eq('id_empresa', empresaId)
      .order('creado_en', { ascending: false })

    if (error) {
      // Return empty if table doesn't exist yet
      return NextResponse.json({ ordenes_compra: [] })
    }

    // Fetch supplier info for each order
    const ordenesConProveedor = await Promise.all(
      (ordenes || []).map(async (orden: any) => {
        const { data: proveedor } = await supabase
          .from('proveedor')
          .select('nombre')
          .eq('id', orden.id_proveedor)
          .single()

        return {
          ...orden,
          proveedor: proveedor || { nombre: 'N/A' },
        }
      })
    )

    return NextResponse.json({ ordenes_compra: ordenesConProveedor || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    const { id_proveedor, fecha_entrega_esperada, items } = await request.json()

    if (!id_proveedor || !fecha_entrega_esperada) {
      return NextResponse.json({ error: 'Proveedor y fecha requeridos' }, { status: 400 })
    }

    // Generate PO number
    const { data: lastPO } = await supabase
      .from('ordenes_compra')
      .select('numero_po')
      .eq('id_empresa', empresaId)
      .order('creado_en', { ascending: false })
      .limit(1)

    const lastNumber = lastPO?.[0]?.numero_po ? parseInt(lastPO[0].numero_po.split('-')[1]) : 0
    const numero_po = `PO-${String(lastNumber + 1).padStart(6, '0')}`

    // Calculate total
    const total = (items || []).reduce((sum: number, item: any) => sum + ((item.cantidad || 0) * (item.precio_unitario || 0)), 0)

    // Create PO
    const { data: po, error: poError } = await supabase
      .from('ordenes_compra')
      .insert({
        id_empresa: empresaId,
        numero_po,
        id_proveedor,
        fecha_entrega_esperada,
        estado: 'borrador',
        total,
      })
      .select()
      .single()

    if (poError) throw poError

    return NextResponse.json({ success: true, data: po })
  } catch (err: any) {
    console.error('[v0] Error creating PO:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

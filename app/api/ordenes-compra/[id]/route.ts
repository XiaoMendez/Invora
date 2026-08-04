import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getEmpresaId } from '@/lib/supabase/empresa'

export const dynamic = "force-dynamic"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const empresaId = await getEmpresaId(supabase)

    // Verify ownership
    const { data: po } = await supabase
      .from('ordenes_compra')
      .select('id_empresa')
      .eq('id', params.id)
      .single()

    if (!po || po.id_empresa !== empresaId) {
      return NextResponse.json({ error: 'PO not found or unauthorized' }, { status: 404 })
    }

    // Delete PO (cascade should handle items)
    const { error: deleteError } = await supabase
      .from('ordenes_compra')
      .delete()
      .eq('id', params.id)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[v0] Error deleting PO:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

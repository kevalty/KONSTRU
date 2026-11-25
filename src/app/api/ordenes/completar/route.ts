import { NextRequest, NextResponse } from 'next/server'
import { actualizarEstadoPedido, listarItemsPedido } from '@/server/db/repositorios'
import { pedidoCompletado } from '@/domain/pedidos/estados'
import { mensajeSeguro } from '@/lib/errors'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { pedidoId } = await req.json() as { pedidoId: string }
    if (!pedidoId) return NextResponse.json({ error: 'Falta pedidoId' }, { status: 400 })

    const items = await listarItemsPedido(pedidoId)
    const estados = items.map(i => i.estado)

    if (!pedidoCompletado(estados)) {
      return NextResponse.json({ error: 'Aún hay artículos sin marcar' }, { status: 400 })
    }

    await actualizarEstadoPedido(pedidoId, 'completado')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[/api/ordenes/completar]', error)
    return NextResponse.json({ error: mensajeSeguro(error) }, { status: 500 })
  }
}

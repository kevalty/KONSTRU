import { NextRequest, NextResponse } from 'next/server'
import { marcarItemPedido } from '@/server/servicios/pedidos'
import { mensajeOrdenCompletada } from '@/server/whatsapp/plantillas'
import { enviarMensaje } from '@/server/whatsapp/enviar'
import { crearClienteAdmin } from '@/server/db/client'
import { mensajeSeguro } from '@/lib/errors'
import type { EstadoItemPedido } from '@/domain/compartido/tipos'

interface Cuerpo {
  itemId: string
  estado: EstadoItemPedido
  notas?: string
  pedidoId: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as Cuerpo
    const { itemId, estado, notas, pedidoId } = body

    if (!itemId || !estado || !pedidoId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const resultado = await marcarItemPedido({ itemId, estado, notas, pedidoId })

    // If pedido just completed, notify the advisor
    if (resultado.pedidoCompletado) {
      const db = crearClienteAdmin()
      const { data: pedido } = await db
        .from('pedidos')
        .select('codigo_acceso, proveedor_id, asesor_id')
        .eq('id', pedidoId)
        .single()

      if (pedido?.asesor_id) {
        const { data: asesor } = await db
          .from('auth.users')
          .select('phone')
          .eq('id', pedido.asesor_id)
          .single()

        const { data: proveedor } = await db
          .from('proveedores')
          .select('nombre')
          .eq('id', pedido.proveedor_id)
          .single()

        if (asesor?.phone && proveedor?.nombre) {
          const msg = mensajeOrdenCompletada(asesor.phone, pedido.codigo_acceso, proveedor.nombre)
          await enviarMensaje(msg).catch(console.error)
        }
      }
    }

    return NextResponse.json({ ok: true, pedidoCompletado: resultado.pedidoCompletado })
  } catch (error) {
    console.error('[/api/ordenes/marcar-item]', error)
    return NextResponse.json({ error: mensajeSeguro(error) }, { status: 500 })
  }
}

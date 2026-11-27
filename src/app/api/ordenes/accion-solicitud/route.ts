import { NextRequest, NextResponse } from 'next/server'
import { actualizarEstadoSolicitud, listarCotizacionesDeSolicitud } from '@/server/db/repositorios'
import { crearPedidoParaProveedor } from '@/server/servicios/pedidos'
import { mensajeOrdenFerreteria } from '@/server/whatsapp/plantillas'
import { enviarMensaje } from '@/server/whatsapp/enviar'
import { crearClienteAdmin } from '@/server/db/client'
import { mensajeSeguro } from '@/lib/errors'
import type { Gama } from '@/domain/compartido/tipos'
import type { ResumenCotizacion } from '@/domain/cotizacion/tipos'

interface Cuerpo {
  solicitudId: string
  tipo: 'confirmar' | 'cancelar' | 'crear-pedido' | 'en-revision'
  gamaSeleccionada?: Gama
  proveedorId?: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as Cuerpo
    const { solicitudId, tipo, gamaSeleccionada, proveedorId } = body

    if (!solicitudId || !tipo) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    switch (tipo) {
      case 'confirmar':
        await actualizarEstadoSolicitud(solicitudId, 'confirmada')
        return NextResponse.json({ ok: true })

      case 'cancelar':
        await actualizarEstadoSolicitud(solicitudId, 'cancelada')
        return NextResponse.json({ ok: true })

      case 'en-revision':
        await actualizarEstadoSolicitud(solicitudId, 'en_revision')
        return NextResponse.json({ ok: true })

      case 'crear-pedido': {
        if (!gamaSeleccionada || !proveedorId) {
          return NextResponse.json({ error: 'Faltan gama o proveedor' }, { status: 400 })
        }

        const cotizaciones = await listarCotizacionesDeSolicitud(solicitudId)
        const cotizacion = cotizaciones.find(c => c.gama === gamaSeleccionada)
        if (!cotizacion) {
          return NextResponse.json({ error: 'Cotizacion no encontrada' }, { status: 404 })
        }

        // Convert DB row to ResumenCotizacion shape for pedidos service
        const resumen = {
          gama: cotizacion.gama,
          items: (cotizacion.items as unknown[]).map((item) => {
            const i = item as Record<string, unknown>
            return {
              producto_id: (i.producto_id ?? null) as string | null,
              producto_nombre: i.producto_nombre as string,
              producto_categoria: i.producto_categoria as string,
              cantidad: i.cantidad as number,
              unidad: i.unidad as string,
              precio_unitario: i.precio_unitario as { centavos: number } | null,
              subtotal: i.subtotal as { centavos: number } | null,
              gama: cotizacion.gama,
              por_confirmar: i.por_confirmar as boolean,
            }
          }),
          subtotal: { centavos: cotizacion.subtotal_cents },
          iva: { centavos: cotizacion.iva_cents },
          total: { centavos: cotizacion.total_cents },
          tiene_items_por_confirmar: cotizacion.tiene_por_confirmar,
          supuestos: cotizacion.supuestos,
          valida_hasta: new Date(cotizacion.valida_hasta),
        } as unknown as ResumenCotizacion

        const pedido = await crearPedidoParaProveedor({
          solicitudId,
          proveedorId,
          cotizacion: resumen,
        })

        // Notify ferretería via WhatsApp
        const db = crearClienteAdmin()
        const { data: proveedor } = await db
          .from('proveedores')
          .select('telefono, nombre')
          .eq('id', proveedorId)
          .single()

        const { data: solicitud } = await db
          .from('solicitudes')
          .select('trabajo_tipo')
          .eq('id', solicitudId)
          .single()

        if (proveedor?.telefono && solicitud?.trabajo_tipo) {
          const msg = mensajeOrdenFerreteria(
            proveedor.telefono,
            pedido.codigoAcceso,
            pedido.token,
            proveedor.nombre,
            solicitud.trabajo_tipo,
          )
          await enviarMensaje(msg).catch(console.error)
        }

        return NextResponse.json({ ok: true, pedidoId: pedido.id, codigoAcceso: pedido.codigoAcceso })
      }

      default:
        return NextResponse.json({ error: 'Accion desconocida' }, { status: 400 })
    }
  } catch (error) {
    console.error('[/api/ordenes/accion-solicitud]', error)
    return NextResponse.json({ error: mensajeSeguro(error) }, { status: 500 })
  }
}

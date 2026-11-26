import { NextRequest, NextResponse } from 'next/server'
import { procesarMensaje, type MensajeChat, type EstadoConversacion } from '@/server/chat/gestor'
import { generarTresCotizaciones } from '@/server/servicios/cotizar'
import { crearSolicitud, actualizarEstadoSolicitud } from '@/server/db/repositorios'
import { hashToken } from '@/server/seguridad/tokens'
import { verificarRateLimit } from '@/server/seguridad/rate-limit'
import { mensajeCotizacionLista } from '@/server/whatsapp/plantillas'
import { enviarMensaje } from '@/server/whatsapp/enviar'
import { mensajeSeguro } from '@/lib/errors'
import type { Medidas, Ubicacion } from '@/domain/compartido/tipos'

interface CuerpoChat {
  sessionId: string
  mensaje: string
  historial: MensajeChat[]
  estado: EstadoConversacion
  numerTelefono?: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const limite = verificarRateLimit(`chat:${ip}`, 60)
    if (!limite.permitido) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, { status: 429 })
    }

    const body = await req.json() as CuerpoChat
    const { sessionId, mensaje, historial, estado } = body

    if (!mensaje?.trim()) {
      return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 })
    }

    // Apply per-session rate limit
    const limiteSession = verificarRateLimit(`chat-session:${sessionId}`, 40)
    if (!limiteSession.permitido) {
      return NextResponse.json({ error: 'Límite de mensajes alcanzado para esta sesión.' }, { status: 429 })
    }

    const respuesta = await procesarMensaje(historial, mensaje, estado)

    // If the conversation confirmed the solicitud, generate quotes
    if (respuesta.solicitudConfirmada && respuesta.estadoActualizado.tipoTrabajo) {
      const { tipoTrabajo, medidas, ubicacion } = respuesta.estadoActualizado

      // Create solicitud in DB
      const telefono = respuesta.estadoActualizado.telefonoContacto ?? body.numerTelefono ?? 'desconocido'
      const hash = hashToken(telefono)
      const solicitud = await crearSolicitud({
        numero_telefono_hash: hash,
        trabajo_tipo: tipoTrabajo,
        medidas: medidas as unknown as Record<string, unknown>,
        ubicacion: ubicacion as unknown as Record<string, unknown>,
      })

      // Generate 3 quotes
      const cotizaciones = await generarTresCotizaciones({
        solicitudId: solicitud.id,
        tipoTrabajo,
        medidas: medidas as Medidas,
        ubicacion: ubicacion as Ubicacion,
      })

      // Mark solicitud as nueva (quotes ready for advisor review)
      await actualizarEstadoSolicitud(solicitud.id, 'nueva')

      // Send WhatsApp (simulated or real)
      // Extract tokens from cotizaciones (attached by generarTresCotizaciones)
      type ConToken = { _token?: string }
      const tokens = {
        economica: (cotizaciones.economica as ConToken)._token ?? '',
        media: (cotizaciones.media as ConToken)._token ?? '',
        premium: (cotizaciones.premium as ConToken)._token ?? '',
      }

      if (telefono !== 'desconocido') {
        const wsMsg = mensajeCotizacionLista(telefono, cotizaciones, tokens)
        await enviarMensaje(wsMsg)
      }

      return NextResponse.json({
        mensaje: respuesta.mensaje,
        estado: respuesta.estadoActualizado,
        cotizacionLista: true,
        solicitudId: solicitud.id,
      })
    }

    return NextResponse.json({
      mensaje: respuesta.mensaje,
      estado: respuesta.estadoActualizado,
      cotizacionLista: false,
    })
  } catch (error) {
    console.error('[/api/chat]', error)
    return NextResponse.json({ error: mensajeSeguro(error) }, { status: 500 })
  }
}

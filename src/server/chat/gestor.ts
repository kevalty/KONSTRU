import OpenAI from 'openai'
import { config } from '@/lib/config'
import { INSTRUCCION_SISTEMA } from './instruccion'
import { HERRAMIENTAS } from './herramientas'
import { zonaDeProvinciaString, altitudDeCiudad } from '@/domain/clima/provincias'
import type { Medidas, Ubicacion } from '@/domain/compartido/tipos'

export interface MensajeChat {
  rol: 'usuario' | 'asistente'
  contenido: string
}

export interface EstadoConversacion {
  tipoTrabajo?: string
  medidas: Medidas
  ubicacion?: Ubicacion
  confirmado: boolean
  telefonoContacto?: string
}

export interface RespuestaChat {
  mensaje: string
  estadoActualizado: EstadoConversacion
  solicitudConfirmada: boolean
}

const cliente = new OpenAI({
  apiKey: config.openrouterApiKey,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': config.appUrl,
    'X-Title': 'Cotizador Ecuador',
  },
})

export async function procesarMensaje(
  historial: MensajeChat[],
  nuevoMensaje: string,
  estado: EstadoConversacion,
): Promise<RespuestaChat> {
  const mensajes: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: INSTRUCCION_SISTEMA },
    ...historial.map(m => ({
      role: m.rol === 'usuario' ? ('user' as const) : ('assistant' as const),
      content: m.contenido,
    })),
    { role: 'user', content: nuevoMensaje },
  ]

  const estadoActualizado = { ...estado }
  let solicitudConfirmada = false
  let respuestaFinal = ''
  let iteraciones = 0
  const MAX_ITERACIONES = 5

  while (iteraciones < MAX_ITERACIONES) {
    iteraciones++

    const respuesta = await cliente.chat.completions.create({
      model: config.chatModel,
      max_tokens: 1024,
      tools: HERRAMIENTAS,
      tool_choice: 'auto',
      messages: mensajes,
    })

    const choice = respuesta.choices[0]
    if (!choice) break

    if (choice.finish_reason === 'stop' || !choice.message.tool_calls?.length) {
      respuestaFinal = choice.message.content ?? ''
      break
    }

    if (choice.finish_reason === 'tool_calls' || choice.message.tool_calls?.length) {
      // Add assistant message with tool_calls to history
      mensajes.push(choice.message)

      const toolResults: OpenAI.ChatCompletionToolMessageParam[] = []

      for (const toolCall of choice.message.tool_calls ?? []) {
        if (toolCall.type !== 'function') continue
        const nombre = toolCall.function.name
        let input: Record<string, unknown> = {}
        try { input = JSON.parse(toolCall.function.arguments) as Record<string, unknown> } catch { /* empty args */ }

        let resultado = 'OK'
        try {
          switch (nombre) {
            case 'registrar_trabajo':
              estadoActualizado.tipoTrabajo = input.tipo as string
              break

            case 'agregar_medida':
              estadoActualizado.medidas = {
                ...estadoActualizado.medidas,
                largo: (input.largo as number | undefined) ?? estadoActualizado.medidas.largo,
                ancho: (input.ancho as number | undefined) ?? estadoActualizado.medidas.ancho,
                alto: (input.alto as number | undefined) ?? estadoActualizado.medidas.alto,
                area: (input.area as number | undefined) ?? estadoActualizado.medidas.area,
                perimetro: (input.perimetro as number | undefined) ?? estadoActualizado.medidas.perimetro,
                volumen: (input.volumen as number | undefined) ?? estadoActualizado.medidas.volumen,
                notas: (input.notas as string | undefined) ?? estadoActualizado.medidas.notas,
              }
              break

            case 'registrar_ubicacion': {
              const provincia = input.provincia as string
              const ciudad = input.ciudad as string | undefined
              const zona = zonaDeProvinciaString(provincia)
              const altitud = ciudad ? altitudDeCiudad(ciudad) : 'bajo'
              estadoActualizado.ubicacion = { provincia, ciudad, zona, altitud }
              break
            }

            case 'confirmar_solicitud':
              estadoActualizado.confirmado = true
              solicitudConfirmada = true
              if (input.numero_telefono) estadoActualizado.telefonoContacto = input.numero_telefono as string
              break
          }
        } catch (err) {
          resultado = `Error: ${err instanceof Error ? err.message : 'Error desconocido'}`
        }

        toolResults.push({ role: 'tool', tool_call_id: toolCall.id, content: resultado })
      }

      mensajes.push(...toolResults)
      continue
    }

    break
  }

  return {
    mensaje: respuestaFinal || 'Un momento, procesando tu solicitud...',
    estadoActualizado,
    solicitudConfirmada,
  }
}

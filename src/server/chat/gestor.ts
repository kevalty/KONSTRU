import Anthropic from '@anthropic-ai/sdk'
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
}

export interface RespuestaChat {
  mensaje: string
  estadoActualizado: EstadoConversacion
  solicitudConfirmada: boolean
}

const cliente = new Anthropic({ apiKey: config.anthropicApiKey })

export async function procesarMensaje(
  historial: MensajeChat[],
  nuevoMensaje: string,
  estado: EstadoConversacion,
): Promise<RespuestaChat> {
  const mensajes: Anthropic.MessageParam[] = [
    ...historial.map(m => ({
      role: m.rol === 'usuario' ? ('user' as const) : ('assistant' as const),
      content: m.contenido,
    })),
    { role: 'user', content: nuevoMensaje },
  ]

  const estadoActualizado = { ...estado }
  let solicitudConfirmada = false

  // Agentic loop — handle tool calls
  let respuestaFinal = ''
  let iteraciones = 0
  const MAX_ITERACIONES = 5

  while (iteraciones < MAX_ITERACIONES) {
    iteraciones++
    const respuesta = await cliente.messages.create({
      model: config.chatModel,
      max_tokens: 1024,
      system: INSTRUCCION_SISTEMA,
      tools: HERRAMIENTAS,
      messages: mensajes,
    })

    if (respuesta.stop_reason === 'end_turn') {
      respuestaFinal = respuesta.content
        .filter(b => b.type === 'text')
        .map(b => (b as Anthropic.TextBlock).text)
        .join('\n')
      break
    }

    if (respuesta.stop_reason === 'tool_use') {
      // Process tool calls
      const toolUses = respuesta.content.filter(b => b.type === 'tool_use') as Anthropic.ToolUseBlock[]
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const tool of toolUses) {
        const input = tool.input as Record<string, unknown>
        let resultado = 'OK'

        try {
          switch (tool.name) {
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
              break
          }
        } catch (err) {
          resultado = `Error: ${err instanceof Error ? err.message : 'Error desconocido'}`
        }

        toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: resultado })
      }

      // Add assistant response + tool results to messages and continue
      mensajes.push({ role: 'assistant', content: respuesta.content })
      mensajes.push({ role: 'user', content: toolResults })
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

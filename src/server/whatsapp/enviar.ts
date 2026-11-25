import { config } from '@/lib/config'
import type { MensajeWhatsApp } from './plantillas'

// ─── Envío de mensajes WhatsApp ───────────────────────────────────────────

export async function enviarMensaje(mensaje: MensajeWhatsApp): Promise<void> {
  if (config.whatsappMode === 'simulado') {
    console.log(`[WhatsApp SIMULADO] Para: ${mensaje.para}`)
    console.log(mensaje.texto)
    console.log('─'.repeat(50))
    return
  }

  const url = `https://graph.facebook.com/v19.0/${config.whatsappPhoneNumberId}/messages`
  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: mensaje.para,
    type: 'text',
    text: { preview_url: true, body: mensaje.texto },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.whatsappToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`WhatsApp API error ${res.status}: ${err}`)
  }
}

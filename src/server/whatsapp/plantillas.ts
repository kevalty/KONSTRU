import { config } from '@/lib/config'
import type { TresCotizaciones } from '@/domain/cotizacion/tipos'
import { formatearUSD } from '@/domain/compartido/dinero'

export interface MensajeWhatsApp {
  para: string
  texto: string
}

// ─── Plantillas de mensajes ───────────────────────────────────────────────

export function mensajeCotizacionLista(
  telefono: string,
  cotizaciones: TresCotizaciones,
  tokens: { economica: string; media: string; premium: string },
): MensajeWhatsApp {
  const { economica, media, premium } = cotizaciones
  const baseUrl = config.appUrl

  const texto = [
    `Hola! Aqui estan tus cotizaciones para *${cotizaciones.trabajo_descripcion}* en ${cotizaciones.ubicacion_descripcion}:`,
    '',
    `🟢 *Economica:* ${formatearUSD(economica.total)}${economica.tiene_items_por_confirmar ? ' (parcial)' : ''}`,
    `🔵 *Media:* ${formatearUSD(media.total)}${media.tiene_items_por_confirmar ? ' (parcial)' : ''}`,
    `🟣 *Premium:* ${formatearUSD(premium.total)}${premium.tiene_items_por_confirmar ? ' (parcial)' : ''}`,
    '',
    'Ver detalle completo:',
    `Economica: ${baseUrl}/c/${tokens.economica}`,
    `Media: ${baseUrl}/c/${tokens.media}`,
    `Premium: ${baseUrl}/c/${tokens.premium}`,
    '',
    '_Estas son cotizaciones preliminares de materiales. Un asesor las revisara y te confirmara._',
    `_Validas hasta ${economica.valida_hasta.toLocaleDateString('es-EC')}_`,
  ].join('\n')

  return { para: telefono, texto }
}

export function mensajeOrdenFerreteria(
  telefono: string,
  codigoAcceso: string,
  token: string,
  nombreFerreteria: string,
  descripcionTrabajo: string,
): MensajeWhatsApp {
  const url = `${config.appUrl}/o/${token}`
  const texto = [
    `Hola *${nombreFerreteria}*! Tienes un nuevo pedido de materiales.`,
    '',
    `Trabajo: ${descripcionTrabajo}`,
    `Codigo de acceso: *${codigoAcceso}*`,
    `Ver pedido: ${url}`,
    '',
    'Por favor marca cada articulo como disponible o sin stock, luego presiona "Enviar lista completa".',
  ].join('\n')

  return { para: telefono, texto }
}

export function mensajeOrdenCompletada(
  telefonoAsesor: string,
  codigoAcceso: string,
  nombreFerreteria: string,
): MensajeWhatsApp {
  const texto = [
    `✅ La ferreteria *${nombreFerreteria}* ha completado el pedido *${codigoAcceso}*.`,
    'Por favor revisa y notifica al cliente.',
  ].join('\n')

  return { para: telefonoAsesor, texto }
}

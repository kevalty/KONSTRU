import { EstadoPedido, EstadoItemPedido } from '../compartido/tipos'
import { ErrorValidacion } from '@/lib/errors'

const TRANSICIONES_PEDIDO: Record<EstadoPedido, EstadoPedido[]> = {
  borrador: ['enviado', 'cancelado'],
  enviado: ['en_proceso', 'cancelado'],
  en_proceso: ['completado', 'cancelado'],
  completado: [],
  cancelado: [],
}

const TRANSICIONES_ITEM: Record<EstadoItemPedido, EstadoItemPedido[]> = {
  pendiente: ['disponible', 'sin_stock'],
  disponible: [],
  sin_stock: ['sustitucion_pendiente'],
  sustitucion_pendiente: ['disponible'],
}

export function transicionarPedido(actual: EstadoPedido, siguiente: EstadoPedido): EstadoPedido {
  if (!TRANSICIONES_PEDIDO[actual].includes(siguiente)) {
    throw new ErrorValidacion(`Transicion invalida de pedido: ${actual} -> ${siguiente}`)
  }
  return siguiente
}

export function transicionarItem(actual: EstadoItemPedido, siguiente: EstadoItemPedido): EstadoItemPedido {
  if (!TRANSICIONES_ITEM[actual].includes(siguiente)) {
    throw new ErrorValidacion(`Transicion invalida de item: ${actual} -> ${siguiente}`)
  }
  return siguiente
}

export function pedidoCompletado(estadosItems: EstadoItemPedido[]): boolean {
  return estadosItems.length > 0 && estadosItems.every(e => e === 'disponible' || e === 'sin_stock')
}

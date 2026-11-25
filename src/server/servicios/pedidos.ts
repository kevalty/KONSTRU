import {
  crearPedido,
  crearItemsPedido,
  listarItemsPedido,
  actualizarEstadoPedido,
  actualizarEstadoItem,
  listarPedidosDeSolicitud,
  type FilaItemPedido,
} from '../db/repositorios'
import { generarToken, generarCodigoAcceso } from '../seguridad/tokens'
import { transicionarPedido, pedidoCompletado } from '@/domain/pedidos/estados'
import type { EstadoItemPedido } from '@/domain/compartido/tipos'
import type { ResumenCotizacion } from '@/domain/cotizacion/tipos'

export interface PedidoConItems {
  id: string
  solicitudId: string
  proveedorId: string
  estado: string
  codigoAcceso: string
  token: string
  items: FilaItemPedido[]
}

export async function crearPedidoParaProveedor(params: {
  solicitudId: string
  proveedorId: string
  cotizacion: ResumenCotizacion
  asesorId?: string
}): Promise<PedidoConItems> {
  const { solicitudId, proveedorId, cotizacion, asesorId } = params
  const codigoAcceso = generarCodigoAcceso()
  const { token, hash } = generarToken()

  const pedido = await crearPedido({
    solicitud_id: solicitudId,
    proveedor_id: proveedorId,
    codigo_acceso: codigoAcceso,
    link_token_hash: hash,
    asesor_id: asesorId,
  })

  const filaItems = cotizacion.items.map(item => ({
    pedido_id: pedido.id,
    producto_id: item.producto_id,
    nombre_producto: item.producto_nombre,
    categoria: item.producto_categoria,
    cantidad: item.cantidad,
    unidad: item.unidad,
    precio_unitario_cents: item.precio_unitario?.centavos ?? null,
    gama: item.gama,
    estado: 'pendiente' as EstadoItemPedido,
    notas_ferreteria: null,
  }))

  const items = await crearItemsPedido(filaItems)

  return { id: pedido.id, solicitudId, proveedorId, estado: pedido.estado, codigoAcceso, token, items }
}

export async function marcarItemPedido(params: {
  itemId: string
  estado: EstadoItemPedido
  notas?: string
  pedidoId: string
}): Promise<{ pedidoCompletado: boolean }> {
  const { itemId, estado, notas, pedidoId } = params
  await actualizarEstadoItem(itemId, estado, notas)

  // Check if all items are resolved → auto-complete pedido
  const todosItems = await listarItemsPedido(pedidoId)
  const estadosItems = todosItems.map(i => i.estado)
  const completo = pedidoCompletado(estadosItems)

  if (completo) {
    await actualizarEstadoPedido(pedidoId, 'completado')
  }

  return { pedidoCompletado: completo }
}

export async function avanzarEstadoPedido(pedidoId: string, nuevoEstado: string): Promise<void> {
  const pedido = await listarPedidosDeSolicitud(pedidoId)
  // find by id
  const p = pedido.find(x => x.id === pedidoId)
  if (!p) throw new Error('Pedido no encontrado')
  const estadoValidado = transicionarPedido(p.estado, nuevoEstado as never)
  await actualizarEstadoPedido(pedidoId, estadoValidado)
}

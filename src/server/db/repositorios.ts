import { crearClienteAdmin } from './client'
import { hashToken } from '../seguridad/tokens'
import { ErrorNoEncontrado } from '@/lib/errors'
import type { EstadoSolicitud, EstadoPedido, EstadoItemPedido, Gama } from '@/domain/compartido/tipos'

// ─── Tipos de fila DB ─────────────────────────────────────────────────────

export interface FilaSolicitud {
  id: string
  created_at: string
  updated_at: string
  numero_telefono_hash: string
  numero_telefono_enc: string | null
  estado: EstadoSolicitud
  trabajo_tipo: string
  medidas: Record<string, unknown>
  ubicacion: Record<string, unknown>
  notas: string | null
  asesor_id: string | null
}

export interface FilaCotizacion {
  id: string
  solicitud_id: string
  gama: Gama
  estado: string
  items: unknown[]
  subtotal_cents: number
  iva_cents: number
  total_cents: number
  tiene_por_confirmar: boolean
  supuestos: string[]
  link_token_hash: string
  valida_hasta: string
  created_at: string
}

export interface FilaPedido {
  id: string
  solicitud_id: string
  proveedor_id: string
  estado: EstadoPedido
  codigo_acceso: string
  link_token_hash: string
  created_at: string
  updated_at: string
  asesor_id: string | null
}

export interface FilaItemPedido {
  id: string
  pedido_id: string
  producto_id: string | null
  nombre_producto: string
  categoria: string
  cantidad: number
  unidad: string
  precio_unitario_cents: number | null
  gama: Gama
  estado: EstadoItemPedido
  notas_ferreteria: string | null
  created_at: string
}

export interface FilaProveedor {
  id: string
  nombre: string
  telefono: string | null
  email: string | null
  ciudad: string | null
  activo: boolean
  created_at: string
}

export interface FilaProducto {
  id: string
  proveedor_id: string | null
  nombre: string
  unidad: string
  precio: number
  gama: Gama
  categoria: string
  activo: boolean
  updated_at: string
  created_at: string
}

// ─── Solicitudes ──────────────────────────────────────────────────────────

export async function crearSolicitud(datos: {
  numero_telefono_hash: string
  numero_telefono_enc?: string
  trabajo_tipo: string
  medidas: Record<string, unknown>
  ubicacion: Record<string, unknown>
  notas?: string
}): Promise<FilaSolicitud> {
  const db = crearClienteAdmin()
  const { data, error } = await db
    .from('solicitudes')
    .insert(datos)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as FilaSolicitud
}

export async function obtenerSolicitud(id: string): Promise<FilaSolicitud> {
  const db = crearClienteAdmin()
  const { data, error } = await db.from('solicitudes').select().eq('id', id).single()
  if (error || !data) throw new ErrorNoEncontrado('Solicitud')
  return data as FilaSolicitud
}

export async function listarSolicitudes(estado?: EstadoSolicitud): Promise<FilaSolicitud[]> {
  const db = crearClienteAdmin()
  let query = db.from('solicitudes').select().order('created_at', { ascending: false })
  if (estado) query = query.eq('estado', estado)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as FilaSolicitud[]
}

export async function actualizarEstadoSolicitud(
  id: string,
  estado: EstadoSolicitud,
  asesorId?: string,
): Promise<void> {
  const db = crearClienteAdmin()
  const update: Partial<FilaSolicitud> = { estado }
  if (asesorId) update.asesor_id = asesorId
  const { error } = await db.from('solicitudes').update(update).eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Cotizaciones ─────────────────────────────────────────────────────────

export async function crearCotizacion(datos: {
  solicitud_id: string
  gama: Gama
  items: unknown[]
  subtotal_cents: number
  iva_cents: number
  total_cents: number
  tiene_por_confirmar: boolean
  supuestos: string[]
  link_token_hash: string
  valida_hasta: Date
}): Promise<FilaCotizacion> {
  const db = crearClienteAdmin()
  const { data, error } = await db
    .from('cotizaciones')
    .insert({ ...datos, valida_hasta: datos.valida_hasta.toISOString() })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as FilaCotizacion
}

export async function obtenerCotizacionPorToken(token: string): Promise<FilaCotizacion> {
  const db = crearClienteAdmin()
  const hash = hashToken(token)
  const { data, error } = await db
    .from('cotizaciones')
    .select()
    .eq('link_token_hash', hash)
    .single()
  if (error || !data) throw new ErrorNoEncontrado('Cotizacion')
  return data as FilaCotizacion
}

export async function listarCotizacionesDeSolicitud(solicitudId: string): Promise<FilaCotizacion[]> {
  const db = crearClienteAdmin()
  const { data, error } = await db
    .from('cotizaciones')
    .select()
    .eq('solicitud_id', solicitudId)
    .order('gama')
  if (error) throw new Error(error.message)
  return (data ?? []) as FilaCotizacion[]
}

// ─── Pedidos ──────────────────────────────────────────────────────────────

export async function crearPedido(datos: {
  solicitud_id: string
  proveedor_id: string
  codigo_acceso: string
  link_token_hash: string
  asesor_id?: string
}): Promise<FilaPedido> {
  const db = crearClienteAdmin()
  const { data, error } = await db.from('pedidos').insert(datos).select().single()
  if (error) throw new Error(error.message)
  return data as FilaPedido
}

export async function obtenerPedidoPorToken(token: string): Promise<FilaPedido> {
  const db = crearClienteAdmin()
  const hash = hashToken(token)
  const { data, error } = await db
    .from('pedidos')
    .select()
    .eq('link_token_hash', hash)
    .single()
  if (error || !data) throw new ErrorNoEncontrado('Pedido')
  return data as FilaPedido
}

export async function obtenerPedidoPorCodigo(codigo: string): Promise<FilaPedido> {
  const db = crearClienteAdmin()
  const { data, error } = await db
    .from('pedidos')
    .select()
    .eq('codigo_acceso', codigo.toUpperCase())
    .single()
  if (error || !data) throw new ErrorNoEncontrado('Pedido')
  return data as FilaPedido
}

export async function listarPedidosDeSolicitud(solicitudId: string): Promise<FilaPedido[]> {
  const db = crearClienteAdmin()
  const { data, error } = await db
    .from('pedidos')
    .select()
    .eq('solicitud_id', solicitudId)
  if (error) throw new Error(error.message)
  return (data ?? []) as FilaPedido[]
}

export async function actualizarEstadoPedido(id: string, estado: EstadoPedido): Promise<void> {
  const db = crearClienteAdmin()
  const { error } = await db.from('pedidos').update({ estado }).eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Items de pedido ──────────────────────────────────────────────────────

export async function crearItemsPedido(
  items: Omit<FilaItemPedido, 'id' | 'created_at'>[],
): Promise<FilaItemPedido[]> {
  const db = crearClienteAdmin()
  const { data, error } = await db.from('items_pedido').insert(items).select()
  if (error) throw new Error(error.message)
  return (data ?? []) as FilaItemPedido[]
}

export async function listarItemsPedido(pedidoId: string): Promise<FilaItemPedido[]> {
  const db = crearClienteAdmin()
  const { data, error } = await db
    .from('items_pedido')
    .select()
    .eq('pedido_id', pedidoId)
    .order('categoria')
  if (error) throw new Error(error.message)
  return (data ?? []) as FilaItemPedido[]
}

export async function actualizarEstadoItem(
  id: string,
  estado: EstadoItemPedido,
  notas?: string,
): Promise<void> {
  const db = crearClienteAdmin()
  const update: Partial<FilaItemPedido> = { estado }
  if (notas !== undefined) update.notas_ferreteria = notas
  const { error } = await db.from('items_pedido').update(update).eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Productos ────────────────────────────────────────────────────────────

export async function listarProductosPorCategoria(categoria: string): Promise<FilaProducto[]> {
  const db = crearClienteAdmin()
  const { data, error } = await db
    .from('productos')
    .select()
    .eq('categoria', categoria)
    .eq('activo', true)
    .order('gama')
  if (error) throw new Error(error.message)
  return (data ?? []) as FilaProducto[]
}

export async function listarTodosProductos(): Promise<FilaProducto[]> {
  const db = crearClienteAdmin()
  const { data, error } = await db
    .from('productos')
    .select('*, proveedores(nombre)')
    .eq('activo', true)
    .order('categoria')
    .order('gama')
  if (error) throw new Error(error.message)
  return (data ?? []) as FilaProducto[]
}

export async function listarProveedores(): Promise<FilaProveedor[]> {
  const db = crearClienteAdmin()
  const { data, error } = await db
    .from('proveedores')
    .select()
    .eq('activo', true)
    .order('nombre')
  if (error) throw new Error(error.message)
  return (data ?? []) as FilaProveedor[]
}

import { describe, it, expect } from 'vitest'
import { transicionarPedido, transicionarItem, pedidoCompletado } from '@/domain/pedidos/estados'

describe('transicionarPedido', () => {
  it('permite transiciones válidas', () => {
    expect(transicionarPedido('borrador', 'enviado')).toBe('enviado')
    expect(transicionarPedido('enviado', 'en_proceso')).toBe('en_proceso')
    expect(transicionarPedido('en_proceso', 'completado')).toBe('completado')
    expect(transicionarPedido('borrador', 'cancelado')).toBe('cancelado')
  })

  it('lanza para transiciones inválidas', () => {
    expect(() => transicionarPedido('completado', 'borrador')).toThrow()
    expect(() => transicionarPedido('cancelado', 'enviado')).toThrow()
    expect(() => transicionarPedido('borrador', 'completado')).toThrow()
  })
})

describe('transicionarItem', () => {
  it('permite transiciones válidas de item', () => {
    expect(transicionarItem('pendiente', 'disponible')).toBe('disponible')
    expect(transicionarItem('pendiente', 'sin_stock')).toBe('sin_stock')
    expect(transicionarItem('sin_stock', 'sustitucion_pendiente')).toBe('sustitucion_pendiente')
  })

  it('lanza para transiciones inválidas de item', () => {
    expect(() => transicionarItem('disponible', 'pendiente')).toThrow()
    expect(() => transicionarItem('pendiente', 'sustitucion_pendiente')).toThrow()
  })
})

describe('pedidoCompletado', () => {
  it('retorna true cuando todos los items están resueltos', () => {
    expect(pedidoCompletado(['disponible', 'disponible', 'sin_stock'])).toBe(true)
  })

  it('retorna false si hay items pendientes', () => {
    expect(pedidoCompletado(['disponible', 'pendiente'])).toBe(false)
  })

  it('retorna false para lista vacía', () => {
    expect(pedidoCompletado([])).toBe(false)
  })
})

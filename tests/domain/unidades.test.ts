import { describe, it, expect } from 'vitest'
import { redondearParaVenta } from '@/domain/compartido/unidades'

describe('redondearParaVenta', () => {
  it('m2 redondea a 0.5 hacia arriba', () => {
    expect(redondearParaVenta(10.1, 'm2')).toBe(10.5)
    expect(redondearParaVenta(10.5, 'm2')).toBe(10.5)
    expect(redondearParaVenta(10.6, 'm2')).toBe(11.0)
  })

  it('m3 redondea a 0.05 hacia arriba', () => {
    expect(redondearParaVenta(1.03, 'm3')).toBe(1.05)
    expect(redondearParaVenta(1.05, 'm3')).toBe(1.05)
    expect(redondearParaVenta(1.051, 'm3')).toBe(1.1)
  })

  it('bolsa y unidad redondean al entero hacia arriba', () => {
    expect(redondearParaVenta(2.1, 'bolsa')).toBe(3)
    expect(redondearParaVenta(5.0, 'unidad')).toBe(5)
    expect(redondearParaVenta(0.01, 'unidad')).toBe(1)
  })

  it('kg redondea a 0.5 hacia arriba', () => {
    expect(redondearParaVenta(2.3, 'kg')).toBe(2.5)
    expect(redondearParaVenta(2.5, 'kg')).toBe(2.5)
    expect(redondearParaVenta(2.6, 'kg')).toBe(3.0)
  })

  it('retorna 0 para cantidades 0 o negativas', () => {
    expect(redondearParaVenta(0, 'm2')).toBe(0)
    expect(redondearParaVenta(-1, 'bolsa')).toBe(0)
  })
})

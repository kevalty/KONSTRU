import { describe, it, expect } from 'vitest'
import { desdePesos, aPesos, sumar, multiplicar, aplicarPorcentaje, formatearUSD, esMayorQue } from '@/domain/compartido/dinero'

describe('dinero', () => {
  it('convierte pesos a centavos redondeando', () => {
    expect(desdePesos(10.005).centavos).toBe(1001)
    expect(desdePesos(0).centavos).toBe(0)
  })

  it('rechaza montos negativos o no finitos', () => {
    expect(() => desdePesos(-1)).toThrow()
    expect(() => desdePesos(Infinity)).toThrow()
  })

  it('suma correctamente', () => {
    expect(sumar(desdePesos(10), desdePesos(5.50)).centavos).toBe(1550)
  })

  it('multiplica redondeando a centavos', () => {
    expect(multiplicar(desdePesos(10), 1.5).centavos).toBe(1500)
    expect(multiplicar(desdePesos(1), 0.333).centavos).toBe(33)
  })

  it('aplica porcentaje correctamente (IVA 15%)', () => {
    const base = desdePesos(100)
    const conIva = aplicarPorcentaje(base, 0.15)
    expect(aPesos(conIva)).toBe(115)
  })

  it('formatea en USD', () => {
    expect(formatearUSD(desdePesos(1234.5))).toBe('$1234.50')
  })

  it('compara montos', () => {
    expect(esMayorQue(desdePesos(10), desdePesos(5))).toBe(true)
    expect(esMayorQue(desdePesos(5), desdePesos(10))).toBe(false)
  })
})

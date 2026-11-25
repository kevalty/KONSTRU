import { describe, it, expect } from 'vitest'
import { evaluarFormula } from '@/domain/calculo/evaluador'

const medidasBase = { largo: 5, ancho: 4, alto: 2.5 }

describe('evaluarFormula', () => {
  it('evalua area como largo * ancho si no se provee', () => {
    const resultado = evaluarFormula('area * 1.1', medidasBase)
    expect(resultado).toBeCloseTo(5 * 4 * 1.1, 5)
  })

  it('usa area provista directamente', () => {
    const resultado = evaluarFormula('area * 1.1', { ...medidasBase, area: 25 })
    expect(resultado).toBeCloseTo(27.5, 5)
  })

  it('evalua perimetro automaticamente', () => {
    const resultado = evaluarFormula('perimetro * alto', medidasBase)
    expect(resultado).toBeCloseTo(2 * (5 + 4) * 2.5, 5)
  })

  it('formula simple con constante', () => {
    expect(evaluarFormula('area / 5', { largo: 10, ancho: 2 })).toBe(4)
  })

  it('retorna 0 para resultado negativo', () => {
    expect(evaluarFormula('area - 1000', medidasBase)).toBe(0)
  })

  it('lanza para formula con codigo arbitrario', () => {
    expect(() => evaluarFormula('Math.random()', medidasBase)).toThrow()
    expect(() => evaluarFormula('process.exit()', medidasBase)).toThrow()
  })
})

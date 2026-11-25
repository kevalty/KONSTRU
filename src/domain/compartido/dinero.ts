import { Dinero } from './tipos'
import { ErrorValidacion } from '@/lib/errors'

export function desdePesos(pesos: number): Dinero {
  if (!isFinite(pesos) || pesos < 0) throw new ErrorValidacion('Monto invalido')
  return { centavos: Math.round(pesos * 100) }
}

export function aPesos(d: Dinero): number {
  return d.centavos / 100
}

export function sumar(...montos: Dinero[]): Dinero {
  return { centavos: montos.reduce((acc, m) => acc + m.centavos, 0) }
}

export function multiplicar(d: Dinero, factor: number): Dinero {
  if (!isFinite(factor) || factor < 0) throw new ErrorValidacion('Factor invalido')
  return { centavos: Math.round(d.centavos * factor) }
}

export function aplicarPorcentaje(d: Dinero, porcentaje: number): Dinero {
  return multiplicar(d, 1 + porcentaje)
}

export function formatearUSD(d: Dinero): string {
  return `$${aPesos(d).toFixed(2)}`
}

export function esMayorQue(a: Dinero, b: Dinero): boolean {
  return a.centavos > b.centavos
}

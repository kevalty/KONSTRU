import { Medidas } from '../compartido/tipos'
import { ErrorValidacion } from '@/lib/errors'

type Variables = {
  largo: number
  ancho: number
  alto: number
  area: number
  perimetro: number
  volumen: number
}

function buildVars(medidas: Medidas): Variables {
  const largo = medidas.largo ?? 0
  const ancho = medidas.ancho ?? 0
  const alto = medidas.alto ?? 0
  return {
    largo,
    ancho,
    alto,
    area: medidas.area ?? largo * ancho,
    perimetro: medidas.perimetro ?? 2 * (largo + ancho),
    volumen: medidas.volumen ?? largo * ancho * alto,
  }
}


export function evaluarFormula(formula: string, medidas: Medidas): number {
  const vars = buildVars(medidas)
  // Replace variable names with their numeric values
  let expr = formula
  for (const [nombre, valor] of Object.entries(vars)) {
    expr = expr.replace(new RegExp(`\\b${nombre}\\b`, 'g'), String(valor))
  }
  // Validate only safe characters remain
  if (!/^[\d\s+\-*/().]+$/.test(expr)) {
    throw new ErrorValidacion(`Formula invalida: ${formula}`)
  }
  try {
    // Use Function constructor for safe arithmetic evaluation after validation
    // shortcut: Function constructor, only reached after regex whitelist above
    const resultado = Function(`"use strict"; return (${expr})`)() as number
    if (!isFinite(resultado) || resultado < 0) return 0
    return resultado
  } catch {
    throw new ErrorValidacion(`Error al evaluar formula: ${formula}`)
  }
}

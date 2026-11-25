import pisoceramica from './piso/ceramica.json'
import pisoparquet from './piso/parquet.json'
import paredesceramica from './paredes/ceramica-pared.json'
import paredespintura from './paredes/pintura.json'
import bano from './bano/completo.json'
import techo from './techo/losa.json'
import fachada from './fachada/pintura-exterior.json'
import impermeabilizacion from './impermeabilizacion/cubierta.json'

export const RECETAS = [
  pisoceramica, pisoparquet, paredesceramica, paredespintura,
  bano, techo, fachada, impermeabilizacion,
] as const

export type RecetaJson = typeof RECETAS[number]

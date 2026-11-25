import { Medidas, Ubicacion, Gama, UnidadMedida } from '../compartido/tipos'
import type { Receta } from './tipos-receta'
import { evaluarFormula } from './evaluador'
import { redondearParaVenta } from '../compartido/unidades'
import { reglasParaZona } from '../clima/reglas'

export interface ItemCalculado {
  producto_categoria: string
  cantidad: number
  unidad: UnidadMedida
  gama: Gama[]
  formula_original: string
  notas?: string
}

export interface ResultadoCalculo {
  items: ItemCalculado[]
  notas_climaticas: string[]
  medidas_usadas: Medidas
  ubicacion: Ubicacion
}

export function calcular(
  receta: Receta,
  medidas: Medidas,
  ubicacion: Ubicacion,
  gama: Gama,
): ResultadoCalculo {
  const items: ItemCalculado[] = []
  const notas_climaticas: string[] = []

  for (const item of receta.items) {
    if (!item.gama.includes(gama)) continue
    const cantidadBase = evaluarFormula(item.formula, medidas)
    const conDesperdicio = cantidadBase * (1 + item.desperdicio)
    const cantidad = redondearParaVenta(conDesperdicio, item.unidad as UnidadMedida)
    if (cantidad <= 0) continue
    items.push({
      producto_categoria: item.producto_categoria,
      cantidad,
      unidad: item.unidad as UnidadMedida,
      gama: item.gama as Gama[],
      formula_original: item.formula,
      notas: item.notas,
    })
  }

  // Apply climate adjustments
  const reglas = reglasParaZona(ubicacion)
  for (const regla of reglas) {
    notas_climaticas.push(regla.nota)
    if (regla.factorExtra !== 1.0 && regla.productoCategoriaExtra) {
      const idx = items.findIndex(i => i.producto_categoria === regla.productoCategoriaExtra)
      if (idx >= 0) {
        items[idx] = { ...items[idx], cantidad: redondearParaVenta(items[idx].cantidad * regla.factorExtra, items[idx].unidad) }
      }
    }
  }

  return { items, notas_climaticas, medidas_usadas: medidas, ubicacion }
}

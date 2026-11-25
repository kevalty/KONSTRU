import { ZonaClimatica, Ubicacion } from '../compartido/tipos'

export interface AjusteClimatico {
  productoCategoriaExtra?: string  // category to add extra units of
  factorExtra: number               // multiplier on quantity (1.0 = no change)
  nota: string
}

const REGLAS: Record<ZonaClimatica, AjusteClimatico[]> = {
  costa: [
    { productoCategoriaExtra: 'impermeabilizante', factorExtra: 1.05, nota: 'Zona costera: impermeabilizacion reforzada' },
    { productoCategoriaExtra: 'pintura_exterior', factorExtra: 1.05, nota: 'Zona costera: pintura anticorrosiva' },
  ],
  sierra: [
    { productoCategoriaExtra: 'impermeabilizante', factorExtra: 1.0, nota: 'Sierra: sellador resistente a heladas para exteriores' },
    { productoCategoriaExtra: 'pintura_exterior', factorExtra: 1.0, nota: 'Sierra: pintura resistente a bajas temperaturas' },
  ],
  oriente: [
    { productoCategoriaExtra: 'impermeabilizante', factorExtra: 1.15, nota: 'Oriente: impermeabilizacion maxima por alta humedad' },
    { productoCategoriaExtra: 'fungicida', factorExtra: 1.0, nota: 'Oriente: tratamiento antimohoso obligatorio' },
  ],
}

export function reglasParaZona(ubicacion: Ubicacion): AjusteClimatico[] {
  const base = REGLAS[ubicacion.zona]
  if (ubicacion.zona === 'sierra' && ubicacion.altitud === 'alto') {
    return [...base, { productoCategoriaExtra: 'aislante_termico', factorExtra: 1.0, nota: 'Sierra alta: aislamiento termico recomendado' }]
  }
  return base
}

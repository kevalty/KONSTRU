import { Ubicacion, ZonaClimatica } from '../compartido/tipos'
import { ErrorValidacion } from '@/lib/errors'

const ZONAS: Record<string, ZonaClimatica> = {
  // Costa
  esmeraldas: 'costa', manabi: 'costa', guayas: 'costa', santaelena: 'costa',
  lorios: 'costa', eloro: 'costa', bolivar: 'costa',
  // Sierra
  carchi: 'sierra', imbabura: 'sierra', pichincha: 'sierra', cotopaxi: 'sierra',
  tungurahua: 'sierra', chimborazo: 'sierra', bolivarsierra: 'sierra', canar: 'sierra',
  azuay: 'sierra', loja: 'sierra',
  // Oriente
  sucumbios: 'oriente', napo: 'oriente', orellana: 'oriente', pastaza: 'oriente',
  moronasantiago: 'oriente', zamorachinchipe: 'oriente',
  // Special (coastal zone behavior)
  galapagos: 'costa',
}

// Normalize: lowercase, no spaces, no accents
function normalizar(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ\s]/g, '')
}

export function zonaDeProvinciaString(provincia: string): ZonaClimatica {
  const key = normalizar(provincia)
  const zona = ZONAS[key]
  if (!zona) throw new ErrorValidacion(`Provincia no reconocida: ${provincia}`)
  return zona
}

export function altitudDeCiudad(ciudad: string): Ubicacion['altitud'] {
  const c = normalizar(ciudad)
  const alto = ['quito', 'riobamba', 'ambato', 'latacunga', 'tulcan', 'guaranda', 'cuenca']
  const medio = ['loja', 'ibarra', 'otavalo', 'baños', 'tena', 'macas']
  if (alto.some(x => c.includes(x))) return 'alto'
  if (medio.some(x => c.includes(x))) return 'medio'
  return 'bajo'
}

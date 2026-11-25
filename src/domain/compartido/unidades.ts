import { UnidadMedida } from './tipos'

export function redondearParaVenta(cantidad: number, unidad: UnidadMedida): number {
  if (cantidad <= 0) return 0
  switch (unidad) {
    case 'm2':
      return Math.ceil(cantidad * 2) / 2    // round up to 0.5
    case 'm3':
      return Math.ceil(cantidad * 20) / 20  // round up to 0.05
    case 'ml':
      return Math.ceil(cantidad * 10) / 10  // round up to 0.1
    case 'caja':
    case 'bolsa':
    case 'unidad':
    case 'par':
    case 'juego':
    case 'galon':
    case 'litro':
      return Math.ceil(cantidad)            // round up to whole
    case 'kg':
      return Math.ceil(cantidad * 2) / 2    // round up to 0.5 kg
    default:
      return Math.ceil(cantidad)
  }
}

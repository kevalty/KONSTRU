import { ItemCalculado } from '../calculo/motor'
import { Gama } from '../compartido/tipos'
import { ProductoCotizado, ResumenCotizacion } from './tipos'
import type { Dinero } from '../compartido/tipos'
import { desdePesos, sumar, multiplicar } from '../compartido/dinero'
import { config } from '@/lib/config'

export interface ProductoCatalogo {
  id: string
  nombre: string
  categoria: string
  precio: number  // USD
  gama: Gama
  unidad: string
}

export function armarCotizacion(
  gama: Gama,
  itemsCalculados: ItemCalculado[],
  catalogo: ProductoCatalogo[],
  supuestos: string[],
  validezDias: number,
): ResumenCotizacion {
  const items: ProductoCotizado[] = itemsCalculados.map(ic => {
    const producto = catalogo.find(
      p => p.categoria === ic.producto_categoria && p.gama === gama
    ) ?? catalogo.find(p => p.categoria === ic.producto_categoria)

    if (!producto) {
      return {
        producto_id: null,
        producto_nombre: `${ic.producto_categoria} (por confirmar)`,
        producto_categoria: ic.producto_categoria,
        cantidad: ic.cantidad,
        unidad: ic.unidad,
        precio_unitario: null,
        subtotal: null,
        gama,
        por_confirmar: true,
      }
    }

    const precio = desdePesos(producto.precio)
    const subtotal = multiplicar(precio, ic.cantidad)
    return {
      producto_id: producto.id,
      producto_nombre: producto.nombre,
      producto_categoria: ic.producto_categoria,
      cantidad: ic.cantidad,
      unidad: ic.unidad,
      precio_unitario: precio,
      subtotal,
      gama,
      por_confirmar: false,
    }
  })

  const tiene_items_por_confirmar = items.some(i => i.por_confirmar)
  const subtotal = sumar(...items.filter(i => i.subtotal).map(i => i.subtotal as Dinero))
  const iva = multiplicar(subtotal, config.ivaPorcentaje)
  const total = sumar(subtotal, iva)

  const ahora = new Date()
  const valida_hasta = new Date(ahora)
  valida_hasta.setDate(valida_hasta.getDate() + validezDias)

  return {
    gama,
    items,
    subtotal,
    iva,
    total,
    tiene_items_por_confirmar,
    supuestos: [
      ...supuestos,
      `Cotizacion valida hasta: ${valida_hasta.toLocaleDateString('es-EC')}`,
      'Esta es una estimacion de materiales. Las cantidades exactas se confirman con un asesor.',
      tiene_items_por_confirmar ? 'Algunos items estan por confirmar precio.' : '',
    ].filter(Boolean),
    valida_hasta,
  }
}

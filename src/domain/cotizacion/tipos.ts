import { Dinero } from '../compartido/tipos'
import { Gama } from '../compartido/tipos'

export interface ProductoCotizado {
  producto_id: string | null   // null = "por confirmar"
  producto_nombre: string
  producto_categoria: string
  cantidad: number
  unidad: string
  precio_unitario: Dinero | null  // null = "por confirmar"
  subtotal: Dinero | null
  gama: Gama
  por_confirmar: boolean
}

export interface ResumenCotizacion {
  gama: Gama
  items: ProductoCotizado[]
  subtotal: Dinero
  iva: Dinero
  total: Dinero
  tiene_items_por_confirmar: boolean
  supuestos: string[]
  valida_hasta: Date
}

export interface TresCotizaciones {
  economica: ResumenCotizacion
  media: ResumenCotizacion
  premium: ResumenCotizacion
  generado_en: Date
  ubicacion_descripcion: string
  trabajo_descripcion: string
}

export type Gama = 'economica' | 'media' | 'premium'
export type ZonaClimatica = 'costa' | 'sierra' | 'oriente'
export type UnidadMedida = 'm2' | 'm3' | 'ml' | 'kg' | 'bolsa' | 'unidad' | 'caja' | 'galon' | 'litro' | 'par' | 'juego'
export type TipoTrabajo = 'piso' | 'paredes' | 'techo' | 'bano' | 'cocina' | 'fachada' | 'impermeabilizacion' | 'estructura' | 'ventanas' | 'puertas'
export type EstadoSolicitud = 'nueva' | 'en_revision' | 'confirmada' | 'cancelada'
export type EstadoPedido = 'borrador' | 'enviado' | 'en_proceso' | 'completado' | 'cancelado'
export type EstadoItemPedido = 'pendiente' | 'disponible' | 'sin_stock' | 'sustitucion_pendiente'

export interface Dinero {
  centavos: number  // always integer, USD cents
}

export interface Medidas {
  largo?: number    // meters
  ancho?: number    // meters
  alto?: number     // meters
  area?: number     // m² (can be provided directly or computed)
  perimetro?: number // meters
  volumen?: number  // m³
  notas?: string
}

export interface Ubicacion {
  provincia: string
  ciudad?: string
  zona: ZonaClimatica
  altitud?: 'bajo' | 'medio' | 'alto'  // bajo <500m, medio 500-2500m, alto >2500m
}

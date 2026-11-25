import { calcular } from '@/domain/calculo/motor'
import { armarCotizacion, type ProductoCatalogo } from '@/domain/cotizacion/armar'
import type { TresCotizaciones, ResumenCotizacion } from '@/domain/cotizacion/tipos'
import type { Medidas, Ubicacion, Gama } from '@/domain/compartido/tipos'
import { RECETAS } from '@/recetas'
import type { Receta } from '@/domain/calculo/tipos-receta'
import { listarProductosPorCategoria } from '../db/repositorios'
import { generarToken } from '../seguridad/tokens'
import { crearCotizacion } from '../db/repositorios'
import { config } from '@/lib/config'
import { ErrorValidacion } from '@/lib/errors'

// ─── Buscar receta para un tipo de trabajo ────────────────────────────────

export function buscarReceta(tipoTrabajo: string): Receta | undefined {
  return (RECETAS as unknown as Receta[]).find(r => r.tipo_trabajo === tipoTrabajo)
}

// ─── Construir catálogo desde la DB ──────────────────────────────────────

async function construirCatalogo(categorias: string[]): Promise<ProductoCatalogo[]> {
  const listas = await Promise.all(categorias.map(listarProductosPorCategoria))
  return listas.flat().map(p => ({
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria,
    precio: Number(p.precio),
    gama: p.gama,
    unidad: p.unidad,
  }))
}

// ─── Generar 3 cotizaciones ───────────────────────────────────────────────

export async function generarTresCotizaciones(params: {
  solicitudId: string
  tipoTrabajo: string
  medidas: Medidas
  ubicacion: Ubicacion
}): Promise<TresCotizaciones> {
  const { solicitudId, tipoTrabajo, medidas, ubicacion } = params

  const receta = buscarReceta(tipoTrabajo)
  if (!receta) throw new ErrorValidacion(`Tipo de trabajo no soportado: ${tipoTrabajo}`)

  // Calculate items for each gama using the same recipe
  const gamas: Gama[] = ['economica', 'media', 'premium']
  const resultados = gamas.map(gama => calcular(receta, medidas, ubicacion, gama))

  // Build product catalog for all needed categories
  const categoriasNecesarias = [...new Set(resultados.flatMap(r => r.items.map(i => i.producto_categoria)))]
  const catalogo = await construirCatalogo(categoriasNecesarias)

  const supuestos = [
    `Tipo de trabajo: ${tipoTrabajo}`,
    `Zona climatica: ${ubicacion.zona}`,
    ...resultados[0].notas_climaticas,
  ]

  // Build and persist each cotizacion
  const cotizaciones = await Promise.all(
    gamas.map(async (gama, i) => {
      const resumen = armarCotizacion(gama, resultados[i].items, catalogo, supuestos, config.cotizacionValidezDias)
      const { token, hash } = generarToken()
      await crearCotizacion({
        solicitud_id: solicitudId,
        gama,
        items: resumen.items as unknown[],
        subtotal_cents: resumen.subtotal.centavos,
        iva_cents: resumen.iva.centavos,
        total_cents: resumen.total.centavos,
        tiene_por_confirmar: resumen.tiene_items_por_confirmar,
        supuestos: resumen.supuestos,
        link_token_hash: hash,
        valida_hasta: resumen.valida_hasta,
      })
      // Attach the plaintext token so it can be sent to the client
      ;(resumen as ResumenCotizacion & { _token: string })._token = token
      return resumen
    })
  )

  return {
    economica: cotizaciones[0],
    media: cotizaciones[1],
    premium: cotizaciones[2],
    generado_en: new Date(),
    ubicacion_descripcion: `${ubicacion.provincia}${ubicacion.ciudad ? `, ${ubicacion.ciudad}` : ''}`,
    trabajo_descripcion: tipoTrabajo,
  }
}

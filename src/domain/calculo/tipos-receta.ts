import { z } from 'zod'
import { Gama, UnidadMedida, TipoTrabajo } from '../compartido/tipos'

export const ItemRecetaSchema = z.object({
  producto_categoria: z.string(),
  formula: z.string(),           // e.g. "area * 1.1 / 1.44" (m² / m² per box)
  unidad: z.string() as z.ZodType<UnidadMedida>,
  desperdicio: z.number().min(0).max(1).default(0.1),  // 0.1 = 10%
  gama: z.array(z.string() as z.ZodType<Gama>).default(['economica', 'media', 'premium']),
  notas: z.string().optional(),
})

export const RecetaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  version: z.number().int(),
  tipo_trabajo: z.string() as z.ZodType<TipoTrabajo>,
  items: z.array(ItemRecetaSchema),
})

export type ItemReceta = z.infer<typeof ItemRecetaSchema>
export type Receta = z.infer<typeof RecetaSchema>

import type { FilaCotizacion } from '@/server/db/repositorios'

const COLORES_GAMA = {
  economica: 'bg-green-100 text-green-800 border-green-200',
  media: 'bg-blue-100 text-blue-800 border-blue-200',
  premium: 'bg-purple-100 text-purple-800 border-purple-200',
}

const ETIQUETAS_GAMA = {
  economica: 'Económica',
  media: 'Media',
  premium: 'Premium',
}

interface ItemCotizacion {
  nombre_producto: string
  cantidad: number
  unidad: string
  subtotal: { centavos: number } | null
  por_confirmar: boolean
}

export function TarjetaCotizacion({ cotizacion, destacada }: { cotizacion: FilaCotizacion; destacada?: boolean }) {
  const items = cotizacion.items as ItemCotizacion[]
  const totalUSD = (cotizacion.total_cents / 100).toFixed(2)
  const subtotalUSD = (cotizacion.subtotal_cents / 100).toFixed(2)
  const ivaUSD = (cotizacion.iva_cents / 100).toFixed(2)

  return (
    <div className={`bg-white rounded-xl border-2 p-4 ${destacada ? 'border-emerald-400' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${COLORES_GAMA[cotizacion.gama]}`}>
          {ETIQUETAS_GAMA[cotizacion.gama]}
        </span>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">${totalUSD}</div>
          <div className="text-xs text-slate-400">IVA incluido</div>
        </div>
      </div>

      {cotizacion.tiene_por_confirmar && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 mb-3">
          Algunos ítems están por confirmar precio
        </div>
      )}

      <details className="group">
        <summary className="cursor-pointer text-sm text-emerald-600 font-medium list-none flex items-center gap-1">
          <span className="group-open:hidden">▶ Ver {items.length} ítems</span>
          <span className="hidden group-open:inline">▼ Ocultar ítems</span>
        </summary>
        <div className="mt-3 space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-1 border-b border-slate-50">
              <div>
                <span className="text-slate-700">{item.nombre_producto}</span>
                <span className="text-slate-400 ml-2">{item.cantidad} {item.unidad}</span>
              </div>
              <span className={item.por_confirmar ? 'text-amber-600' : 'text-slate-700'}>
                {item.por_confirmar ? 'por confirmar' : item.subtotal ? `$${(item.subtotal.centavos / 100).toFixed(2)}` : '-'}
              </span>
            </div>
          ))}
          <div className="pt-2 space-y-1 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span><span>${subtotalUSD}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>IVA (15%)</span><span>${ivaUSD}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-800">
              <span>Total</span><span>${totalUSD}</span>
            </div>
          </div>
        </div>
      </details>

      <div className="mt-3 text-xs text-slate-400">
        {(cotizacion.supuestos as string[]).slice(0, 2).join(' · ')}
      </div>
    </div>
  )
}

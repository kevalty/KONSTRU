import { obtenerCotizacionPorToken, listarCotizacionesDeSolicitud } from '@/server/db/repositorios'
import { notFound } from 'next/navigation'
import { TarjetaCotizacion } from '@/components/cotizacion/TarjetaCotizacion'

export default async function PaginaCotizacion({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  let cotizacion
  try {
    cotizacion = await obtenerCotizacionPorToken(token)
  } catch {
    notFound()
  }

  const todasCotizaciones = await listarCotizacionesDeSolicitud(cotizacion.solicitud_id)

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <h1 className="font-bold text-emerald-600">Cotizador</h1>
        <p className="text-sm text-slate-500 mt-1">Tus cotizaciones de materiales</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Estas son cotizaciones <strong>preliminares</strong> de materiales. Un asesor las revisará y te confirmará.
        </div>

        {todasCotizaciones.map(c => (
          <TarjetaCotizacion key={c.id} cotizacion={c} destacada={c.id === cotizacion.id} />
        ))}

        <p className="text-xs text-slate-400 text-center pb-4">
          No incluye mano de obra ni instalación. Precios sujetos a disponibilidad.
        </p>
      </div>
    </main>
  )
}

export const dynamic = 'force-dynamic'

import { obtenerSolicitud, listarCotizacionesDeSolicitud, listarProveedores } from '@/server/db/repositorios'
import { notFound } from 'next/navigation'
import { AccionesSolicitud } from '@/components/panel/AccionesSolicitud'
import { TarjetaCotizacion } from '@/components/cotizacion/TarjetaCotizacion'

export default async function PaginaDetalleSolicitud({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let solicitud
  try {
    solicitud = await obtenerSolicitud(id)
  } catch {
    notFound()
  }

  const [cotizaciones, proveedores] = await Promise.all([
    listarCotizacionesDeSolicitud(id),
    listarProveedores(),
  ])

  const medidas = solicitud.medidas as Record<string, number | string>
  const ubicacion = solicitud.ubicacion as Record<string, string>

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 capitalize">{solicitud.trabajo_tipo}</h1>
        <span className="text-sm text-slate-500">{solicitud.id.slice(0, 8)}…</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-slate-400">Provincia:</span> <span className="font-medium">{ubicacion.provincia ?? '—'}</span></div>
        <div><span className="text-slate-400">Zona:</span> <span className="font-medium capitalize">{ubicacion.zona ?? '—'}</span></div>
        {Object.entries(medidas).filter(([k]) => k !== 'notas').map(([k, v]) => (
          <div key={k}><span className="text-slate-400">{k}:</span> <span className="font-medium">{v}m</span></div>
        ))}
      </div>

      <h2 className="font-semibold text-slate-700">Cotizaciones</h2>
      {cotizaciones.map(c => <TarjetaCotizacion key={c.id} cotizacion={c} />)}

      <AccionesSolicitud
        solicitudId={id}
        estadoActual={solicitud.estado}
        proveedores={proveedores}
        cotizaciones={cotizaciones}
      />
    </div>
  )
}

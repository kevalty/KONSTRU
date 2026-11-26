export const dynamic = 'force-dynamic'

import { obtenerSolicitud, listarCotizacionesDeSolicitud, listarProveedores } from '@/server/db/repositorios'
import { notFound } from 'next/navigation'
import { AccionesSolicitud } from '@/components/panel/AccionesSolicitud'
import { TarjetaCotizacion } from '@/components/cotizacion/TarjetaCotizacion'
import Link from 'next/link'

const ESTADO_CONFIG = {
  nueva:       { clase: 'bg-blue-50 text-blue-700 border-blue-100',         label: 'Nueva' },
  en_revision: { clase: 'bg-amber-50 text-amber-700 border-amber-100',      label: 'En revisión' },
  confirmada:  { clase: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Confirmada' },
  cancelada:   { clase: 'bg-slate-50 text-slate-500 border-slate-100',      label: 'Cancelada' },
} as const

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
  const cfg = ESTADO_CONFIG[solicitud.estado as keyof typeof ESTADO_CONFIG] ?? ESTADO_CONFIG.cancelada

  return (
    <div className="p-6 md:p-8 max-w-[800px]">
      {/* Back link + header */}
      <div className="mb-6">
        <Link href="/panel/solicitudes" className="text-xs text-[#64748B] hover:text-[#0F172A] transition-colors inline-flex items-center gap-1 mb-3">
          ← Solicitudes
        </Link>
        <div className="flex items-start justify-between gap-4 mt-1">
          <h1 className="text-[22px] font-semibold text-[#0F172A] capitalize tracking-tight">
            {solicitud.trabajo_tipo}
          </h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border flex-shrink-0 mt-1 ${cfg.clase}`}>
            {cfg.label}
          </span>
        </div>
        <p className="text-xs text-[#94A3B8] mt-1 font-mono">{solicitud.id}</p>
      </div>

      {/* Info card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 mb-6">
        <p className="text-xs font-medium text-[#94A3B8] mb-4">Detalles</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
          {ubicacion.provincia && (
            <div>
              <p className="text-xs text-[#94A3B8] mb-0.5">Provincia</p>
              <p className="text-sm font-medium text-[#0F172A]">{ubicacion.provincia}</p>
            </div>
          )}
          {ubicacion.zona && (
            <div>
              <p className="text-xs text-[#94A3B8] mb-0.5">Zona climática</p>
              <p className="text-sm font-medium text-[#0F172A] capitalize">{ubicacion.zona}</p>
            </div>
          )}
          {Object.entries(medidas).filter(([k]) => k !== 'notas').map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-[#94A3B8] mb-0.5 capitalize">{k}</p>
              <p className="text-sm font-medium text-[#0F172A]">{v}m</p>
            </div>
          ))}
        </div>
        {medidas.notas && (
          <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
            <p className="text-xs text-[#94A3B8] mb-0.5">Notas</p>
            <p className="text-sm text-[#0F172A]">{String(medidas.notas)}</p>
          </div>
        )}
      </div>

      {/* Cotizaciones */}
      {cotizaciones.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Cotizaciones</h2>
          {cotizaciones.map(c => <TarjetaCotizacion key={c.id} cotizacion={c} />)}
        </div>
      )}

      <AccionesSolicitud
        solicitudId={id}
        estadoActual={solicitud.estado}
        proveedores={proveedores}
        cotizaciones={cotizaciones}
      />
    </div>
  )
}

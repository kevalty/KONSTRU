export const dynamic = 'force-dynamic'

import { listarSolicitudes } from '@/server/db/repositorios'
import Link from 'next/link'
import { formatearFechaEC } from '@/lib/zona-horaria'

const ESTADO_CONFIG = {
  nueva:       { clase: 'bg-blue-100 text-blue-700 border-blue-200',   label: 'Nueva',       dot: 'bg-blue-500' },
  en_revision: { clase: 'bg-amber-100 text-amber-700 border-amber-200', label: 'En revisión', dot: 'bg-amber-500' },
  confirmada:  { clase: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Confirmada', dot: 'bg-emerald-500' },
  cancelada:   { clase: 'bg-slate-100 text-slate-500 border-slate-200', label: 'Cancelada',   dot: 'bg-slate-400' },
} as const

const TRABAJO_EMOJI: Record<string, string> = {
  piso: '🏠', paredes: '🧱', bano: '🚿', techo: '🏗️', fachada: '🏢', impermeabilizacion: '💧',
}

export default async function PaginaSolicitudes() {
  const solicitudes = await listarSolicitudes()

  const counts = {
    nueva: solicitudes.filter(s => s.estado === 'nueva').length,
    en_revision: solicitudes.filter(s => s.estado === 'en_revision').length,
    confirmada: solicitudes.filter(s => s.estado === 'confirmada').length,
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Solicitudes</h1>
        <p className="text-slate-500 text-sm mt-1">Cotizaciones enviadas por los clientes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Nuevas', valor: counts.nueva, color: 'border-blue-200 bg-blue-50', text: 'text-blue-700' },
          { label: 'En revisión', valor: counts.en_revision, color: 'border-amber-200 bg-amber-50', text: 'text-amber-700' },
          { label: 'Confirmadas', valor: counts.confirmada, color: 'border-emerald-200 bg-emerald-50', text: 'text-emerald-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <div className={`text-2xl font-black ${s.text}`}>{s.valor}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {solicitudes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-slate-400 font-medium">No hay solicitudes todavía</p>
          <p className="text-slate-400 text-sm mt-1">Cuando los clientes coticen, aparecerán aquí</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="hidden md:grid grid-cols-5 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span className="col-span-2">Trabajo</span>
            <span>Ubicación</span>
            <span>Fecha</span>
            <span>Estado</span>
          </div>
          <div className="divide-y divide-slate-100">
            {solicitudes.map(s => {
              const cfg = ESTADO_CONFIG[s.estado] ?? ESTADO_CONFIG.cancelada
              const ubicacion = s.ubicacion as { provincia?: string; ciudad?: string }
              return (
                <Link
                  key={s.id}
                  href={`/panel/solicitudes/${s.id}`}
                  className="grid md:grid-cols-5 gap-2 md:gap-4 items-center px-5 py-4 hover:bg-emerald-50/50 transition-colors"
                >
                  <div className="md:col-span-2 flex items-center gap-3">
                    <span className="text-2xl">{TRABAJO_EMOJI[s.trabajo_tipo] ?? '🔨'}</span>
                    <div>
                      <div className="font-semibold text-slate-900 capitalize">{s.trabajo_tipo}</div>
                      <div className="text-xs text-slate-400 font-mono">{s.id.slice(0, 8)}…</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    {ubicacion.ciudad ?? ubicacion.provincia ?? '—'}
                  </div>
                  <div className="text-sm text-slate-500">
                    {formatearFechaEC(new Date(s.created_at))}
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${cfg.clase}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

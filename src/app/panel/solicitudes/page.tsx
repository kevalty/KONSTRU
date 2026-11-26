export const dynamic = 'force-dynamic'

import { listarSolicitudes } from '@/server/db/repositorios'
import Link from 'next/link'
import { formatearFechaEC } from '@/lib/zona-horaria'

const ESTADO_CONFIG = {
  nueva:       { clase: 'bg-blue-50 text-blue-700 border-blue-100',         label: 'Nueva',       dot: 'bg-blue-500' },
  en_revision: { clase: 'bg-amber-50 text-amber-700 border-amber-100',      label: 'En revisión', dot: 'bg-amber-500' },
  confirmada:  { clase: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Confirmada',  dot: 'bg-emerald-500' },
  cancelada:   { clase: 'bg-slate-50 text-slate-500 border-slate-100',      label: 'Cancelada',   dot: 'bg-slate-400' },
} as const

const TRABAJO_EMOJI: Record<string, string> = {
  piso: '🏠', paredes: '🧱', bano: '🚿', techo: '🏗️', fachada: '🏢', impermeabilizacion: '💧',
}

export default async function PaginaSolicitudes() {
  const solicitudes = await listarSolicitudes()

  const counts = {
    nueva:       solicitudes.filter(s => s.estado === 'nueva').length,
    en_revision: solicitudes.filter(s => s.estado === 'en_revision').length,
    confirmada:  solicitudes.filter(s => s.estado === 'confirmada').length,
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-[#0F172A] tracking-tight">Solicitudes</h1>
        <p className="text-sm text-[#64748B] mt-0.5">Cotizaciones enviadas por los clientes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Nuevas',      valor: counts.nueva,       color: 'text-blue-600' },
          { label: 'En revisión', valor: counts.en_revision, color: 'text-amber-600' },
          { label: 'Confirmadas', valor: counts.confirmada,  color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-xl p-5">
            <div className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.valor}</div>
            <div className="text-xs text-[#64748B] mt-1.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {solicitudes.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
          <div className="text-3xl mb-3">📋</div>
          <p className="text-sm font-medium text-[#64748B]">No hay solicitudes todavía</p>
          <p className="text-xs text-[#94A3B8] mt-1">Cuando los clientes coticen, aparecerán aquí</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-3 border-b border-[#E2E8F0] text-xs font-medium text-[#94A3B8]">
            <span className="col-span-2">Trabajo</span>
            <span>Ubicación</span>
            <span>Fecha</span>
            <span>Estado</span>
          </div>
          <div>
            {solicitudes.map((s, i) => {
              const cfg = ESTADO_CONFIG[s.estado as keyof typeof ESTADO_CONFIG] ?? ESTADO_CONFIG.cancelada
              const ubicacion = s.ubicacion as { provincia?: string; ciudad?: string }
              return (
                <Link
                  key={s.id}
                  href={`/panel/solicitudes/${s.id}`}
                  className={`grid md:grid-cols-5 gap-2 md:gap-4 items-center px-6 py-3.5 hover:bg-[#F8FAFC] transition-colors ${
                    i < solicitudes.length - 1 ? 'border-b border-[#F1F5F9]' : ''
                  }`}
                >
                  <div className="md:col-span-2 flex items-center gap-3">
                    <span className="text-xl w-6 text-center flex-shrink-0">{TRABAJO_EMOJI[s.trabajo_tipo] ?? '🔨'}</span>
                    <div>
                      <div className="text-sm font-medium text-[#0F172A] capitalize">{s.trabajo_tipo}</div>
                      <div className="text-xs text-[#94A3B8] font-mono">{s.id.slice(0, 8)}…</div>
                    </div>
                  </div>
                  <div className="text-sm text-[#64748B]">
                    {ubicacion.ciudad ?? ubicacion.provincia ?? '—'}
                  </div>
                  <div className="text-sm text-[#94A3B8]">
                    {formatearFechaEC(new Date(s.created_at))}
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${cfg.clase}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
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

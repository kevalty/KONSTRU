export const dynamic = 'force-dynamic'

import { listarSolicitudes } from '@/server/db/repositorios'
import Link from 'next/link'
import { formatearFechaEC } from '@/lib/zona-horaria'

const TRABAJO_EMOJI: Record<string, string> = {
  piso: '🏠', paredes: '🧱', bano: '🚿', techo: '🏗️', fachada: '🏢', impermeabilizacion: '💧',
}

const ESTADO_CONFIG = {
  nueva:       { clase: 'bg-blue-50 text-blue-700 border-blue-100',         label: 'Nueva' },
  en_revision: { clase: 'bg-amber-50 text-amber-700 border-amber-100',      label: 'En revisión' },
  confirmada:  { clase: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Confirmada' },
  cancelada:   { clase: 'bg-slate-50 text-slate-500 border-slate-100',      label: 'Cancelada' },
} as const

export default async function PanelHome() {
  const solicitudes = await listarSolicitudes()
  const nuevas = solicitudes.filter(s => s.estado === 'nueva').length
  const enRevision = solicitudes.filter(s => s.estado === 'en_revision').length
  const confirmadas = solicitudes.filter(s => s.estado === 'confirmada').length
  const recientes = solicitudes.slice(0, 5)

  return (
    <div className="p-6 md:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-[#0F172A] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#64748B] mt-0.5">Resumen de actividad de KONSTRU</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total solicitudes', valor: solicitudes.length, color: 'text-[#0F172A]' },
          { label: 'Nuevas',            valor: nuevas,              color: 'text-blue-600' },
          { label: 'En revisión',       valor: enRevision,          color: 'text-amber-600' },
          { label: 'Confirmadas',       valor: confirmadas,         color: 'text-emerald-600' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-[#E2E8F0] rounded-xl p-5">
            <div className={`text-3xl font-bold tracking-tight ${k.color}`}>{k.valor}</div>
            <div className="text-xs text-[#64748B] mt-1.5 font-medium">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { href: '/panel/solicitudes', label: 'Solicitudes', desc: 'Revisar cotizaciones pendientes', icon: '📋' },
          { href: '/panel/pedidos',     label: 'Pedidos',     desc: 'Estado de órdenes a ferreterías', icon: '📦' },
          { href: '/panel/catalogo',    label: 'Catálogo',    desc: 'Productos y precios actuales',    icon: '🗂️' },
        ].map(l => (
          <Link
            key={l.href}
            href={l.href}
            className="bg-white border border-[#E2E8F0] rounded-xl p-5 hover:border-emerald-200 hover:bg-emerald-50/40 transition-colors flex items-start gap-4"
          >
            <span className="text-2xl mt-0.5 flex-shrink-0">{l.icon}</span>
            <div>
              <div className="font-semibold text-[#0F172A] text-sm">{l.label}</div>
              <div className="text-xs text-[#64748B] mt-0.5">{l.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent solicitudes */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="font-semibold text-[#0F172A] text-sm">Solicitudes recientes</h2>
          <Link href="/panel/solicitudes" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
            Ver todas
          </Link>
        </div>
        {recientes.length === 0 ? (
          <div className="p-12 text-center text-[#94A3B8] text-sm">Sin actividad todavía</div>
        ) : (
          <div>
            {recientes.map((s, i) => {
              const cfg = ESTADO_CONFIG[s.estado as keyof typeof ESTADO_CONFIG] ?? ESTADO_CONFIG.cancelada
              const ubicacion = s.ubicacion as { provincia?: string; ciudad?: string }
              return (
                <Link
                  key={s.id}
                  href={`/panel/solicitudes/${s.id}`}
                  className={`flex items-center gap-4 px-6 py-3.5 hover:bg-[#F8FAFC] transition-colors ${
                    i < recientes.length - 1 ? 'border-b border-[#F1F5F9]' : ''
                  }`}
                >
                  <span className="text-xl w-6 text-center flex-shrink-0">{TRABAJO_EMOJI[s.trabajo_tipo] ?? '🔨'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#0F172A] capitalize">{s.trabajo_tipo}</div>
                    <div className="text-xs text-[#94A3B8]">
                      {ubicacion.ciudad ?? ubicacion.provincia ?? '—'} · {s.id.slice(0, 8)}…
                    </div>
                  </div>
                  <div className="text-xs text-[#94A3B8] hidden md:block flex-shrink-0">
                    {formatearFechaEC(new Date(s.created_at))}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border flex-shrink-0 ${cfg.clase}`}>
                    {cfg.label}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

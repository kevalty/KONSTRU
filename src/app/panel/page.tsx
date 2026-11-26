export const dynamic = 'force-dynamic'

import { listarSolicitudes } from '@/server/db/repositorios'
import Link from 'next/link'

export default async function PanelHome() {
  const solicitudes = await listarSolicitudes()
  const nuevas = solicitudes.filter(s => s.estado === 'nueva').length
  const enRevision = solicitudes.filter(s => s.estado === 'en_revision').length
  const confirmadas = solicitudes.filter(s => s.estado === 'confirmada').length
  const recientes = solicitudes.slice(0, 5)

  const TRABAJO_EMOJI: Record<string, string> = {
    piso: '🏠', paredes: '🧱', bano: '🚿', techo: '🏗️', fachada: '🏢', impermeabilizacion: '💧',
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Resumen de actividad de KONSTRU</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total solicitudes', valor: solicitudes.length, emoji: '📋', color: 'bg-slate-900 text-white' },
          { label: 'Nuevas', valor: nuevas, emoji: '🔵', color: 'bg-blue-50 border border-blue-200 text-blue-900' },
          { label: 'En revisión', valor: enRevision, emoji: '🟡', color: 'bg-amber-50 border border-amber-200 text-amber-900' },
          { label: 'Confirmadas', valor: confirmadas, emoji: '🟢', color: 'bg-emerald-50 border border-emerald-200 text-emerald-900' },
        ].map(k => (
          <div key={k.label} className={`rounded-2xl p-5 ${k.color}`}>
            <div className="text-3xl font-black">{k.valor}</div>
            <div className="text-sm mt-1 opacity-70">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { href: '/panel/solicitudes', label: 'Ver solicitudes', desc: 'Revisar cotizaciones pendientes', emoji: '📋' },
          { href: '/panel/pedidos', label: 'Ver pedidos', desc: 'Estado de órdenes a ferreterías', emoji: '📦' },
          { href: '/panel/catalogo', label: 'Ver catálogo', desc: 'Productos y precios actuales', emoji: '🗂️' },
        ].map(l => (
          <Link
            key={l.href}
            href={l.href}
            className="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 transition-all hover:shadow-sm flex items-start gap-4"
          >
            <span className="text-3xl">{l.emoji}</span>
            <div>
              <div className="font-bold text-slate-900">{l.label}</div>
              <div className="text-sm text-slate-500 mt-0.5">{l.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Solicitudes recientes</h2>
          <Link href="/panel/solicitudes" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            Ver todas →
          </Link>
        </div>
        {recientes.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Sin actividad todavía</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recientes.map(s => (
              <Link
                key={s.id}
                href={`/panel/solicitudes/${s.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
              >
                <span className="text-xl">{TRABAJO_EMOJI[s.trabajo_tipo] ?? '🔨'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 capitalize truncate">{s.trabajo_tipo}</div>
                  <div className="text-xs text-slate-400">
                    {(s.ubicacion as { provincia?: string }).provincia ?? '—'} · {s.id.slice(0, 8)}…
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  s.estado === 'nueva' ? 'bg-blue-100 text-blue-700' :
                  s.estado === 'confirmada' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {s.estado.replace('_', ' ')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

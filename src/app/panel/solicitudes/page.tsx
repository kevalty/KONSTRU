import { listarSolicitudes } from '@/server/db/repositorios'
import Link from 'next/link'
import { formatearFechaEC } from '@/lib/zona-horaria'

const COLORES_ESTADO = {
  nueva: 'bg-blue-100 text-blue-800',
  en_revision: 'bg-amber-100 text-amber-800',
  confirmada: 'bg-green-100 text-green-800',
  cancelada: 'bg-slate-100 text-slate-500',
}

export default async function PaginaSolicitudes() {
  const solicitudes = await listarSolicitudes()

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">Solicitudes</h1>

      {solicitudes.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
          No hay solicitudes todavía
        </div>
      )}

      <div className="space-y-3">
        {solicitudes.map(s => (
          <Link
            key={s.id}
            href={`/panel/solicitudes/${s.id}`}
            className="block bg-white rounded-xl border border-slate-200 hover:border-emerald-400 p-4 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-800 capitalize">{s.trabajo_tipo}</span>
                <span className="text-slate-400 text-sm ml-2">{s.id.slice(0, 8)}…</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${COLORES_ESTADO[s.estado]}`}>
                {s.estado.replace('_', ' ')}
              </span>
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {(s.ubicacion as { provincia?: string }).provincia ?? 'Sin ubicación'} ·{' '}
              {formatearFechaEC(new Date(s.created_at))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

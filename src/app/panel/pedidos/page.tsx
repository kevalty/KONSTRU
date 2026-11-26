export const dynamic = 'force-dynamic'

import { crearClienteAdmin } from '@/server/db/client'
import Link from 'next/link'
import { formatearFechaEC } from '@/lib/zona-horaria'
import type { FilaPedido } from '@/server/db/repositorios'

async function listarTodosPedidos(): Promise<FilaPedido[]> {
  const db = crearClienteAdmin()
  const { data } = await db.from('pedidos').select().order('created_at', { ascending: false })
  return (data ?? []) as FilaPedido[]
}

const ESTADO_CONFIG: Record<string, { clase: string; label: string }> = {
  borrador:   { clase: 'bg-slate-50 text-slate-600 border-slate-100',      label: 'Borrador' },
  enviado:    { clase: 'bg-blue-50 text-blue-700 border-blue-100',          label: 'Enviado' },
  en_proceso: { clase: 'bg-amber-50 text-amber-700 border-amber-100',       label: 'En proceso' },
  completado: { clase: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Completado' },
  cancelado:  { clase: 'bg-red-50 text-red-700 border-red-100',             label: 'Cancelado' },
}

export default async function PaginaPedidos() {
  const pedidos = await listarTodosPedidos()

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-[#0F172A] tracking-tight">Pedidos</h1>
        <p className="text-sm text-[#64748B] mt-0.5">Órdenes enviadas a ferreterías</p>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
          <div className="text-3xl mb-3">📦</div>
          <p className="text-sm font-medium text-[#64748B]">No hay pedidos todavía</p>
          <p className="text-xs text-[#94A3B8] mt-1">Los pedidos aparecerán cuando confirmes solicitudes</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-4 gap-4 px-6 py-3 border-b border-[#E2E8F0] text-xs font-medium text-[#94A3B8]">
            <span>Código</span>
            <span>Estado</span>
            <span>Fecha</span>
            <span>Solicitud</span>
          </div>
          <div>
            {pedidos.map((p, i) => {
              const cfg = ESTADO_CONFIG[p.estado] ?? ESTADO_CONFIG.borrador
              return (
                <div
                  key={p.id}
                  className={`grid md:grid-cols-4 gap-2 md:gap-4 items-center px-6 py-3.5 ${
                    i < pedidos.length - 1 ? 'border-b border-[#F1F5F9]' : ''
                  }`}
                >
                  <div className="font-mono font-medium text-sm text-[#0F172A]">{p.codigo_acceso}</div>
                  <div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${cfg.clase}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="text-sm text-[#94A3B8]">
                    {formatearFechaEC(new Date(p.created_at))}
                  </div>
                  <div>
                    <Link
                      href={`/panel/solicitudes/${p.solicitud_id}`}
                      className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      Ver solicitud →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

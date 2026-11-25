import { crearClienteAdmin } from '@/server/db/client'
import Link from 'next/link'
import { formatearFechaEC } from '@/lib/zona-horaria'
import type { FilaPedido } from '@/server/db/repositorios'

async function listarTodosPedidos(): Promise<FilaPedido[]> {
  const db = crearClienteAdmin()
  const { data } = await db.from('pedidos').select().order('created_at', { ascending: false })
  return (data ?? []) as FilaPedido[]
}

const COLORES_ESTADO_PEDIDO = {
  borrador: 'bg-slate-100 text-slate-600',
  enviado: 'bg-blue-100 text-blue-800',
  en_proceso: 'bg-amber-100 text-amber-800',
  completado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-700',
}

export default async function PaginaPedidos() {
  const pedidos = await listarTodosPedidos()

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">Pedidos</h1>
      {pedidos.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
          No hay pedidos todavía
        </div>
      )}
      <div className="space-y-3">
        {pedidos.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-800">{p.codigo_acceso}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${COLORES_ESTADO_PEDIDO[p.estado]}`}>
                {p.estado.replace('_', ' ')}
              </span>
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {formatearFechaEC(new Date(p.created_at))}
            </div>
            <Link
              href={`/panel/solicitudes/${p.solicitud_id}`}
              className="text-sm text-emerald-600 hover:underline mt-1 block"
            >
              Ver solicitud →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

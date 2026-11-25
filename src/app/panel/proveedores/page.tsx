export const dynamic = 'force-dynamic'

import { listarProveedores } from '@/server/db/repositorios'

export default async function PaginaProveedores() {
  const proveedores = await listarProveedores()

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">Proveedores</h1>
      {proveedores.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
          No hay proveedores registrados todavía
        </div>
      )}
      <div className="space-y-3">
        {proveedores.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="font-semibold text-slate-800">{p.nombre}</div>
            <div className="text-sm text-slate-500 mt-1 space-x-3">
              {p.ciudad && <span>📍 {p.ciudad}</span>}
              {p.telefono && <span>📞 {p.telefono}</span>}
              {p.email && <span>✉️ {p.email}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

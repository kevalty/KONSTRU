import { RECETAS } from '@/recetas'

export default function PaginaRecetas() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">Recetas de materiales</h1>
      <div className="space-y-4">
        {RECETAS.map((receta) => {
          const r = receta as { id: string; nombre: string; tipo_trabajo: string; version: number; items: Array<{ producto_categoria: string; formula: string; unidad: string; desperdicio: number; gama: string[] }> }
          return (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-slate-800">{r.nombre}</h2>
                  <span className="text-xs text-slate-400 capitalize">{r.tipo_trabajo} · v{r.version}</span>
                </div>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">
                  {r.items.length} ítems
                </span>
              </div>
              <div className="space-y-1">
                {r.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-slate-500 py-1 border-b border-slate-50 last:border-0">
                    <span className="capitalize">{item.producto_categoria.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-slate-400">{item.formula} {item.unidad}</span>
                    <span className="text-slate-300">{Math.round(item.desperdicio * 100)}% desp.</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

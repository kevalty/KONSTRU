import { listarTodosProductos } from '@/server/db/repositorios'

const COLORES_GAMA = {
  economica: 'bg-green-100 text-green-800',
  media: 'bg-blue-100 text-blue-800',
  premium: 'bg-purple-100 text-purple-800',
}

export default async function PaginaCatalogo() {
  const productos = await listarTodosProductos()

  // Group by category
  const porCategoria = productos.reduce<Record<string, typeof productos>>((acc, p) => {
    if (!acc[p.categoria]) acc[p.categoria] = []
    acc[p.categoria].push(p)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">Catálogo de productos</h1>
        <span className="text-sm text-slate-500">{productos.length} productos</span>
      </div>

      {Object.keys(porCategoria).length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
          No hay productos. Importa el catálogo primero.
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(porCategoria).map(([categoria, items]) => (
          <div key={categoria}>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 capitalize">
              {categoria.replace(/_/g, ' ')}
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-2 text-slate-500 font-medium">Producto</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-medium">Gama</th>
                    <th className="text-right px-4 py-2 text-slate-500 font-medium">Precio</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-medium">Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(p => (
                    <tr key={p.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3 text-slate-800">{p.nombre}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COLORES_GAMA[p.gama]}`}>
                          {p.gama}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">${Number(p.precio).toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-500">{p.unidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

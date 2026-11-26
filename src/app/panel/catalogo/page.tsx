export const dynamic = 'force-dynamic'

import { listarTodosProductos } from '@/server/db/repositorios'

const COLORES_GAMA: Record<string, string> = {
  economica: 'bg-blue-50 text-blue-700 border-blue-100',
  media:     'bg-purple-50 text-purple-700 border-purple-100',
  premium:   'bg-amber-50 text-amber-700 border-amber-100',
}

export default async function PaginaCatalogo() {
  const productos = await listarTodosProductos()

  const porCategoria = productos.reduce<Record<string, typeof productos>>((acc, p) => {
    if (!acc[p.categoria]) acc[p.categoria] = []
    acc[p.categoria].push(p)
    return acc
  }, {})

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[#0F172A] tracking-tight">Catálogo</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Productos y precios disponibles</p>
        </div>
        <span className="text-sm text-[#94A3B8]">{productos.length} productos</span>
      </div>

      {Object.keys(porCategoria).length === 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
          <p className="text-sm text-[#64748B]">No hay productos. Importa el catálogo primero.</p>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(porCategoria).map(([categoria, items]) => (
          <div key={categoria}>
            <h2 className="text-xs font-medium text-[#94A3B8] mb-3 capitalize">
              {categoria.replace(/_/g, ' ')}
            </h2>
            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#94A3B8]">Producto</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#94A3B8]">Gama</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-[#94A3B8]">Precio</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#94A3B8]">Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p, i) => (
                    <tr key={p.id} className={i < items.length - 1 ? 'border-b border-[#F1F5F9]' : ''}>
                      <td className="px-5 py-3 text-sm text-[#0F172A]">{p.nombre}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${COLORES_GAMA[p.gama] ?? 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                          {p.gama}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-[#0F172A]">${Number(p.precio).toFixed(2)}</td>
                      <td className="px-5 py-3 text-[#64748B]">{p.unidad}</td>
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

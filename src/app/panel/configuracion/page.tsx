import { crearClienteAdmin } from '@/server/db/client'

async function obtenerConfiguracion(): Promise<Array<{ clave: string; valor: string; updated_at: string }>> {
  const db = crearClienteAdmin()
  const { data } = await db.from('configuracion').select().order('clave')
  return (data ?? []) as Array<{ clave: string; valor: string; updated_at: string }>
}

const DESCRIPCIONES: Record<string, string> = {
  iva_porcentaje: 'IVA (porcentaje decimal, ej: 0.15 = 15%)',
  cotizacion_validez_dias: 'Días de validez de las cotizaciones',
  chat_max_tokens: 'Tokens máximos por respuesta del chatbot',
  version_recetas: 'Versión activa de las recetas de materiales',
}

export default async function PaginaConfiguracion() {
  const configs = await obtenerConfiguracion()

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">Configuración</h1>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Clave</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Valor</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium hidden md:table-cell">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {configs.map(c => (
              <tr key={c.clave} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-mono text-slate-700">{c.clave}</td>
                <td className="px-4 py-3 font-mono text-emerald-700 font-semibold">{c.valor}</td>
                <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{DESCRIPCIONES[c.clave] ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-3">
        Para modificar estos valores, actualízalos directamente en la base de datos o contacta al administrador.
      </p>
    </div>
  )
}

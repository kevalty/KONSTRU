'use client'
import { useState } from 'react'
import type { FilaItemPedido } from '@/server/db/repositorios'
import type { EstadoItemPedido } from '@/domain/compartido/tipos'

interface Props {
  pedidoId: string
  items: FilaItemPedido[]
  estadoPedido: string
}

export function VistaOrden({ pedidoId, items: itemsIniciales, estadoPedido }: Props) {
  const [items, setItems] = useState(itemsIniciales)
  const [enviando, setEnviando] = useState(false)
  const [completado, setCompletado] = useState(estadoPedido === 'completado')

  async function marcarItem(itemId: string, estado: EstadoItemPedido, notas?: string) {
    const res = await fetch('/api/ordenes/marcar-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, estado, notas, pedidoId }),
    })
    if (res.ok) {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, estado, notas_ferreteria: notas ?? i.notas_ferreteria } : i))
    }
  }

  async function enviarLista() {
    setEnviando(true)
    const res = await fetch('/api/ordenes/completar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedidoId }),
    })
    if (res.ok) setCompletado(true)
    setEnviando(false)
  }

  const todosResueltos = items.every(i => i.estado === 'disponible' || i.estado === 'sin_stock' || i.estado === 'sustitucion_pendiente')
  const hayPendientes = items.some(i => i.estado === 'pendiente')

  if (completado) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-slate-800">Lista enviada</h2>
        <p className="text-slate-500 mt-2">El asesor ha sido notificado. Gracias.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
      {items.map(item => (
        <ItemOrdenCard key={item.id} item={item} onMarcar={marcarItem} />
      ))}

      {!hayPendientes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          Todos los artículos marcados. Revisa y envía la lista completa.
        </div>
      )}

      <button
        onClick={enviarLista}
        disabled={!todosResueltos || enviando}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-xl transition-colors min-h-[44px]"
      >
        {enviando ? 'Enviando...' : `Enviar lista completa (${items.length} artículos)`}
      </button>
    </div>
  )
}

function ItemOrdenCard({ item, onMarcar }: { item: FilaItemPedido; onMarcar: (id: string, estado: EstadoItemPedido, notas?: string) => void }) {
  const [notas, setNotas] = useState(item.notas_ferreteria ?? '')

  const colores: Record<string, string> = {
    pendiente: 'border-slate-200',
    disponible: 'border-green-400 bg-green-50',
    sin_stock: 'border-red-300 bg-red-50',
    sustitucion_pendiente: 'border-amber-300 bg-amber-50',
  }

  return (
    <div className={`border-2 rounded-xl p-4 ${colores[item.estado] ?? 'border-slate-200'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium text-slate-800">{item.nombre_producto}</p>
          <p className="text-sm text-slate-500">{item.cantidad} {item.unidad}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          item.estado === 'disponible' ? 'bg-green-200 text-green-800' :
          item.estado === 'sin_stock' ? 'bg-red-200 text-red-800' :
          item.estado === 'sustitucion_pendiente' ? 'bg-amber-200 text-amber-800' :
          'bg-slate-100 text-slate-600'
        }`}>
          {item.estado === 'pendiente' ? 'Sin marcar' :
           item.estado === 'disponible' ? 'Disponible' :
           item.estado === 'sin_stock' ? 'Sin stock' : 'Sustitución'}
        </span>
      </div>

      {item.estado === 'pendiente' && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onMarcar(item.id, 'disponible')}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 rounded-lg min-h-[44px]"
          >
            ✓ Disponible
          </button>
          <button
            onClick={() => onMarcar(item.id, 'sin_stock', notas || undefined)}
            className="flex-1 bg-red-400 hover:bg-red-500 text-white text-sm font-semibold py-2 rounded-lg min-h-[44px]"
          >
            ✗ Sin stock
          </button>
        </div>
      )}

      {item.estado === 'sin_stock' && (
        <div className="mt-2 space-y-2">
          <input
            type="text"
            placeholder="Notas (sustituto disponible, etc.)"
            value={notas}
            onChange={e => setNotas(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm min-h-[44px]"
          />
          <button
            onClick={() => onMarcar(item.id, 'sustitucion_pendiente', notas)}
            className="w-full bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold py-2 rounded-lg min-h-[44px]"
          >
            Proponer sustitución
          </button>
        </div>
      )}
    </div>
  )
}

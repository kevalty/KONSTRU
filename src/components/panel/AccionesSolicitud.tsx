'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FilaProveedor, FilaCotizacion } from '@/server/db/repositorios'
import type { EstadoSolicitud, Gama } from '@/domain/compartido/tipos'

interface Props {
  solicitudId: string
  estadoActual: EstadoSolicitud
  proveedores: FilaProveedor[]
  cotizaciones: FilaCotizacion[]
}

export function AccionesSolicitud({ solicitudId, estadoActual, proveedores, cotizaciones }: Props) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [gamaSeleccionada, setGamaSeleccionada] = useState<Gama>('media')
  const [proveedorId, setProveedorId] = useState(proveedores[0]?.id ?? '')
  const [error, setError] = useState('')

  async function accion(tipo: 'confirmar' | 'cancelar' | 'crear-pedido') {
    setCargando(true)
    setError('')
    try {
      const res = await fetch('/api/ordenes/accion-solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solicitudId, tipo, gamaSeleccionada, proveedorId }),
      })
      if (!res.ok) {
        const e = await res.json() as { error?: string }
        throw new Error(e.error ?? 'Error al procesar')
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setCargando(false)
    }
  }

  if (estadoActual === 'cancelada' || estadoActual === 'confirmada') {
    return (
      <div className={`rounded-xl p-4 text-sm font-medium ${estadoActual === 'confirmada' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
        Solicitud {estadoActual}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
      <h3 className="font-semibold text-slate-700">Acciones</h3>

      {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</div>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-slate-500 block mb-1">Gama para pedido</label>
          <select
            value={gamaSeleccionada}
            onChange={e => setGamaSeleccionada(e.target.value as Gama)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm min-h-[44px]"
          >
            {cotizaciones.map(c => <option key={c.id} value={c.gama}>{c.gama}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-500 block mb-1">Proveedor</label>
          <select
            value={proveedorId}
            onChange={e => setProveedorId(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm min-h-[44px]"
          >
            {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => accion('confirmar')}
          disabled={cargando}
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white font-semibold py-3 rounded-xl min-h-[44px]"
        >
          Confirmar
        </button>
        <button
          onClick={() => accion('crear-pedido')}
          disabled={cargando || !proveedorId}
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 text-white font-semibold py-3 rounded-xl min-h-[44px]"
        >
          Crear pedido
        </button>
        <button
          onClick={() => accion('cancelar')}
          disabled={cargando}
          className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-3 rounded-xl min-h-[44px]"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

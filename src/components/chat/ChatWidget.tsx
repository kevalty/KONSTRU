'use client'
import { useState, useRef, useEffect } from 'react'
import { EnviarMensaje } from './EnviarMensaje'

interface Mensaje {
  id: string
  rol: 'usuario' | 'asistente'
  contenido: string
}

const BIENVENIDA: Mensaje = {
  id: '0',
  rol: 'asistente',
  contenido: '¡Hola! Soy Coti, tu asistente para cotizaciones de materiales. ¿En qué te puedo ayudar hoy? Por ejemplo: "Quiero poner piso en mi sala"',
}

export function ChatWidget() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([BIENVENIDA])
  const [cargando, setCargando] = useState(false)
  const [sessionId] = useState(() => Math.random().toString(36).slice(2) + Date.now().toString(36))
  const [estadoChat, setEstadoChat] = useState<Record<string, unknown>>({ medidas: {}, confirmado: false })
  const [cotizacionLista, setCotizacionLista] = useState(false)
  const finRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function enviar(texto: string) {
    if (!texto.trim() || cargando) return

    const msgUsuario: Mensaje = { id: crypto.randomUUID(), rol: 'usuario', contenido: texto }
    setMensajes(prev => [...prev, msgUsuario])
    setCargando(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          mensaje: texto,
          historial: mensajes.map(m => ({ rol: m.rol, contenido: m.contenido })),
          estado: estadoChat,
        }),
      })

      if (!res.ok) throw new Error('Error al procesar tu mensaje')
      const data = await res.json() as { mensaje: string; estado: Record<string, unknown>; cotizacionLista?: boolean }

      setEstadoChat(data.estado)
      setMensajes(prev => [...prev, { id: crypto.randomUUID(), rol: 'asistente', contenido: data.mensaje }])
      if (data.cotizacionLista) setCotizacionLista(true)
    } catch {
      setMensajes(prev => [...prev, {
        id: crypto.randomUUID(),
        rol: 'asistente',
        contenido: 'Ocurrió un error. Por favor intenta de nuevo.',
      }])
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {mensajes.map(m => (
          <div key={m.id} className={`flex ${m.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
            <div className={m.rol === 'usuario' ? 'burbuja-usuario' : 'burbuja-asistente'}>
              {m.contenido}
            </div>
          </div>
        ))}
        {cargando && (
          <div className="flex justify-start">
            <div className="burbuja-asistente">
              <span className="animate-pulse">Escribiendo...</span>
            </div>
          </div>
        )}
        {cotizacionLista && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <p className="text-emerald-700 font-semibold">¡Cotizaciones listas!</p>
            <p className="text-sm text-emerald-600 mt-1">Te las enviamos por WhatsApp. Un asesor las revisará pronto.</p>
          </div>
        )}
        <div ref={finRef} />
      </div>
      <EnviarMensaje onEnviar={enviar} deshabilitado={cargando || cotizacionLista} />
    </div>
  )
}

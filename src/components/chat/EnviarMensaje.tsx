'use client'
import { useState, type FormEvent } from 'react'

interface Props {
  onEnviar: (texto: string) => void
  deshabilitado?: boolean
}

export function EnviarMensaje({ onEnviar, deshabilitado }: Props) {
  const [texto, setTexto] = useState('')

  function manejarEnvio(e: FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    onEnviar(texto)
    setTexto('')
  }

  return (
    <form
      onSubmit={manejarEnvio}
      className="flex gap-2 px-4 py-3 bg-white border-t border-slate-200"
    >
      <input
        type="text"
        value={texto}
        onChange={e => setTexto(e.target.value)}
        placeholder={deshabilitado ? 'Conversación finalizada' : 'Escribe tu mensaje...'}
        disabled={deshabilitado}
        className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:bg-slate-100 min-h-[44px]"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={deshabilitado || !texto.trim()}
        className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white font-semibold px-5 py-3 rounded-xl transition-colors min-h-[44px] min-w-[80px]"
      >
        Enviar
      </button>
    </form>
  )
}

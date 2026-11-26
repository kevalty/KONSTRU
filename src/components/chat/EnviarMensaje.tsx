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
      className="flex gap-2 px-4 py-3 bg-white border-t border-[#E2E8F0] flex-shrink-0"
    >
      <input
        type="text"
        value={texto}
        onChange={e => setTexto(e.target.value)}
        placeholder={deshabilitado ? 'Conversación finalizada' : 'Escribe tu mensaje...'}
        disabled={deshabilitado}
        className="flex-1 border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-[#F8FAFC] min-h-[44px]"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={deshabilitado || !texto.trim()}
        className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] disabled:cursor-not-allowed text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors min-h-[44px]"
      >
        Enviar
      </button>
    </form>
  )
}

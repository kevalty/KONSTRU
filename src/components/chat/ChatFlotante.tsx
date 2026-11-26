'use client'
import { useState, useEffect } from 'react'
import { ChatWidget } from './ChatWidget'

function IconChat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  )
}

function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

export function ChatFlotante() {
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    const abrirSiHash = () => {
      if (window.location.hash === '#chat') {
        setAbierto(true)
        history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    }
    abrirSiHash()
    window.addEventListener('hashchange', abrirSiHash)
    return () => window.removeEventListener('hashchange', abrirSiHash)
  }, [])

  return (
    <>
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          aria-label="Abrir chat con STEVE"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        >
          <IconChat />
        </button>
      )}

      {abierto && (
        <div
          className="fixed z-50 flex flex-col bg-white overflow-hidden
            inset-0
            md:inset-auto md:bottom-6 md:right-6 md:w-[380px] md:h-[600px] md:rounded-2xl md:shadow-2xl md:border md:border-[#E2E8F0]"
          style={{ overscrollBehavior: 'contain' }}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E2E8F0] flex-shrink-0 md:rounded-t-2xl">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-base">🤖</div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-[#0F172A]">STEVE</div>
              <div className="text-xs text-[#64748B]">IA de KONSTRU · En línea</div>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="text-[#94A3B8] hover:text-[#0F172A] transition-colors p-1.5 rounded-lg hover:bg-[#F1F5F9]"
            >
              <IconX />
            </button>
          </div>

          <ChatWidget />
        </div>
      )}
    </>
  )
}

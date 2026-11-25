import Link from 'next/link'
import { ChatWidget } from '@/components/chat/ChatWidget'

export const metadata = { title: 'Nueva cotización – Cotizador' }

export default function PaginaChat() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center gap-3">
        <Link href="/" className="text-slate-400 text-sm">← Inicio</Link>
        <span className="font-semibold text-slate-700">Nueva cotización</span>
      </header>
      <ChatWidget />
    </main>
  )
}

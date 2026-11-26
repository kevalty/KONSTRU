import Link from 'next/link'
import { ChatWidget } from '@/components/chat/ChatWidget'

export const metadata = { title: 'STEVE – Cotizador KONSTRU' }

export default function PaginaChat() {
  return (
    <main className="h-[100dvh] flex flex-col bg-[#F8FAFC]">
      <header className="px-4 py-3 bg-white border-b border-[#E2E8F0] flex items-center gap-3 flex-shrink-0">
        <Link href="/" className="text-[#64748B] hover:text-[#0F172A] text-sm transition-colors flex-shrink-0">
          ← Inicio
        </Link>
        <div className="flex items-center gap-2 flex-1 justify-center">
          <div className="relative flex-shrink-0">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-sm">🤖</div>
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <span className="font-semibold text-sm text-[#0F172A]">STEVE</span>
          <span className="text-xs text-[#64748B]">· IA de KONSTRU</span>
        </div>
        <div className="w-14 flex-shrink-0" />
      </header>
      <ChatWidget />
    </main>
  )
}

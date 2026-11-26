'use client'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function salir() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={salir}
      className="flex items-center gap-2.5 text-sm text-[#64748B] hover:text-[#F8FAFC] transition-colors py-1 w-full text-left"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Cerrar sesión
    </button>
  )
}

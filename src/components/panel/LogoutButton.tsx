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
      className="w-full text-left text-sm text-slate-500 hover:text-red-400 transition-colors py-1 flex items-center gap-2"
    >
      <span>🚪</span> Cerrar sesión
    </button>
  )
}

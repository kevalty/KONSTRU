'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function PaginaLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError('')

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      setCargando(false)
      return
    }

    router.push('/panel')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: dark brand panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0F1117] flex-col justify-between p-12 border-r border-[#1E293B]">
        <span className="font-black text-xl tracking-tight text-white">
          KON<span className="text-emerald-500">STRU</span>
        </span>
        <div>
          <p className="text-[#334155] text-sm leading-relaxed max-w-xs">
            Plataforma de cotización y gestión de materiales de construcción para Ecuador.
          </p>
        </div>
        <p className="text-[#1E293B] text-xs select-none">© 2025 KONSTRU · Acceso restringido</p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <span className="font-black text-xl tracking-tight text-[#0F172A]">
              KON<span className="text-emerald-500">STRU</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-[22px] font-semibold text-[#0F172A] tracking-tight">Bienvenido</h1>
            <p className="text-sm text-[#64748B] mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={manejarEnvio} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nombre@empresa.com"
                className="w-full h-11 bg-white border border-[#E2E8F0] rounded-lg px-3.5 text-sm text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 bg-white border border-[#E2E8F0] rounded-lg px-3.5 text-sm text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-colors mt-1"
            >
              {cargando ? 'Verificando…' : 'Entrar al panel'}
            </button>
          </form>

          <p className="text-xs text-[#CBD5E1] text-center mt-8">
            Acceso restringido a personal autorizado
          </p>
        </div>
      </div>
    </div>
  )
}

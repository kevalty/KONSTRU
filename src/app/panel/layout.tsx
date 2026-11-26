import Link from 'next/link'
import { LogoutButton } from '@/components/panel/LogoutButton'

const NAV_ITEMS = [
  { href: '/panel/solicitudes', label: 'Solicitudes', emoji: '📋' },
  { href: '/panel/pedidos', label: 'Pedidos', emoji: '📦' },
  { href: '/panel/catalogo', label: 'Catálogo', emoji: '🗂️' },
  { href: '/panel/proveedores', label: 'Proveedores', emoji: '🏪' },
  { href: '/panel/recetas', label: 'Recetas', emoji: '📐' },
  { href: '/panel/configuracion', label: 'Config', emoji: '⚙️' },
]

export default function LayoutPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <nav className="bg-slate-900 text-white md:w-60 md:min-h-screen flex flex-col">
        <div className="px-5 py-5 border-b border-slate-800">
          <span className="font-black text-lg text-white">
            KON<span className="text-emerald-400">STRU</span>
          </span>
          <span className="text-xs text-slate-500 block mt-0.5">Panel de administración</span>
        </div>
        <ul className="flex md:flex-col overflow-x-auto md:overflow-visible py-2 flex-1">
          {NAV_ITEMS.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-5 py-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap min-h-[44px]"
              >
                <span className="text-base">{item.emoji}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="px-5 py-4 border-t border-slate-800">
          <LogoutButton />
        </div>
      </nav>
      <main className="flex-1 bg-slate-50 min-h-screen">{children}</main>
    </div>
  )
}

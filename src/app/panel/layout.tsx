import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/panel/solicitudes', label: 'Solicitudes', emoji: '📋' },
  { href: '/panel/pedidos', label: 'Pedidos', emoji: '📦' },
  { href: '/panel/catalogo', label: 'Catálogo', emoji: '🗂️' },
  { href: '/panel/proveedores', label: 'Proveedores', emoji: '🏪' },
  { href: '/panel/configuracion', label: 'Config', emoji: '⚙️' },
]

export default function LayoutPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <nav className="bg-slate-800 text-white md:w-56 md:min-h-screen">
        <div className="px-4 py-4 border-b border-slate-700">
          <span className="font-bold text-emerald-400">Cotizador</span>
          <span className="text-xs text-slate-400 ml-2">Panel</span>
        </div>
        <ul className="flex md:flex-col overflow-x-auto md:overflow-visible py-2">
          {NAV_ITEMS.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-700 transition-colors whitespace-nowrap min-h-[44px]"
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 bg-slate-50 p-4 md:p-6">{children}</main>
    </div>
  )
}

import { SidebarNav } from '@/components/panel/SidebarNav'
import { LogoutButton } from '@/components/panel/LogoutButton'

export default function LayoutPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="bg-[#0F1117] flex flex-col md:w-[260px] md:min-h-screen md:flex-shrink-0 border-b md:border-b-0 md:border-r border-[#1E293B]">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#1E293B] flex-shrink-0">
          <span className="font-black text-[18px] tracking-tight text-white leading-none">
            KON<span className="text-emerald-500">STRU</span>
          </span>
          <p className="text-[11px] text-[#475569] mt-1 tracking-wide">Panel de administración</p>
        </div>

        {/* Nav */}
        <div className="flex md:flex-col py-3 flex-1 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden">
          <SidebarNav />
        </div>

        {/* Footer — hidden on mobile */}
        <div className="hidden md:block px-6 py-4 border-t border-[#1E293B] flex-shrink-0">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 bg-[#F8FAFC] min-h-screen">
        {children}
      </main>
    </div>
  )
}

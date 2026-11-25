import Link from 'next/link'

export default function PaginaInicio() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-4 py-4 border-b border-slate-200 bg-white">
        <span className="font-bold text-emerald-600 text-xl">Cotizador</span>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center gap-6">
        <h1 className="text-3xl font-bold text-slate-900 max-w-sm leading-tight">
          Cotizaciones de materiales para tu obra
        </h1>
        <p className="text-slate-600 max-w-xs">
          Dinos qué quieres construir o remodelar y en minutos tienes 3 opciones de precio: económica, media y premium.
        </p>
        <Link
          href="/chat"
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors min-h-[44px] flex items-center"
        >
          Comenzar cotización
        </Link>
      </section>

      <section className="px-4 pb-16 grid gap-4 max-w-md mx-auto w-full">
        {[
          { titulo: 'Chat inteligente', desc: 'Cuéntanos tu proyecto y el chat recopila todo lo necesario.' },
          { titulo: '3 opciones de precio', desc: 'Económica, media y premium con materiales reales.' },
          { titulo: 'Para toda Ecuador', desc: 'Ajustamos los materiales según el clima de tu región.' },
        ].map(c => (
          <div key={c.titulo} className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-800">{c.titulo}</h3>
            <p className="text-sm text-slate-500 mt-1">{c.desc}</p>
          </div>
        ))}
      </section>

      <footer className="px-4 py-4 text-center text-xs text-slate-400 border-t border-slate-100">
        Estimaciones de materiales. No incluye mano de obra ni instalación.
      </footer>
    </main>
  )
}

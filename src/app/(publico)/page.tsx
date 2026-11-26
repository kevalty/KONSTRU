import Link from 'next/link'

const PASOS = [
  {
    numero: '01',
    icono: '💬',
    titulo: 'Habla con STEVE',
    desc: 'Cuéntale a STEVE qué quieres construir o remodelar. Él te guía paso a paso.',
  },
  {
    numero: '02',
    icono: '⚡',
    titulo: 'STEVE calcula',
    desc: 'En segundos genera 3 cotizaciones ajustadas al clima de tu provincia.',
  },
  {
    numero: '03',
    icono: '📲',
    titulo: 'Recibe tu cotización',
    desc: 'Un asesor revisa y te confirma los precios por WhatsApp.',
  },
]

const FEATURES = [
  { icono: '🌎', titulo: 'Costa, Sierra y Oriente', desc: 'Materiales ajustados al clima de tu zona para mayor durabilidad.' },
  { icono: '💰', titulo: '3 opciones de precio', desc: 'Económica, media y premium con materiales reales de ferreterías.' },
  { icono: '✅', titulo: 'Asesor personal', desc: 'Un profesional revisa cada cotización antes de enviártela.' },
  { icono: '⚡', titulo: 'En minutos', desc: 'De la idea a tu cotización en menos de 5 minutos.' },
]

export default function PaginaInicio() {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight text-white">
            KON<span className="text-emerald-400">STRU</span>
          </span>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a>
            <a href="#beneficios" className="hover:text-white transition-colors">Beneficios</a>
          </nav>
          <Link
            href="/chat"
            className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Cotizar ahora
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 opacity-90" />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">Ecuador · Costa, Sierra y Oriente</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
              Cotiza tus materiales<br />
              <span className="text-emerald-400">en minutos</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl mb-8 max-w-lg">
              STEVE, tu asistente inteligente, recoge los datos de tu proyecto y genera
              <strong className="text-white"> 3 cotizaciones</strong> personalizadas al instante.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link
                href="/chat"
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                Cotizar con STEVE
                <span className="text-xl">→</span>
              </Link>
              <a
                href="#como-funciona"
                className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors flex items-center justify-center"
              >
                Ver cómo funciona
              </a>
            </div>
          </div>

          {/* STEVE card */}
          <div className="flex-shrink-0">
            <div className="relative w-64 h-72 md:w-80 md:h-96">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-3xl border border-emerald-500/20" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                {/* Placeholder para el dibujo 2D de STEVE */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-7xl md:text-8xl">
                  🤖
                </div>
                <div className="bg-slate-800/80 rounded-2xl px-4 py-3 border border-slate-700 max-w-[200px]">
                  <p className="text-sm text-slate-300 text-center">
                    "Hola, soy <strong className="text-emerald-400">STEVE</strong>. ¿Qué vas a construir hoy?"
                  </p>
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-3 gap-4">
            {[
              { valor: '3', label: 'Cotizaciones al instante' },
              { valor: '24', label: 'Provincias del Ecuador' },
              { valor: '5min', label: 'Tiempo promedio' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-black text-emerald-400">{s.valor}</div>
                <div className="text-xs md:text-sm text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
              Así de fácil funciona
            </h2>
            <p className="text-slate-500 text-lg">Tres pasos y tienes tus cotizaciones listas</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PASOS.map((paso, i) => (
              <div key={paso.numero} className="relative flex flex-col items-center text-center gap-4">
                {i < PASOS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-emerald-200 to-transparent" />
                )}
                <div className="relative w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
                  <span className="text-3xl">{paso.icono}</span>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{paso.titulo}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              Probar con STEVE <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Tipos de trabajo ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-center text-2xl md:text-3xl font-black text-slate-900 mb-10">
            ¿Qué puedes cotizar?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { emoji: '🏠', nombre: 'Piso' },
              { emoji: '🧱', nombre: 'Paredes' },
              { emoji: '🚿', nombre: 'Baño' },
              { emoji: '🏗️', nombre: 'Techo' },
              { emoji: '🏢', nombre: 'Fachada' },
              { emoji: '💧', nombre: 'Impermeabilización' },
            ].map(t => (
              <Link
                key={t.nombre}
                href="/chat"
                className="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all hover:shadow-md hover:-translate-y-0.5 group"
              >
                <span className="text-4xl">{t.emoji}</span>
                <span className="font-semibold text-slate-700 group-hover:text-emerald-700">{t.nombre}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Beneficios ── */}
      <section id="beneficios" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
              Por qué elegir KONSTRU
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map(f => (
              <div key={f.titulo} className="flex gap-4 p-6 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {f.icono}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{f.titulo}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-500">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            ¿Listo para cotizar?
          </h2>
          <p className="text-emerald-100 text-lg mb-8">
            Habla con STEVE y ten tus 3 cotizaciones en menos de 5 minutos. Gratis.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-black px-10 py-5 rounded-2xl text-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-700/20"
          >
            Cotizar ahora con STEVE →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-lg font-black text-white">
            KON<span className="text-emerald-400">STRU</span>
          </span>
          <p className="text-sm text-center">
            Estimaciones de materiales. No incluye mano de obra ni instalación.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/chat" className="hover:text-white transition-colors">Chat</Link>
            <Link href="/login" className="hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}

import Link from 'next/link'

const PASOS = [
  { titulo: 'Habla con STEVE', desc: 'Cuéntale qué quieres construir o remodelar. Él te guía paso a paso con preguntas simples.' },
  { titulo: 'STEVE calcula', desc: 'En segundos genera 3 cotizaciones — económica, media y premium — ajustadas al clima de tu provincia.' },
  { titulo: 'Recibe tu cotización', desc: 'Un asesor revisa los precios y te los confirma por WhatsApp. Sin sorpresas.' },
]

const TIPOS = [
  { emoji: '🏠', nombre: 'Piso' },
  { emoji: '🧱', nombre: 'Paredes' },
  { emoji: '🚿', nombre: 'Baño' },
  { emoji: '🏗️', nombre: 'Techo' },
  { emoji: '🏢', nombre: 'Fachada' },
  { emoji: '💧', nombre: 'Impermeabilización' },
]

export default function PaginaInicio() {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#0A0F1A]/95 backdrop-blur-sm border-b border-[#1E293B]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-black text-lg tracking-tight text-white">
            KON<span className="text-emerald-500">STRU</span>
          </span>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#64748B]">
            <a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a>
            <a href="#tipos" className="hover:text-white transition-colors">Qué puedes cotizar</a>
          </nav>
          <Link
            href="/chat"
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Cotizar ahora
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 bg-[#0A0F1A]">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-emerald-400 text-xs font-medium">Ecuador · Costa, Sierra y Oriente</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-semibold text-white leading-tight tracking-tight mb-6 max-w-3xl">
          Cotiza materiales de{' '}
          <span className="text-emerald-400">construcción</span>{' '}
          en minutos
        </h1>

        <p className="text-[#94A3B8] text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
          Habla con STEVE, nuestro asistente, y recibe 3 cotizaciones personalizadas con materiales reales de ferreterías.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <Link
            href="/chat"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-8 py-3.5 rounded-xl text-base transition-colors"
          >
            Cotizar con STEVE
          </Link>
          <a
            href="#como-funciona"
            className="border border-[#334155] hover:border-[#475569] text-[#94A3B8] hover:text-white font-medium px-8 py-3.5 rounded-xl text-base transition-colors"
          >
            Ver cómo funciona
          </a>
        </div>

        {/* Chat preview */}
        <div className="w-full max-w-sm bg-white border border-[#E2E8F0] rounded-2xl p-5 text-left shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm">🤖</div>
            <span className="font-semibold text-sm text-[#0F172A]">STEVE</span>
            <span className="ml-auto text-xs text-[#94A3B8]">IA de KONSTRU</span>
          </div>
          <div className="space-y-2">
            <div className="bg-[#F8FAFC] rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[#0F172A]">
              Hola, soy STEVE. ¿Qué quieres construir o remodelar hoy?
            </div>
            <div className="bg-emerald-500 rounded-xl rounded-tr-sm px-3.5 py-2.5 text-sm text-white ml-6">
              Quiero poner piso en mi sala, 20 m²
            </div>
            <div className="bg-[#F8FAFC] rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[#0F172A]">
              Perfecto. ¿En qué provincia está tu proyecto?
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-3 gap-4">
          {[
            { valor: '3', label: 'Cotizaciones al instante' },
            { valor: '24', label: 'Provincias del Ecuador' },
            { valor: '5 min', label: 'Tiempo promedio' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#0F172A]">{s.valor}</div>
              <div className="text-xs md:text-sm text-[#64748B] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#0F172A] tracking-tight mb-2">
              Cómo funciona
            </h2>
            <p className="text-[#64748B]">Tres pasos y tienes tus cotizaciones listas</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PASOS.map((paso, i) => (
              <div key={paso.titulo} className="flex flex-col gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white text-sm font-semibold flex items-center justify-center">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F172A] mb-1.5">{paso.titulo}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qué puedes cotizar */}
      <section id="tipos" className="py-16 bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-center text-2xl font-semibold text-[#0F172A] tracking-tight mb-10">
            ¿Qué puedes cotizar?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TIPOS.map(t => (
              <Link
                key={t.nombre}
                href="/chat"
                className="bg-white border border-[#E2E8F0] hover:border-emerald-200 hover:bg-emerald-50/50 rounded-xl px-5 py-4 flex items-center gap-3 transition-colors"
              >
                <span className="text-2xl">{t.emoji}</span>
                <span className="font-medium text-[#0F172A] text-sm">{t.nombre}</span>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-8 py-3.5 rounded-xl text-sm transition-colors"
            >
              Empezar con STEVE →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F1117] border-t border-[#1E293B] py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-black text-lg text-white tracking-tight">
            KON<span className="text-emerald-500">STRU</span>
          </span>
          <p className="text-xs text-[#475569] text-center">
            Estimaciones de materiales. No incluye mano de obra ni instalación.
          </p>
          <div className="flex gap-5 text-xs text-[#475569]">
            <Link href="/chat" className="hover:text-white transition-colors">Chat</Link>
            <Link href="/login" className="hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}

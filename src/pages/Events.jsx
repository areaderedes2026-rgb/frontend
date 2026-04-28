import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/ui/Container.jsx'
import { RevealOnScroll } from '../components/home/RevealOnScroll.jsx'
import { LinkButton } from '../components/ui/LinkButton.jsx'
import { ROUTES } from '../utils/constants.js'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1900&q=80'

const EVENT_TYPES = ['Todos', 'Institucional', 'Cultural', 'Deportivo', 'Comunitario']

const EVENTS = [
  {
    id: 'feria-gastronomica',
    title: 'Feria gastronomica local',
    type: 'Cultural',
    dateLabel: 'Sab 04 Jul · 18:30',
    place: 'Plaza principal',
    summary:
      'Food trucks, cocina regional y espectaculos en vivo para toda la familia.',
    imageUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
    featured: true,
  },
  {
    id: 'encuentro-areas',
    title: 'Encuentro abierto de areas municipales',
    type: 'Institucional',
    dateLabel: 'Mie 09 Jul · 10:00',
    place: 'Salon municipal',
    summary:
      'Espacio participativo para conocer programas, resolver dudas y presentar propuestas.',
    imageUrl:
      'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'carrera-trancas',
    title: 'Carrera ciudad de Trancas 10K',
    type: 'Deportivo',
    dateLabel: 'Dom 13 Jul · 08:00',
    place: 'Circuito urbano',
    summary:
      'Competencia y circuito recreativo de 3K con inscripcion gratuita y cupos limitados.',
    imageUrl:
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cine-barrio',
    title: 'Cine bajo las estrellas',
    type: 'Comunitario',
    dateLabel: 'Vie 18 Jul · 20:00',
    place: 'Barrio Centro',
    summary:
      'Jornada de cine al aire libre con propuestas para infancias y buffet comunitario.',
    imageUrl:
      'https://images.unsplash.com/photo-1489599809996-1324e8fdd849?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'festival-folklore',
    title: 'Festival municipal de folklore',
    type: 'Cultural',
    dateLabel: 'Sab 26 Jul · 19:30',
    place: 'Predio cultural',
    summary:
      'Noche de danza, musica en vivo y feria de artesanos con artistas locales.',
    imageUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'jornada-solidaria',
    title: 'Jornada solidaria de invierno',
    type: 'Comunitario',
    dateLabel: 'Sab 02 Ago · 09:00',
    place: 'Centro civico',
    summary:
      'Colecta de abrigo y actividades de acompanamiento para familias de la comunidad.',
    imageUrl:
      'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1200&q=80',
  },
]

const AGENDA = [
  { day: '04', month: 'JUL', title: 'Feria gastronomica local', time: '18:30', zone: 'Plaza principal' },
  { day: '09', month: 'JUL', title: 'Encuentro abierto de areas municipales', time: '10:00', zone: 'Salon municipal' },
  { day: '13', month: 'JUL', title: 'Carrera ciudad de Trancas 10K', time: '08:00', zone: 'Circuito urbano' },
  { day: '18', month: 'JUL', title: 'Cine bajo las estrellas', time: '20:00', zone: 'Barrio Centro' },
]

function EventTag({ children }) {
  return (
    <span className="inline-flex rounded-full border border-[#d8d5cd] bg-[#f8f7f3] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#3e434d]">
      {children}
    </span>
  )
}

export function Events() {
  const [typeFilter, setTypeFilter] = useState('Todos')
  const featured = EVENTS.find((event) => event.featured) || EVENTS[0]

  const visibleEvents = useMemo(() => {
    if (typeFilter === 'Todos') return EVENTS
    return EVENTS.filter((event) => event.type === typeFilter)
  }, [typeFilter])

  return (
    <section className="relative -mt-[calc(var(--navbar-h,5rem)+1.5rem)] overflow-hidden bg-linear-to-b from-[#f1eee8] via-[#f7f7f5] to-[#fcfcfa] pb-12 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_20%_-10%,rgba(56,189,248,0.12),transparent_65%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_100%_10%,rgba(15,23,42,0.12),transparent_70%)]" aria-hidden />

      <div className="relative min-h-[52dvh] overflow-hidden border-b border-white/10 bg-[#171b22] sm:min-h-[56dvh] lg:min-h-[58dvh]">
        <header className="relative overflow-hidden">
          <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/85 to-slate-900/35" />
          <Container className="relative z-10 flex min-h-[52dvh] flex-col justify-center pt-[calc(var(--navbar-h,5rem)+1rem)] pb-8 sm:min-h-[56dvh] sm:pt-[calc(var(--navbar-h,5rem)+1.5rem)] sm:pb-10 lg:min-h-[58dvh] lg:pb-12">
            <p className="hero-enter-eyebrow text-xs font-bold uppercase tracking-[0.22em] text-sky-200">
              Agenda municipal
            </p>
            <h1 className="hero-enter-title mt-3 max-w-4xl font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Eventos en Trancas
            </h1>
            <p className="hero-enter-subtitle mt-3 max-w-3xl text-sm leading-relaxed text-slate-100 sm:text-base">
              Conoce actividades culturales, deportivas e institucionales para toda la comunidad.
            </p>
            <div className="hero-enter-actions mt-5 flex flex-wrap gap-3">
              <a
                href="#proximos-eventos"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#171b22] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222831]"
              >
                Ver agenda
              </a>
              <LinkButton to={ROUTES.atencionCiudadano} variant="secondary">
                Consultar un evento
              </LinkButton>
            </div>
          </Container>
        </header>
      </div>

      <Container className="relative">
        <RevealOnScroll variant="slow">
          <article className="mt-8 overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
            <div className="grid gap-0 border-t border-[#ddd7ca] lg:grid-cols-12">
              <div className="border-b border-[#ddd7ca] p-5 sm:p-6 lg:col-span-7 lg:border-r lg:border-b-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-800">Evento destacado</p>
                <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#4b505a]">{featured.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <EventTag>{featured.type}</EventTag>
                  <EventTag>{featured.dateLabel}</EventTag>
                  <EventTag>{featured.place}</EventTag>
                </div>
              </div>
              <aside className="p-5 sm:p-6 lg:col-span-5">
                <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-sky-800">Inscripciones</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#3e434d]">
                  <li className="rounded-lg border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2">
                    Cupos limitados segun actividad
                  </li>
                  <li className="rounded-lg border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2">
                    Confirmacion por correo o WhatsApp
                  </li>
                  <li className="rounded-lg border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2">
                    Prioridad a residentes de Trancas
                  </li>
                </ul>
                <Link
                  to={ROUTES.atencionCiudadano}
                  className="mt-4 inline-flex text-sm font-semibold text-sky-800 transition hover:text-[#0f1319]"
                >
                  Solicitar informacion →
                </Link>
              </aside>
            </div>
          </article>
        </RevealOnScroll>

        <section id="proximos-eventos" className="mt-10 sm:mt-12">
          <RevealOnScroll variant="slow">
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-800">
                  Proximos encuentros
                </p>
                <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                  Agenda de eventos
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTypeFilter(type)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      type === typeFilter
                        ? 'bg-[#171b22] text-white'
                        : 'border border-[#d8d5cd] bg-white text-[#3e434d] hover:border-sky-200 hover:text-[#171b22]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-12">
            {visibleEvents.map((event, idx) => (
              <li
                key={event.id}
                className={idx === 0 ? 'sm:col-span-2 xl:col-span-7' : 'xl:col-span-5'}
              >
                <RevealOnScroll variant="newsCardSlow" delayMs={idx * 80}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm ring-1 ring-[#1a1d24]/5 transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/10">
                    <div className={idx === 0 ? 'aspect-video' : 'aspect-16/10'}>
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap gap-2">
                        <EventTag>{event.type}</EventTag>
                        <EventTag>{event.dateLabel}</EventTag>
                      </div>
                      <h3 className="mt-3 text-lg font-bold tracking-tight text-[#171b22]">
                        {event.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#4b505a]">
                        {event.summary}
                      </p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {event.place}
                      </p>
                    </div>
                  </article>
                </RevealOnScroll>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-10">
          <RevealOnScroll variant="slow" className="lg:col-span-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-sky-800">Agenda semanal</h2>
            <p className="mt-2 font-serif text-2xl font-bold text-[#171b22]">Organiza tu calendario</p>
            <p className="mt-3 text-sm leading-relaxed text-[#4b505a]">
              Revisa horarios y ubicaciones para planificar tu participacion en cada evento.
            </p>
          </RevealOnScroll>
          <RevealOnScroll variant="slow" delayMs={120} className="lg:col-span-7">
            <div className="divide-y divide-[#ddd7ca] rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
              {AGENDA.map((item) => (
                <article key={`${item.day}-${item.title}`} className="grid gap-4 p-4 sm:grid-cols-[70px_1fr] sm:items-center sm:p-5">
                  <div className="inline-flex w-fit flex-col items-center rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-sky-900">
                    <span className="text-lg font-bold leading-none">{item.day}</span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em]">{item.month}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#171b22]">{item.title}</h3>
                    <p className="mt-1 text-sm text-[#4b505a]">
                      {item.time} · {item.zone}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </RevealOnScroll>
        </section>

        <RevealOnScroll variant="newsCardSlow" delayMs={140}>
          <section className="mt-10 overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-center shadow-lg sm:mt-12 sm:p-10">
            <p className="font-serif text-xl font-bold text-white sm:text-2xl">
              Queres sumar un evento comunitario?
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
              Envia tu propuesta y nuestro equipo evaluara su incorporacion a la agenda oficial.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <LinkButton to={ROUTES.atencionCiudadano}>
                Enviar propuesta
              </LinkButton>
              <Link
                to={ROUTES.services}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Ver otros servicios
              </Link>
            </div>
          </section>
        </RevealOnScroll>
      </Container>
    </section>
  )
}

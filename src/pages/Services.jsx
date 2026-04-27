import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RevealOnScroll } from '../components/home/RevealOnScroll.jsx'
import { Container } from '../components/ui/Container.jsx'
import { LinkButton } from '../components/ui/LinkButton.jsx'
import { ROUTES } from '../utils/constants.js'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1900&q=80'

const SERVICE_CATEGORIES = ['Todos', 'Documentación', 'Comunidad', 'Obras', 'Salud']

const SERVICE_ITEMS = [
  {
    id: 'partidas',
    title: 'Solicitud de partidas',
    category: 'Documentación',
    mode: 'Presencial y web',
    eta: '48 hs hábiles',
    summary:
      'Gestión de partidas de nacimiento, matrimonio y defunción para vecinos y trámites administrativos.',
    docs: ['DNI vigente', 'Datos registrales', 'Formulario de solicitud'],
  },
  {
    id: 'habilitacion-comercial',
    title: 'Habilitación comercial',
    category: 'Comunidad',
    mode: 'Turno previo',
    eta: '5 a 10 días',
    summary:
      'Alta o renovación de habilitaciones para comercios, con revisión de requisitos y estado de expediente.',
    docs: ['DNI del titular', 'Constancia fiscal', 'Plano o croquis del local'],
  },
  {
    id: 'reclamo-urbano',
    title: 'Reclamos de servicios urbanos',
    category: 'Obras',
    mode: 'Web / Mesa de entrada',
    eta: 'Respuesta inicial en 72 hs',
    summary:
      'Canal para luminarias, bacheo, limpieza y mantenimiento de espacios públicos con seguimiento interno.',
    docs: ['DNI', 'Dirección exacta', 'Referencia o foto del incidente'],
  },
  {
    id: 'apoyo-social',
    title: 'Programas de asistencia social',
    category: 'Comunidad',
    mode: 'Entrevista presencial',
    eta: 'Según evaluación',
    summary:
      'Orientación y derivación a programas de apoyo familiar, becas y acompañamiento comunitario.',
    docs: ['DNI del grupo familiar', 'Comprobante de domicilio', 'Documentación respaldatoria'],
  },
  {
    id: 'turnos-salud',
    title: 'Turnos de salud municipal',
    category: 'Salud',
    mode: 'Telefónico y presencial',
    eta: 'Asignación diaria',
    summary:
      'Reserva de turnos de atención primaria y campañas sanitarias coordinadas por la red local.',
    docs: ['DNI del paciente', 'Orden médica (si aplica)', 'Teléfono de contacto'],
  },
  {
    id: 'licencia-conducir',
    title: 'Licencia de conducir',
    category: 'Documentación',
    mode: 'Turno previo',
    eta: '1 a 3 días',
    summary:
      'Emisión y renovación de licencias con circuito de examen médico y validación de antecedentes.',
    docs: ['DNI', 'Certificado médico', 'Comprobante de pago'],
  },
]

const STEPS = [
  'Elegí el trámite y revisá requisitos.',
  'Reuní documentación y solicitá turno si corresponde.',
  'Presentate o enviá la solicitud por canal habilitado.',
  'Recibí estado de gestión y retiro o resolución.',
]

const FAQ = [
  {
    id: 'faq-1',
    q: '¿Necesito turno para todos los servicios?',
    a: 'No. Algunos trámites son por demanda espontánea y otros requieren turno previo para ordenar la atención.',
  },
  {
    id: 'faq-2',
    q: '¿Puedo iniciar un trámite por otra persona?',
    a: 'Sí, en varios casos con autorización firmada y copia de DNI. Revisá requisitos específicos del trámite.',
  },
  {
    id: 'faq-3',
    q: '¿Cómo sé si mi trámite está resuelto?',
    a: 'Vas a recibir notificación por el canal informado. Para consultas, podés usar Atención al ciudadano.',
  },
]

function ServiceBadge({ children }) {
  return (
    <span className="inline-flex rounded-full border border-[#d8d5cd] bg-[#f8f7f3] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#3e434d]">
      {children}
    </span>
  )
}

export function Services() {
  const [category, setCategory] = useState('Todos')
  const [openFaq, setOpenFaq] = useState(FAQ[0].id)

  const visible = useMemo(() => {
    if (category === 'Todos') return SERVICE_ITEMS
    return SERVICE_ITEMS.filter((item) => item.category === category)
  }, [category])

  return (
    <section className="relative -mt-[calc(var(--navbar-h,5rem)+1.5rem)] overflow-hidden bg-linear-to-b from-[#f1eee8] via-[#f7f7f5] to-[#fcfcfa] pb-12 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_20%_-10%,rgba(56,189,248,0.12),transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_100%_10%,rgba(15,23,42,0.12),transparent_70%)]"
        aria-hidden
      />

      <div className="relative min-h-[52dvh] overflow-hidden border-b border-white/10 bg-[#171b22] sm:min-h-[56dvh] lg:min-h-[58dvh]">
        <header className="relative overflow-hidden">
            <img
              src={HERO_IMAGE}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/88 to-slate-900/35" />
            <Container className="relative z-10 flex min-h-[52dvh] flex-col justify-center pt-[calc(var(--navbar-h,5rem)+1rem)] pb-8 sm:min-h-[56dvh] sm:pt-[calc(var(--navbar-h,5rem)+1.5rem)] sm:pb-10 lg:min-h-[58dvh] lg:pb-12">
              <p className="hero-enter-eyebrow text-xs font-bold uppercase tracking-[0.22em] text-sky-200">
                Guía municipal
              </p>
              <h1 className="hero-enter-title mt-3 max-w-4xl font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Servicios al vecino
              </h1>
              <p className="hero-enter-subtitle mt-3 max-w-3xl text-sm leading-relaxed text-slate-100 sm:text-base">
                Encontrá trámites, requisitos y canales de gestión en un solo lugar. Diseñado para que
                puedas resolver tus gestiones de forma rápida y clara.
              </p>
              <div className="hero-enter-actions mt-5 flex flex-wrap gap-3">
                <a
                  href="#tramites-disponibles"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#171b22] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222831]"
                >
                  Ver trámites
                </a>
                <Link
                  to={ROUTES.atencionCiudadano}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/15"
                >
                  Atención al ciudadano
                </Link>
              </div>
            </Container>
          </header>
      </div>

      <Container className="relative">
        <RevealOnScroll variant="slow">
          <article className="mt-8 overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
            <div className="grid gap-0 border-t border-[#ddd7ca] lg:grid-cols-12">
              <div className="border-b border-[#ddd7ca] p-5 lg:col-span-8 lg:border-b-0 lg:border-r sm:p-6">
              <h2 className="text-base font-semibold text-slate-900">Cómo iniciar tu gestión</h2>
              <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                {STEPS.map((step, i) => (
                  <li key={step} className="rounded-xl border border-[#ddd7ca] bg-[#f8f7f3] p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                      Paso {i + 1}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#3e434d]">{step}</p>
                  </li>
                ))}
              </ol>
              </div>
              <aside className="p-5 sm:p-6 lg:col-span-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-sky-800">
                Horarios y canales
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-[#3e434d]">
                <li className="rounded-lg border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2">
                  Lunes a viernes · 8:00 a 14:00
                </li>
                <li className="rounded-lg border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2">
                  Mesa de entrada y áreas operativas
                </li>
                <li className="rounded-lg border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2">
                  Canales digitales en despliegue progresivo
                </li>
              </ul>
              </aside>
            </div>
          </article>
        </RevealOnScroll>

        <section id="tramites-disponibles" className="mt-10 sm:mt-12">
          <RevealOnScroll variant="slow">
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-800">
                Trámites disponibles
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                Directorio de servicios
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {SERVICE_CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    item === category
                      ? 'bg-[#171b22] text-white'
                      : 'border border-[#d8d5cd] bg-white text-[#3e434d] hover:border-sky-200 hover:text-[#171b22]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            </div>
          </RevealOnScroll>

          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((item, idx) => (
              <li key={item.id}>
                <RevealOnScroll variant="newsCardSlow" delayMs={idx * 80}>
                  <article className="group flex h-full flex-col rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm ring-1 ring-[#1a1d24]/5 transition duration-300 hover:-translate-y-1 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/10">
                    <div className="flex flex-wrap gap-2">
                      <ServiceBadge>{item.category}</ServiceBadge>
                      <ServiceBadge>{item.mode}</ServiceBadge>
                    </div>
                    <h3 className="mt-3 text-lg font-bold tracking-tight text-[#171b22]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#4b505a]">{item.summary}</p>
                    <div className="mt-3 rounded-lg border border-sky-100 bg-sky-50/70 px-3 py-2 text-xs font-semibold text-sky-900">
                      Tiempo estimado: {item.eta}
                    </div>
                    <div className="mt-4 space-y-1.5">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        Documentación base
                      </p>
                      {item.docs.map((doc) => (
                        <p key={doc} className="text-sm text-[#3e434d]">
                          • {doc}
                        </p>
                      ))}
                    </div>
                    <Link
                      to={ROUTES.atencionCiudadano}
                      className="mt-auto inline-flex pt-4 text-sm font-semibold text-sky-800 transition hover:text-[#0f1319]"
                    >
                      Consultar este trámite →
                    </Link>
                  </article>
                </RevealOnScroll>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-10">
          <RevealOnScroll variant="slow" className="lg:col-span-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-sky-800">Preguntas frecuentes</h2>
            <p className="mt-2 font-serif text-2xl font-bold text-[#171b22]">Antes de iniciar un trámite</p>
            <p className="mt-3 text-sm leading-relaxed text-[#4b505a]">
              Estas respuestas orientan la gestión inicial. Para casos puntuales podés abrir una consulta
              en Atención al ciudadano.
            </p>
          </RevealOnScroll>
          <RevealOnScroll variant="slow" delayMs={110} className="lg:col-span-7">
            <div className="divide-y divide-[#ddd7ca] rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
              {FAQ.map((item) => {
                const open = openFaq === item.id
                return (
                  <div key={item.id} className="px-1">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? '' : item.id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-[#f8f7f3] sm:px-5 sm:py-5"
                      aria-expanded={open}
                    >
                      <span className="text-sm font-semibold text-[#171b22] sm:text-base">{item.q}</span>
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#ddd7ca] bg-white text-slate-500 transition ${
                          open ? 'rotate-180 border-sky-200 text-sky-700' : ''
                        }`}
                        aria-hidden
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </span>
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-4 pb-4 text-sm leading-relaxed text-[#4b505a] sm:px-5 sm:pb-5">{item.a}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </RevealOnScroll>
        </section>

        <RevealOnScroll variant="newsCardSlow" delayMs={140}>
          <section className="mt-10 overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-center shadow-lg sm:mt-12 sm:p-10">
          <p className="font-serif text-xl font-bold text-white sm:text-2xl">
            ¿No encontrás tu trámite?
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
            En Atención al ciudadano podés dejar una consulta y el equipo municipal la deriva al área
            correspondiente para seguimiento.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LinkButton to={ROUTES.atencionCiudadano}>
              Ir a Atención al ciudadano
            </LinkButton>
            <Link
              to={ROUTES.news}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Ver novedades
            </Link>
          </div>
          </section>
        </RevealOnScroll>
      </Container>
    </section>
  )
}

import { Link } from 'react-router-dom'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { Container } from '../../components/ui/Container.jsx'
import { LinkButton } from '../../components/ui/LinkButton.jsx'
import { useAreas } from '../../hooks/useAreas.js'

export function AreasIndex() {
  const { areas, loading, error } = useAreas()
  const featured = areas[0] ?? null

  if (loading) {
    return (
      <section className="relative pb-10 sm:pb-12">
        <Container>
          <div className="animate-pulse rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] px-6 py-12 text-center shadow-sm">
            <div className="mx-auto h-7 w-64 rounded bg-slate-200" />
            <div className="mx-auto mt-4 h-4 w-96 max-w-full rounded bg-slate-100" />
          </div>
        </Container>
      </section>
    )
  }

  if (error) {
    return (
      <section className="relative pb-10 sm:pb-12">
        <Container>
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-red-900">No pudimos cargar las áreas</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-red-800 sm:text-base">
              {error}
            </p>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section className="relative -mt-[calc(var(--navbar-h,5rem)+1.5rem)] overflow-hidden bg-linear-to-b from-[#f1eee8] via-[#f7f7f5] to-[#fcfcfa] pb-8 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_45%_at_20%_-10%,rgba(56,189,248,0.12),transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_100%_10%,rgba(15,23,42,0.12),transparent_70%)]"
        aria-hidden
      />

      <div className="relative min-h-[52dvh] overflow-hidden border-b border-white/10 bg-[#171b22] sm:min-h-[56dvh] lg:min-h-[58dvh]">
        <img
          src={featured?.coverImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/88 to-slate-900/35" />
        <Container className="relative z-10 flex min-h-[52dvh] flex-col justify-center pt-[calc(var(--navbar-h,5rem)+1rem)] pb-8 sm:min-h-[56dvh] sm:pt-[calc(var(--navbar-h,5rem)+1.5rem)] sm:pb-10 lg:min-h-[58dvh] lg:pb-12">
          <div className="max-w-4xl">
            <p className="hero-enter-eyebrow text-[11px] font-bold uppercase tracking-[0.28em] text-sky-200/95 sm:text-xs sm:tracking-[0.32em]">
              Municipalidad de Trancas
            </p>
            <h1 className="hero-enter-title mt-2 max-w-3xl font-serif text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.85rem]">
              Todas las áreas en un solo lugar
            </h1>
            <p className="hero-enter-subtitle mt-3 max-w-2xl text-sm leading-relaxed text-slate-100 sm:text-base">
              Explorá programas, equipos y acciones de cada área municipal para encontrar
              más rápido la gestión que necesitás.
            </p>
            <div className="hero-enter-actions mt-6 flex flex-wrap items-center gap-3">
              <LinkButton to={`/areas/${featured?.slug}`}>
                Empezar recorrido
              </LinkButton>
              <a
                href="#areas-grid"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/15"
              >
                Ver directorio
              </a>
            </div>
          </div>
        </Container>
      </div>

      <Container className="relative">
        <RevealOnScroll variant="slow">
          <div className="mt-8 rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-800">
                  Navegación rápida
                </p>
                <p className="mt-1 text-sm text-[#4b505a]">
                  Accedé directo a las áreas más consultadas por los vecinos.
                </p>
              </div>
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {areas.slice(0, 5).map((area) => (
                <li key={`quick-${area.slug}`}>
                  <Link
                    to={`/areas/${area.slug}`}
                    className="group flex items-center justify-between rounded-xl border border-[#ddd7ca] bg-white px-4 py-3 text-sm font-semibold text-[#171b22] transition hover:border-sky-200 hover:bg-sky-50/60 hover:text-[#0f1319]"
                  >
                    <span className="truncate">{area.title}</span>
                    <span className="ml-3 text-sky-700 transition-transform group-hover:translate-x-0.5" aria-hidden>
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </RevealOnScroll>

        <div id="areas-grid" className="mt-10 sm:mt-12">
          <RevealOnScroll variant="slow">
            <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-800">
                  Directorio municipal
                </p>
                <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                  Áreas disponibles
                </h2>
              </div>
              <p className="max-w-xl text-sm text-[#4b505a] sm:text-right">
                Ingresá a cada área para conocer su función y próximos recursos de atención
                digital.
              </p>
            </div>
          </RevealOnScroll>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {areas.map((area, idx) => (
              <li key={area.slug}>
                <RevealOnScroll variant="newsCardSlow" delayMs={idx * 80}>
                  <Link
                    to={`/areas/${area.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm ring-1 ring-[#1a1d24]/5 transition-all duration-300 hover:-translate-y-1 hover:border-sky-200/80 hover:shadow-xl hover:shadow-sky-500/10"
                  >
                    <div className="relative">
                      <img
                        src={area.coverImage}
                        alt=""
                        className="aspect-16/10 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-900/70 via-slate-900/0 to-slate-900/0" />
                      <span className="absolute left-3 top-3 inline-flex rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-900 ring-1 ring-[#d8d5cd]">
                        Área {idx + 1}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-serif text-xl font-bold tracking-tight text-[#171b22] transition-colors group-hover:text-[#0f1319]">
                        {area.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#4b505a]">
                        {area.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 transition-all group-hover:gap-2">
                        Explorar área
                        <span aria-hidden>→</span>
                      </span>
                    </div>
                  </Link>
                </RevealOnScroll>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}

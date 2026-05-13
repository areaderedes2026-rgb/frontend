import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { Container } from '../../components/ui/Container.jsx'
import { LinkButton } from '../../components/ui/LinkButton.jsx'
import { useAreas } from '../../hooks/useAreas.js'
import { fetchAreasPageContent } from '../../services/areasPageService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { HydrationHeroDarkBackdrop } from '../../components/skeleton/PageHydrationSkeleton.jsx'

const DEFAULT_AREAS_HERO_IMAGE =
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80'

function normalizeSearch(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function sortAreasCopy(list, mode) {
  const copy = [...list]
  if (mode === 'alpha') {
    copy.sort((a, b) =>
      String(a.title || '').localeCompare(String(b.title || ''), 'es', {
        sensitivity: 'base',
      }),
    )
    return copy
  }
  copy.sort((a, b) => {
    const pa = Number(a.sortOrder) || 0
    const pb = Number(b.sortOrder) || 0
    if (pa !== pb) return pa - pb
    return String(a.title || '').localeCompare(String(b.title || ''), 'es', {
      sensitivity: 'base',
    })
  })
  return copy
}

export function AreasIndex() {
  const apiEnabled = isApiConfigured()
  const { areas, loading, error } = useAreas()
  const [globalCover, setGlobalCover] = useState('')
  const [globalCoverHydrated, setGlobalCoverHydrated] = useState(!apiEnabled)
  const [directoryQuery, setDirectoryQuery] = useState('')
  const [directorySort, setDirectorySort] = useState('priority')
  const featured = areas[0] ?? null
  const heroImage = useMemo(
    () => globalCover || DEFAULT_AREAS_HERO_IMAGE,
    [globalCover],
  )

  const directoryAreas = useMemo(() => {
    const q = normalizeSearch(directoryQuery.trim())
    const filtered = q
      ? areas.filter((area) =>
          normalizeSearch(
            `${area.title || ''} ${area.slug || ''} ${area.description || ''}`,
          ).includes(q),
        )
      : areas
    return sortAreasCopy(filtered, directorySort)
  }, [areas, directoryQuery, directorySort])

  useEffect(() => {
    let cancelled = false
    if (!apiEnabled) return () => {}
    fetchAreasPageContent()
      .then((content) => {
        if (!cancelled) setGlobalCover(String(content?.heroImageUrl || ''))
      })
      .catch(() => {
        if (!cancelled) setGlobalCover('')
      })
      .finally(() => {
        if (!cancelled) setGlobalCoverHydrated(true)
      })
    return () => {
      cancelled = true
    }
  }, [apiEnabled])

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
        {globalCoverHydrated ? (
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : (
          <HydrationHeroDarkBackdrop />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/76 via-black/62 to-black/36" />
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
              <LinkButton to={featured?.slug ? `/areas/${featured.slug}` : '/areas#areas-grid'}>
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
          <div
            className="mt-8 rounded-2xl border border-[#e8e4dc] bg-[#fcfcfa]/95 p-4 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_12px_40px_-28px_rgba(15,23,42,0.18)] backdrop-blur-[2px] sm:p-5"
            role="search"
            aria-label="Buscar y ordenar áreas"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-5">
              <div className="relative min-w-0 flex-1">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9099]" aria-hidden>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />
                  </svg>
                </span>
                <input
                  type="search"
                  id="areas-directory-search"
                  value={directoryQuery}
                  onChange={(e) => setDirectoryQuery(e.target.value)}
                  placeholder="Buscar por nombre, slug o descripción…"
                  autoComplete="off"
                  className="w-full rounded-xl border border-[#ddd7ca] bg-white py-3 pl-10 pr-3 text-sm text-[#171b22] shadow-inner outline-none ring-sky-300/40 transition placeholder:text-[#8b9099] focus:border-sky-300 focus:ring-2"
                />
              </div>
              <div className="flex shrink-0 flex-col justify-center gap-1.5 sm:flex-row sm:items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7280] sm:mr-1 sm:self-center">
                  Orden
                </span>
                <div className="inline-flex rounded-xl border border-[#ddd7ca] bg-[#f4f1eb] p-0.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setDirectorySort('priority')}
                    className={`rounded-[10px] px-3.5 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                      directorySort === 'priority'
                        ? 'bg-white text-[#0f172a] shadow-sm ring-1 ring-[#e5e2da]'
                        : 'text-[#5c6169] hover:text-[#171b22]'
                    }`}
                    aria-pressed={directorySort === 'priority'}
                  >
                    Prioridad
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectorySort('alpha')}
                    className={`rounded-[10px] px-3.5 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                      directorySort === 'alpha'
                        ? 'bg-white text-[#0f172a] shadow-sm ring-1 ring-[#e5e2da]'
                        : 'text-[#5c6169] hover:text-[#171b22]'
                    }`}
                    aria-pressed={directorySort === 'alpha'}
                  >
                    A–Z
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#6b7280]">
              {directoryQuery.trim() ? (
                <>
                  <span className="font-semibold tabular-nums text-[#374151]">{directoryAreas.length}</span>
                  {directoryAreas.length === 1 ? ' resultado' : ' resultados'}
                  {directorySort === 'priority' ? ' · orden de prioridad municipal' : ' · orden alfabético'}
                </>
              ) : (
                <>
                  Mostrando las{' '}
                  <span className="font-semibold text-[#374151]">{areas.length}</span> áreas
                  {directorySort === 'priority'
                    ? ' por prioridad (predeterminado).'
                    : ' en orden alfabético.'}
                </>
              )}
            </p>
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
          {directoryAreas.length === 0 ? (
            <RevealOnScroll variant="slow">
              <div className="rounded-2xl border border-dashed border-[#d6d0c4] bg-[#faf9f6] px-6 py-14 text-center">
                <p className="font-serif text-lg font-semibold text-[#171b22]">No hay áreas que coincidan</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-[#5c6169]">
                  Probá otra palabra o borrá el texto del buscador para ver el listado completo.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDirectoryQuery('')
                    setDirectorySort('priority')
                  }}
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-[#ddd7ca] bg-white px-5 text-sm font-semibold text-[#171b22] shadow-sm transition hover:border-sky-200 hover:bg-sky-50/50"
                >
                  Restablecer búsqueda
                </button>
              </div>
            </RevealOnScroll>
          ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {directoryAreas.map((area, idx) => (
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
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-900 ring-1 ring-[#d8d5cd] backdrop-blur-[2px]">
                        Prioridad
                        <span className="rounded-md bg-sky-50 px-1.5 py-0.5 font-mono text-[11px] tracking-normal text-sky-950">
                          {Number(area.sortOrder) || 0}
                        </span>
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
          )}
        </div>
      </Container>
    </section>
  )
}

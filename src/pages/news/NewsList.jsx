import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../../components/ui/Container.jsx'
import { useNewsList } from '../../hooks/useNewsList.js'
import { formatShortDate } from '../../utils/formatDate.js'
import { NewsCoverMedia } from '../../components/news/NewsCoverMedia.jsx'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { HydrationHeroDarkBackdrop } from '../../components/skeleton/PageHydrationSkeleton.jsx'
import { fetchSitePageBanner } from '../../services/sitePageBannerService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'

function NewsCategorySelect({ id, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()

  useEffect(() => {
    function handlePointer(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointer)
    return () => document.removeEventListener('pointerdown', handlePointer)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        id={id}
        className="news-select-minimal-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        data-open={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="min-w-0 flex-1 truncate">{value}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-[#4b505a] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m6 8 4 4 4-4"
          />
        </svg>
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={id}
          className="absolute left-0 right-0 z-50 mt-1 max-h-[min(22.5rem,calc(100vh-10rem))] overflow-y-auto overscroll-contain rounded-lg border border-[#d8d5cd] bg-white py-1 shadow-lg [scrollbar-gutter:stable]"
        >
          {options.map((opt) => (
            <li key={opt} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={opt === value}
                className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${
                  opt === value
                    ? 'bg-sky-100/70 font-medium text-sky-900'
                    : 'text-[#171b22]'
                }`}
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function NewsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="mt-5 h-8 w-3/4 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-full rounded bg-slate-100" />
        <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
      </div>
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5"
            >
          <div className="aspect-video rounded-xl bg-slate-100" />
              <div className="mt-4 h-3 w-20 rounded bg-slate-200" />
              <div className="mt-3 h-6 w-4/5 rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 lg:col-span-4">
          <div className="h-5 w-28 rounded bg-slate-200" />
          <div className="mt-5 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Copias del mismo bloque de categorías para carril ancho + bucle continuo (ver --news-category-segments en CSS). */
const MARQUEE_SEGMENT_COPIES = 6

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function excerptWords(text, maxWords = 18) {
  const value = String(text || '').trim()
  if (!value) return ''
  const words = value.split(/\s+/)
  if (words.length <= maxWords) return value
  return `${words.slice(0, maxWords).join(' ')}...`
}

const COVERAGE_PAGE_SIZE = 5

/** Portada por defecto del listado de noticias si no hay una personalizada en admin. */
const NEWS_LIST_DEFAULT_HERO_IMAGE = '/images/news-hero-bg.jpg'

/**
 * Tarjeta compacta para secciones por categoría (más pequeña que “Más cobertura”).
 * La categoría no se repite en la tarjeta: el título de sección ya la identifica.
 */
function NewsCategoryBandCard({ n }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm ring-1 ring-[#1a1d24]/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-md hover:shadow-sky-500/8">
      <NewsCoverMedia
        imageUrl={n.imageUrl}
        className="aspect-4/3 w-full shrink-0"
        imgClassName="transition duration-500 group-hover:scale-[1.03]"
        loading="lazy"
        iconScale="sm"
      />
      <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-3.5">
        <time
          dateTime={n.publishedAt}
          className="text-[10px] font-medium tabular-nums text-slate-500 sm:text-[11px]"
        >
          {formatShortDate(n.publishedAt)}
        </time>
        <h3 className="mt-1.5 line-clamp-2 font-serif text-sm font-semibold leading-snug tracking-tight text-[#171b22]">
          <Link to={`/news/${n.id}`} className="hover:text-[#0f1319]">
            {n.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
          {excerptWords(n.summary, 9)}
        </p>
        <Link
          to={`/news/${n.id}`}
          className="mt-auto inline-flex items-center gap-0.5 pt-2 text-[11px] font-semibold text-sky-800 transition-all group-hover:gap-1 hover:text-[#0f1319] sm:text-xs"
        >
          Leer nota
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  )
}

/** Tarjeta estilo “Más cobertura” (grid 2–3 columnas). */
function NewsCoverageCard({ n }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm ring-1 ring-[#1a1d24]/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/8">
      <NewsCoverMedia
        imageUrl={n.imageUrl}
        className="aspect-16/10 w-full"
        imgClassName="transition duration-500 group-hover:scale-[1.04]"
        loading="lazy"
        iconScale="md"
      />
      <div className="p-5">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 sm:text-xs">
          <span className="rounded-md bg-sky-100/70 px-2 py-0.5 font-semibold uppercase tracking-wide text-sky-900">
            {n.category}
          </span>
          <span className="text-slate-400" aria-hidden>
            ·
          </span>
          <time dateTime={n.publishedAt} className="tabular-nums">
            {formatShortDate(n.publishedAt)}
          </time>
        </p>
        <h3 className="mt-3 line-clamp-2 font-serif text-lg font-semibold leading-snug tracking-tight text-[#171b22] sm:text-xl">
          <Link to={`/news/${n.id}`} className="hover:text-[#0f1319]">
            {n.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {excerptWords(n.summary, 16)}
        </p>
        <Link
          to={`/news/${n.id}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-800 transition-all group-hover:gap-2 hover:text-[#0f1319]"
        >
          Leer nota
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  )
}

function CategoryNewsBand({ categoryName, items, sort }) {
  const list = useMemo(() => {
    return [...items]
      .filter((n) => (n.category || 'General') === categoryName)
      .sort((a, b) => {
        const da = new Date(a.publishedAt).getTime()
        const db = new Date(b.publishedAt).getTime()
        return sort === 'oldest' ? da - db : db - da
      })
  }, [items, categoryName, sort])

  const [visibleCount, setVisibleCount] = useState(COVERAGE_PAGE_SIZE)

  const shown = list.slice(0, visibleCount)
  const hasMore = visibleCount < list.length

  if (list.length === 0) return null

  return (
    <div>
      <h2 className="news-editorial-section-label mb-4 border-b border-[#ddd7ca] pb-2 text-[#4b505a]">
        {categoryName}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 lg:gap-4">
        {shown.map((n) => (
          <li key={n.id} className="min-w-0">
            <NewsCategoryBandCard n={n} />
          </li>
        ))}
      </ul>
      {hasMore ? (
        <div className="mt-6 flex justify-center sm:mt-8">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((c) =>
                Math.min(c + COVERAGE_PAGE_SIZE, list.length),
              )
            }
            className="inline-flex min-h-11 w-full max-w-sm items-center justify-center rounded-xl border border-[#2a313b] bg-[#171b22] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222831] sm:w-auto"
          >
            Ver más
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function NewsList() {
  const apiEnabled = isApiConfigured()
  const { items, loading, error } = useNewsList()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todas')
  const [sort, setSort] = useState('newest')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [heroHydrated, setHeroHydrated] = useState(!apiEnabled)

  useEffect(() => {
    let cancelled = false
    if (!apiEnabled) return () => {}
    fetchSitePageBanner('news')
      .then((content) => {
        if (!cancelled) setHeroImageUrl(String(content?.heroImageUrl || ''))
      })
      .catch(() => {
        if (!cancelled) setHeroImageUrl('')
      })
      .finally(() => {
        if (!cancelled) setHeroHydrated(true)
      })
    return () => {
      cancelled = true
    }
  }, [apiEnabled])

  const categories = useMemo(() => {
    const set = new Set(items.map((n) => n.category || 'General'))
    return ['Todas', ...[...set].sort((a, b) => a.localeCompare(b))]
  }, [items])

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    const byCategory =
      category === 'Todas'
        ? items
        : items.filter((n) => (n.category || 'General') === category)
    const byQuery = !q
      ? byCategory
      : byCategory.filter((n) =>
          normalize(`${n.title} ${n.summary} ${n.body}`).includes(q),
        )
    return [...byQuery].sort((a, b) => {
      const da = new Date(a.publishedAt).getTime()
      const db = new Date(b.publishedAt).getTime()
      return sort === 'oldest' ? da - db : db - da
    })
  }, [items, query, category, sort])

  const featured = filtered[0] || null
  const sideHeadlines = filtered.slice(1, 5)
  /** Hasta 10 noticias: las que siguen a las 4 laterales (posiciones 6–15 del listado). */
  const moreCoverage = filtered.slice(5, 15)

  /** Secciones por categoría: solo con “Todas” y sin búsqueda, para no duplicar el filtro activo. */
  const showCategoryBands =
    category === 'Todas' && !normalize(query.trim())

  const categoryNamesOrdered = useMemo(() => {
    const set = new Set(items.map((n) => n.category || 'General'))
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [items])

  const categoryMarqueeItems = useMemo(
    () =>
      Array.from({ length: MARQUEE_SEGMENT_COPIES }, () => categories).flat(),
    [categories],
  )

  return (
    <section className="news-editorial relative -mt-[calc(var(--navbar-h,5rem)+1.5rem)] overflow-hidden bg-linear-to-b from-[#f1eee8] via-[#f7f7f5] to-[#fcfcfa] pb-10 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-14">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_20%_-10%,rgba(56,189,248,0.12),transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_100%_10%,rgba(15,23,42,0.12),transparent_70%)]"
        aria-hidden
      />

      <div className="relative min-h-[52dvh] overflow-hidden border-b border-white/10 bg-[#171b22] sm:min-h-[56dvh] lg:min-h-[58dvh]">
        {heroHydrated ? (
          <img
            src={heroImageUrl || NEWS_LIST_DEFAULT_HERO_IMAGE}
            alt=""
            width={1920}
            height={1080}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-center"
            decoding="async"
          />
        ) : (
          <HydrationHeroDarkBackdrop />
        )}
        <div
          className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/88 to-slate-900/35"
          aria-hidden
        />
        <Container className="relative z-10 flex min-h-[52dvh] flex-col justify-center pt-[calc(var(--navbar-h,5rem)+1rem)] pb-8 sm:min-h-[56dvh] sm:pt-[calc(var(--navbar-h,5rem)+1.5rem)] sm:pb-10 lg:min-h-[58dvh] lg:pb-12">
          <div className="max-w-4xl">
            <p className="hero-enter-eyebrow text-[11px] font-bold uppercase tracking-[0.28em] text-sky-200/95 sm:text-xs sm:tracking-[0.32em]">
              Municipalidad de Trancas
            </p>
            <h1 className="hero-enter-title news-editorial-masthead mt-2 max-w-4xl text-balance text-white drop-shadow-sm">
              Noticias Trancas
            </h1>
            <p className="hero-enter-subtitle news-editorial-deck mt-3 max-w-2xl text-slate-100/95 drop-shadow-sm">
              Cobertura institucional, novedades de gestión y comunicados oficiales.
            </p>
          </div>
        </Container>
      </div>

      <RevealOnScroll variant="slow">
        <div className="news-category-marquee-wrap w-full min-w-0 overflow-hidden border-y border-[#d6d0c4] bg-[#f5f3ee]/95">
        <p className="sr-only">
          Categorías de noticias. También podés filtrar con los botones de
          categoría debajo del buscador.
        </p>
        <div className="w-full py-2.5 sm:py-3">
          <div
            className="news-category-marquee-track"
            style={{
              '--news-category-segments': MARQUEE_SEGMENT_COPIES,
            }}
          >
            {categoryMarqueeItems.map((c, i) => (
              <span
                key={`marquee-${c}-${i}`}
                className="inline-flex shrink-0 items-center"
              >
                <button
                  type="button"
                  tabIndex={-1}
                  aria-pressed={c === category}
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm ring-1 transition sm:px-4 sm:text-sm ${
                    c === category
                      ? 'bg-[#171b22] text-white ring-[#2a313b]'
                      : 'bg-white text-[#171b22] ring-[#d8d5cd] hover:bg-sky-50'
                  }`}
                >
                  {c}
                </button>
                <span className="mx-5 text-slate-300 sm:mx-7" aria-hidden>
                  •
                </span>
              </span>
            ))}
          </div>
        </div>
        </div>
      </RevealOnScroll>

      <Container className="relative">
        <RevealOnScroll variant="slow" delayMs={120}>
          <div className="mt-8 rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-5">
              <label className="sr-only" htmlFor="news-search">
                Buscar noticias
              </label>
              <input
                id="news-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por título o contenido..."
                className="w-full rounded-lg border border-[#d8d5cd] bg-white px-3 py-2.5 text-sm text-[#171b22] shadow-none transition placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div className="min-w-0 lg:col-span-4">
              <label className="sr-only" htmlFor="news-category">
                Categoría
              </label>
              <NewsCategorySelect
                id="news-category"
                value={category}
                options={categories}
                onChange={setCategory}
              />
            </div>
            <div className="min-w-0 lg:col-span-3">
              <label className="sr-only" htmlFor="news-sort">
                Ordenar noticias
              </label>
              <select
                id="news-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="news-select-minimal"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguas</option>
              </select>
            </div>
          </div>
          </div>
        </RevealOnScroll>

        <div className="mt-8 sm:mt-10">
          {loading ? (
            <NewsSkeleton />
          ) : error ? (
            <p
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {error}
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-slate-500">No hay noticias publicadas por el momento.</p>
          ) : (
            <div className="space-y-8">
              <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
                <div className="lg:col-span-7">
                  {featured ? (
                    <RevealOnScroll variant="newsCardSlow">
                      <article className="group overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm ring-1 ring-[#1a1d24]/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/8 sm:p-6">
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 sm:text-xs">
                          <span className="rounded-md bg-sky-100/70 px-2 py-0.5 font-semibold uppercase tracking-wide text-sky-900">
                            {featured.category}
                          </span>
                          <span className="text-slate-400" aria-hidden>
                            ·
                          </span>
                          <time dateTime={featured.publishedAt} className="tabular-nums">
                            {formatShortDate(featured.publishedAt)}
                          </time>
                        </p>
                        <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight tracking-tight text-[#171b22] sm:text-[2rem]">
                          <Link to={`/news/${featured.id}`} className="hover:text-[#0f1319]">
                            {featured.title}
                          </Link>
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                          {excerptWords(featured.summary, 28)}
                        </p>
                        <NewsCoverMedia
                          imageUrl={featured.imageUrl}
                          className="mt-5 aspect-video w-full overflow-hidden rounded-xl"
                          imgClassName="transition duration-500 group-hover:scale-[1.03]"
                          loading="eager"
                          iconScale="lg"
                        />
                        <Link
                          to={`/news/${featured.id}`}
                          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-800 transition-all group-hover:gap-2 hover:text-[#0f1319]"
                        >
                          Leer nota
                          <span aria-hidden>→</span>
                        </Link>
                      </article>
                    </RevealOnScroll>
                  ) : null}
                </div>

                <div className="grid content-start gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2">
                  {sideHeadlines.map((n, i) => (
                    <RevealOnScroll key={n.id} variant="newsCardSlow" delayMs={90 + i * 80}>
                      <article
                        className="group overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm ring-1 ring-[#1a1d24]/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/8"
                      >
                        <NewsCoverMedia
                          imageUrl={n.imageUrl}
                          className="aspect-video w-full"
                          imgClassName="transition duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                          iconScale="md"
                        />
                        <div className="p-4">
                          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 sm:text-xs">
                            <span className="rounded-md bg-sky-100/70 px-2 py-0.5 font-semibold uppercase tracking-wide text-sky-900">
                              {n.category}
                            </span>
                            <span className="text-slate-400" aria-hidden>
                              ·
                            </span>
                            <time dateTime={n.publishedAt} className="tabular-nums">
                              {formatShortDate(n.publishedAt)}
                            </time>
                          </p>
                          <h3 className="mt-3 line-clamp-2 font-serif text-lg font-semibold leading-snug tracking-tight text-[#171b22] sm:text-xl">
                            <Link to={`/news/${n.id}`} className="hover:text-[#0f1319]">
                              {n.title}
                            </Link>
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {excerptWords(n.summary, 15)}
                          </p>
                          <Link
                            to={`/news/${n.id}`}
                            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-800 transition-all group-hover:gap-2 hover:text-[#0f1319]"
                          >
                            Leer nota
                            <span aria-hidden>→</span>
                          </Link>
                        </div>
                      </article>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="news-editorial-section-label mb-4 border-b border-[#ddd7ca] pb-2 text-[#4b505a]">
                  Más cobertura
                </h2>
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {moreCoverage.map((n) => (
                    <li key={n.id}>
                      <NewsCoverageCard n={n} />
                    </li>
                  ))}
                </ul>
              </div>

              {showCategoryBands && categoryNamesOrdered.length > 0 ? (
                <div className="border-t border-[#ddd7ca] pt-8 sm:pt-10">
                  <div className="flex flex-col gap-10 sm:gap-12">
                    {categoryNamesOrdered.map((cat) => (
                      <CategoryNewsBand
                        key={`${cat}-${sort}-${items.length}`}
                        categoryName={cat}
                        items={items}
                        sort={sort}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

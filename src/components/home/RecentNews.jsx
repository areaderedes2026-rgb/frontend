import { Link } from 'react-router-dom'
import { Container } from '../ui/Container.jsx'
import { LinkButton } from '../ui/LinkButton.jsx'
import { RevealOnScroll } from './RevealOnScroll.jsx'
import { useNewsList } from '../../hooks/useNewsList.js'
import { NewsCoverMedia } from '../news/NewsCoverMedia.jsx'
import { formatShortDate } from '../../utils/formatDate.js'

const RECENT_COUNT = 6

function excerptWords(text, maxWords = 16) {
  const value = String(text || '').trim()
  if (!value) return ''
  const words = value.split(/\s+/)
  if (words.length <= maxWords) return value
  return `${words.slice(0, maxWords).join(' ')}...`
}

function RecentNewsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: RECENT_COUNT }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/5"
        >
          <div className="aspect-16/10 animate-pulse bg-slate-200" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-[80%] animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function RecentNews() {
  const { items, loading, error } = useNewsList()
  const recent = items.slice(0, RECENT_COUNT)

  return (
    <section
      className="relative overflow-x-hidden border-y border-sky-200/50 bg-sky-50 py-14 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] sm:py-20"
      aria-labelledby="titulo-noticias-recientes"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(56,189,248,0.14),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_100%_100%,rgba(14,165,233,0.08),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.35)_0%,transparent_35%,transparent_65%,rgba(241,245,249,0.4)_100%)]"
        aria-hidden
      />

      <Container className="relative z-10">
        <RevealOnScroll>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-800/90">
                Actualidad
              </p>
              <h2
                id="titulo-noticias-recientes"
                className="mt-2 font-serif text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
              >
                Últimas noticias
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Comunicados oficiales y novedades de la municipalidad.
              </p>
            </div>
            <Link
              to="/news"
              className="hidden shrink-0 text-sm font-semibold text-sky-900 underline-offset-4 transition-colors hover:text-sky-950 hover:underline sm:inline-flex sm:items-center sm:gap-1.5"
            >
              Ver todas las noticias
              <span aria-hidden className="text-lg leading-none">
                →
              </span>
            </Link>
          </div>
        </RevealOnScroll>

        <div className="mt-10 sm:mt-12">
          {loading ? (
            <RevealOnScroll>
              <RecentNewsSkeleton />
            </RevealOnScroll>
          ) : error ? (
            <RevealOnScroll>
              <p
                className="rounded-xl border border-red-200 bg-white/90 px-4 py-3 text-sm text-red-800 shadow-sm backdrop-blur-[2px]"
                role="alert"
              >
                {error}
              </p>
            </RevealOnScroll>
          ) : recent.length === 0 ? (
            <RevealOnScroll>
              <p className="text-center text-slate-600">
                No hay noticias publicadas por el momento.
              </p>
            </RevealOnScroll>
          ) : (
            <ul className="grid gap-6 pb-1 pt-1 sm:grid-cols-2 sm:pb-2 lg:grid-cols-3">
              {recent.map((n, i) => (
                <li key={n.id} className="min-w-0">
                  <RevealOnScroll
                    variant="newsCard"
                    delayMs={i * 95}
                  >
                    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/8">
                    <div className="relative shrink-0 overflow-hidden">
                      <NewsCoverMedia
                        imageUrl={n.imageUrl}
                        className="aspect-16/10 w-full"
                        imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                        iconScale="md"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 sm:text-xs">
                        <span className="rounded-md bg-sky-50 px-2 py-0.5 font-semibold uppercase tracking-wide text-sky-900">
                          {n.category}
                        </span>
                        <span className="text-slate-400" aria-hidden>
                          ·
                        </span>
                        <time dateTime={n.publishedAt} className="tabular-nums">
                          {formatShortDate(n.publishedAt)}
                        </time>
                      </div>
                      <h3 className="mt-3 line-clamp-2 font-serif text-lg font-semibold leading-snug tracking-tight text-slate-900 sm:text-xl">
                        <Link
                          to={`/news/${n.id}`}
                          className="transition-colors hover:text-sky-900"
                        >
                          {n.title}
                        </Link>
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                        {excerptWords(n.summary, 16)}
                      </p>
                      <Link
                        to={`/news/${n.id}`}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-800 transition-all group-hover:gap-2 hover:text-sky-950"
                      >
                        Leer nota
                        <span aria-hidden>→</span>
                      </Link>
                    </div>
                  </article>
                  </RevealOnScroll>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!loading && !error && recent.length > 0 ? (
          <RevealOnScroll>
            <div className="mt-10 flex justify-center sm:mt-12">
              <LinkButton to="/news" variant="secondary" className="min-w-56">
                Ver todas las noticias
              </LinkButton>
            </div>
          </RevealOnScroll>
        ) : null}
      </Container>
    </section>
  )
}

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Container } from '../../components/ui/Container.jsx'
import { fetchNewsById, fetchNewsList } from '../../services/newsService.js'
import { formatDate } from '../../utils/formatDate.js'
import { NewsCoverMedia } from '../../components/news/NewsCoverMedia.jsx'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'

export function NewsDetail() {
  const { id } = useParams()
  return <NewsDetailContent key={id} id={id} />
}

function NewsDetailContent({ id }) {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [related, setRelated] = useState([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [id])

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchNewsById(id), fetchNewsList()])
      .then(([data, list]) => {
        if (cancelled) return
        setItem(data)
        if (!data) {
          setRelated([])
          return
        }
        const sortedRelated = (Array.isArray(list) ? list : [])
          .filter((n) => String(n.id) !== String(data.id))
          .sort((a, b) => {
            const scoreA =
              (a.category === data.category ? 1_000_000_000 : 0) +
              new Date(a.publishedAt).getTime()
            const scoreB =
              (b.category === data.category ? 1_000_000_000 : 0) +
              new Date(b.publishedAt).getTime()
            return scoreB - scoreA
          })
          .slice(0, 6)
        setRelated(sortedRelated)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Error al cargar')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setLightboxIndex(null)
        return
      }
      if (lightboxIndex === null || !item?.galleryUrls?.length) return
      if (e.key === 'ArrowRight') {
        setLightboxIndex((idx) => (idx + 1) % item.galleryUrls.length)
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex(
          (idx) => (idx - 1 + item.galleryUrls.length) % item.galleryUrls.length,
        )
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, item?.galleryUrls])

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(t)
  }, [copied])

  async function handleCopyLink() {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  function readingMinutes(news) {
    const txt = `${news?.summary || ''} ${news?.body || ''}`.trim()
    const words = txt ? txt.split(/\s+/).length : 0
    return Math.max(1, Math.round(words / 180))
  }

  if (loading) {
    return (
      <section className="pb-8">
        <Container>
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="animate-pulse space-y-4 rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-8 lg:col-span-8">
              <div className="h-3 w-32 rounded bg-slate-200" />
              <div className="h-10 w-4/5 rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="aspect-video rounded-2xl bg-slate-100" />
            </div>
            <div className="animate-pulse rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-6 lg:col-span-4">
              <div className="h-5 w-24 rounded bg-slate-200" />
              <div className="mt-5 space-y-3">
                <div className="h-4 rounded bg-slate-100" />
                <div className="h-4 rounded bg-slate-100" />
                <div className="h-4 rounded bg-slate-100" />
              </div>
            </div>
          </div>
        </Container>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <Container className="max-w-3xl!">
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
          <Link
            to="/news"
            className="mt-4 inline-block text-sm font-semibold text-sky-800 hover:text-[#0f1319]"
          >
            Volver al listado
          </Link>
        </Container>
      </section>
    )
  }

  if (!item) {
    return (
      <section>
        <Container className="max-w-3xl! text-center news-fade-up">
          <h1 className="text-2xl font-bold text-slate-900">Noticia no encontrada</h1>
          <p className="mt-4">
            <Link
              to="/news"
              className="font-semibold text-sky-800 hover:text-[#0f1319]"
            >
              Volver al listado de noticias
            </Link>
          </p>
        </Container>
      </section>
    )
  }

  const gallery = Array.isArray(item.galleryUrls) ? item.galleryUrls : []
  const reading = readingMinutes(item)
  const publishedHour = item.publishedAt
    ? new Date(item.publishedAt).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''
  const paragraphs = String(item.body || '')
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean)
  const leadParagraph = paragraphs[0] || ''
  const bodyParagraphs = paragraphs.slice(1)

  return (
    <article className="news-editorial pb-12">
      <Container className="max-w-[min(100%,84rem)]">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 xl:col-span-9">
            <p className="mb-6 text-sm">
              <Link to="/news" className="font-semibold text-sky-800 hover:text-[#0f1319]">
                Noticias
              </Link>
              <span className="mx-2 text-slate-400">/</span>
              <span className="font-medium text-slate-500">{item.category}</span>
            </p>
            <RevealOnScroll variant="slow">
              <header className="border-b border-slate-200 pb-6">
              <p className="flex flex-wrap items-center gap-2 text-sm text-slate-600 sm:gap-3">
                <span className="font-semibold uppercase tracking-wide text-sky-800">
                  {item.category}
                </span>
                <span className="text-slate-400">•</span>
                <time dateTime={item.publishedAt} className="tabular-nums">
                  {formatDate(item.publishedAt)}
                </time>
                {publishedHour ? (
                  <>
                    <span className="text-slate-400">•</span>
                    <span className="tabular-nums">{publishedHour}</span>
                  </>
                ) : null}
                <span className="text-slate-400">•</span>
                <span className="font-medium text-slate-700">{reading} minutos de lectura</span>
              </p>
              <h1 className="news-editorial-article-title mt-4 text-balance text-slate-900">
                {item.title}
              </h1>
              <p className="news-editorial-deck-lg mt-4 text-slate-600">
                {item.summary}
              </p>
              <button
                type="button"
                onClick={handleCopyLink}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#2a313b] bg-[#171b22] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#222831]"
              >
                {copied ? 'Enlace copiado' : 'Copiar enlace'}
              </button>
              </header>
            </RevealOnScroll>

            <RevealOnScroll variant="newsCardSlow" delayMs={90}>
              <div className="mt-7 overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
                <NewsCoverMedia
                  imageUrl={item.imageUrl}
                  className="aspect-video w-full max-h-[min(34rem,72vh)]"
                  imgClassName="object-center"
                  loading="eager"
                  iconScale="lg"
                />
              </div>
            </RevealOnScroll>

            <RevealOnScroll variant="slow" delayMs={140}>
              <div className="mt-8">
                {leadParagraph ? (
                  <p className="news-editorial-body leading-relaxed">{leadParagraph}</p>
                ) : null}
                <div className="news-editorial-body mt-5 space-y-5 leading-relaxed">
                  {bodyParagraphs.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            </RevealOnScroll>

            {gallery.length > 0 ? (
              <RevealOnScroll variant="newsCardSlow" delayMs={190}>
                <div className="mt-9 rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-6">
                  <h2 className="news-editorial-section-label text-[#4b505a]">
                    Galería fotográfica
                  </h2>
                  <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                    {gallery.map((url, i) => (
                      <li key={`${url}-${i}`}>
                        <button
                          type="button"
                          className="group flex w-full overflow-hidden rounded-xl border border-[#ddd7ca] bg-slate-100 shadow-sm transition hover:border-sky-200 hover:shadow-md"
                          onClick={() => setLightboxIndex(i)}
                        >
                          <img
                            src={resolveMediaUrl(url)}
                            alt=""
                            className="aspect-4/3 w-full object-cover transition group-hover:scale-[1.02]"
                            loading="lazy"
                            decoding="async"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealOnScroll>
            ) : null}

            <p className="mt-8">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 text-sm font-semibold text-sky-800 transition-colors hover:text-[#0f1319]"
              >
                <span aria-hidden>←</span> Volver a noticias
              </Link>
            </p>
          </div>

          <aside className="lg:col-span-4 xl:col-span-3">
            {related.length > 0 ? (
              <RevealOnScroll variant="slow" delayMs={120}>
                <div className="rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm">
                  <h2 className="news-editorial-sidebar-title text-[#4b505a]">
                    Más noticias
                  </h2>
                  <ul className="mt-4 space-y-4">
                    {related.map((n) => (
                      <li key={n.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                          {n.category}
                        </p>
                        <Link
                          to={`/news/${n.id}`}
                          className="mt-1 block text-sm font-semibold leading-snug text-slate-800 transition hover:text-[#0f1319]"
                        >
                          {n.title}
                        </Link>
                        <time
                          dateTime={n.publishedAt}
                          className="mt-1 block text-xs tabular-nums text-slate-500"
                        >
                          {formatDate(n.publishedAt)}
                        </time>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealOnScroll>
            ) : null}
          </aside>
        </div>
      </Container>

      {lightboxIndex !== null && gallery[lightboxIndex] ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada de imagen"
          onClick={() => setLightboxIndex(null)}
        >
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
            <button
              type="button"
              className="rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 sm:text-sm"
              onClick={() => setLightboxIndex(null)}
            >
              Cerrar
            </button>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
              {lightboxIndex + 1} / {gallery.length}
            </span>
          </div>
          {gallery.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Imagen anterior"
                className="absolute left-4 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((idx) => (idx - 1 + gallery.length) % gallery.length)
                }}
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Imagen siguiente"
                className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((idx) => (idx + 1) % gallery.length)
                }}
              >
                →
              </button>
            </>
          ) : null}
          <img
            src={resolveMediaUrl(gallery[lightboxIndex])}
            alt=""
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </article>
  )
}

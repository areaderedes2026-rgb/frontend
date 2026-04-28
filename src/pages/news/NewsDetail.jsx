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

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-3.5 w-3.5">
      <path
        d="M14.8 8.1h2.1V4.7h-2.4c-3.3 0-4.8 1.9-4.8 4.9v2H7.5v3.3h2.2v4.4h3.6v-4.4h2.6l.4-3.3h-3V10c0-1.1.3-1.9 1.5-1.9Z"
        fill="currentColor"
      />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-3.5 w-3.5">
      <path
        d="M20 11.8a8 8 0 1 0-14.4 4.7L4.5 20l3.6-1.1a8 8 0 0 0 3.9 1 8 8 0 0 0 8-8.1Z"
        fill="currentColor"
      />
      <path
        d="M9.2 8.9c.2-.5.4-.5.7-.5h.6c.2 0 .4 0 .5.4l.6 1.5c.1.2 0 .4-.1.6l-.4.5c-.1.1-.2.3 0 .6.3.6.9 1.4 2 2 .9.5 1.2.4 1.5.3l.7-.8c.2-.2.4-.2.6-.1l1.4.7c.2.1.4.2.4.4s0 .8-.3 1.2c-.3.4-1 .9-2.2.7-1.2-.2-2.6-.9-3.8-2s-1.9-2.6-2.1-3.8c-.2-1.3.4-1.9.7-2.2Z"
        fill="#0b1220"
      />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-3.5 w-3.5">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-3.5 w-3.5">
      <path
        d="M7 12a3 3 0 1 0-2.6-4.5l8.3 4.1A3 3 0 0 0 18 9a3 3 0 1 0-2.6 4.5l-8.3 4.1A3 3 0 1 0 7 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NewsDetailContent({ id }) {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [related, setRelated] = useState([])
  const [copied, setCopied] = useState(false)
  const [shareHint, setShareHint] = useState('')
  const [nativeShareAvailable, setNativeShareAvailable] = useState(false)

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

  useEffect(() => {
    if (!shareHint) return
    const t = setTimeout(() => setShareHint(''), 2200)
    return () => clearTimeout(t)
  }, [shareHint])

  useEffect(() => {
    if (typeof navigator === 'undefined') return
    setNativeShareAvailable(typeof navigator.share === 'function')
  }, [])

  async function handleCopyLink() {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  async function handleInstagramShare(newsTitle) {
    const url = window.location.href
    const text = `${newsTitle}\n${url}`
    try {
      await navigator.clipboard.writeText(text)
      setShareHint('Enlace copiado. Pegalo en Instagram.')
    } catch {
      setShareHint('No se pudo copiar el enlace.')
    }
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
  }

  async function handleNativeShare(newsTitle) {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return
    const url = window.location.href
    try {
      await navigator.share({
        title: newsTitle,
        text: newsTitle,
        url,
      })
    } catch {
      // Cancelado por usuario o no soportado por el navegador.
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
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `${item.title} - ${currentUrl}`.trim()
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

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
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <a
                  href={facebookShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-linear-to-br from-blue-600/90 via-blue-700/90 to-indigo-800/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5"
                >
                  <FacebookIcon />
                  Facebook
                </a>
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-linear-to-br from-emerald-600/90 via-emerald-700/90 to-emerald-800/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5"
                >
                  <WhatsAppIcon />
                  WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => handleInstagramShare(item.title)}
                  className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/40 bg-linear-to-br from-fuchsia-600/90 via-pink-600/90 to-violet-700/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5"
                >
                  <InstagramIcon />
                  Instagram
                </button>
                {nativeShareAvailable ? (
                  <button
                    type="button"
                    onClick={() => handleNativeShare(item.title)}
                    className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-linear-to-br from-sky-600/90 via-sky-700/90 to-cyan-800/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    <ShareIcon />
                    Compartir
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 rounded-full border border-[#2a313b] bg-[#171b22] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#222831]"
                >
                  {copied ? 'Enlace copiado' : 'Copiar enlace'}
                </button>
              </div>
              {shareHint ? (
                <p className="mt-2 text-xs font-medium text-sky-800">{shareHint}</p>
              ) : null}
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

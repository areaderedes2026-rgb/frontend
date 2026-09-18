import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_FDC_CONTENT, mergeFdcContent } from '../../data/fdcContent.js'
import { fetchFdcContent } from '../../services/fdcService.js'
import { preloadPublicRoute } from '../../routes/publicRoutePreload.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'
import { withCloudinaryTransform } from '../../utils/imageUrl.js'
import { Container } from '../ui/Container.jsx'

function HorseMark({ className = 'h-7 w-7' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M9.2 20.2c1.4-3.4 3.2-5.6 6.6-6.1 1.1-2.4 2.8-3.8 5.4-4.2.4 1.6-.1 3.1-1.1 4.2 2 .8 3.3 2.4 3.6 4.6-1.6-.2-2.8.1-3.8.9-.6 1.8-1.8 3.2-3.8 3.8-2.2.6-4.4-.2-6.9-3.2Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Acceso rápido a FDC desde inicio: franja angosta entre el hero municipal y las noticias.
 * No va dentro del hero para no mezclar banners de la ciudad con el festival.
 */
export function HomeFdcInvite() {
  const [page, setPage] = useState(DEFAULT_FDC_CONTENT)

  useEffect(() => {
    if (!isApiConfigured()) return undefined
    let cancelled = false
    fetchFdcContent()
      .then((remote) => {
        if (!cancelled) setPage(mergeFdcContent(DEFAULT_FDC_CONTENT, remote || {}))
      })
      .catch(() => {
        if (!cancelled) setPage(DEFAULT_FDC_CONTENT)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const title =
    String(page.heroTitle || '').trim() || 'Fiesta Nacional e Internacional del Caballo'
  const eyebrow = String(page.heroEyebrow || '').trim()
  const date = String(page.heroDateBadge || '').trim() || 'Edición 2026'
  const imageUrl = String(page.heroImageUrl || page.heroImageUrlMobile || '').trim()
  const bgSrc = imageUrl
    ? withCloudinaryTransform(imageUrl, 'f_auto,q_auto:eco,c_fill,g_auto,w_1400') || imageUrl
    : ''

  return (
    <Link
      to={ROUTES.fiestaDelCaballo}
      onMouseEnter={() => preloadPublicRoute('fdc')}
      onFocus={() => preloadPublicRoute('fdc')}
      className="group relative isolate block overflow-hidden bg-[#0c1017] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d4b483]"
      aria-label={`Ir a ${title}`}
    >
      {bgSrc ? (
        <img
          src={bgSrc}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.18] transition duration-700 group-hover:scale-[1.03] group-hover:opacity-[0.26]"
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#0c1017] via-[#0c1017]/88 to-[#0c1017]/70"
        aria-hidden
      />

      <Container className="relative z-10">
        <div className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="hidden text-[#d4b483] sm:inline-flex">
              <HorseMark className="h-8 w-8" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d4b483] sm:text-[11px]">
                FDC
                {eyebrow ? (
                  <span className="hidden sm:inline">{` · ${eyebrow}`}</span>
                ) : null}
              </p>
              <p className="mt-0.5 truncate font-serif text-lg font-bold tracking-tight text-white sm:text-xl">
                {title}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end sm:gap-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 sm:text-xs">
              {date}
            </p>
            <span className="inline-flex min-h-10 items-center rounded-full bg-[#d4b483] px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#171b22] transition group-hover:bg-[#e2c28a] sm:min-h-11 sm:px-5 sm:text-xs">
              Ir al festival
              <span className="ml-1.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
                →
              </span>
            </span>
          </div>
        </div>
      </Container>
    </Link>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fdcVisitDirectionsHasContent,
  fdcVisitFaqHasContent,
} from '../../data/fdcContent.js'
import { FdcVisitMap } from './FdcVisitMap.jsx'
import { useFdcSectionTone } from './FdcSectionToneContext.jsx'
import { FdcSectionTitle } from './FdcFestivalSections.jsx'

function SmartLink({ href, className, children, ...rest }) {
  const target = String(href || '').trim() || '#'
  if (target.startsWith('http://') || target.startsWith('https://')) {
    return (
      <a href={target} className={className} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    )
  }
  if (target.startsWith('#')) {
    return (
      <a href={target} className={className} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <Link to={target} className={className} {...rest}>
      {children}
    </Link>
  )
}

function PinIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
    </svg>
  )
}

function LocationsPanel({ points, activePointId, onSelect, dark }) {
  return (
    <aside className="flex min-w-0 flex-col">
      <p
        className={`mb-3 text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px] ${
          dark ? 'text-[#d4b483]' : 'text-[#8a7048]'
        }`}
      >
        Ubicaciones
      </p>
      <ul
        className={`flex max-h-[22rem] flex-col gap-2 overflow-y-auto pr-1 sm:max-h-[26rem] ${
          dark ? '[scrollbar-color:rgba(255,255,255,0.25)_transparent]' : ''
        }`}
        role="listbox"
        aria-label="Ubicaciones del festival"
      >
        {points.map((point) => {
          const active = point.id === activePointId
          return (
            <li key={point.id}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onSelect(point.id)}
                className={`flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition sm:px-4 sm:py-3.5 ${
                  active
                    ? dark
                      ? 'border-[#d4b483]/60 bg-white/10 shadow-[0_10px_28px_-18px_rgba(0,0,0,0.55)]'
                      : 'border-[#171b22] bg-[#171b22] text-white shadow-[0_14px_32px_-20px_rgba(23,27,34,0.55)]'
                    : dark
                      ? 'border-white/12 bg-white/[0.04] text-white/90 hover:border-white/25 hover:bg-white/[0.08]'
                      : 'border-[#e8e4dc] bg-white text-[#171b22] hover:border-[#d4b483]/70 hover:bg-[#faf8f4]'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    active
                      ? dark
                        ? 'bg-[#d4b483]/20 text-[#d4b483]'
                        : 'bg-white/15 text-[#d4b483]'
                      : dark
                        ? 'bg-white/8 text-[#d4b483]'
                        : 'bg-[#171b22]/[0.06] text-[#171b22]'
                  }`}
                  aria-hidden
                >
                  <PinIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block font-serif text-[15px] font-bold leading-snug sm:text-base ${
                      active && !dark ? 'text-white' : ''
                    }`}
                  >
                    {point.title}
                  </span>
                  {point.subtitle ? (
                    <span
                      className={`mt-0.5 block text-xs font-medium ${
                        active
                          ? dark
                            ? 'text-white/70'
                            : 'text-white/75'
                          : dark
                            ? 'text-white/55'
                            : 'text-[#6b7280]'
                      }`}
                    >
                      {point.subtitle}
                    </span>
                  ) : null}
                  {point.address ? (
                    <span
                      className={`mt-1 block text-xs leading-relaxed ${
                        active
                          ? dark
                            ? 'text-white/65'
                            : 'text-white/70'
                          : dark
                            ? 'text-white/45'
                            : 'text-[#4b505a]'
                      }`}
                    >
                      {point.address}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

function FaqAccordion({ items, dark }) {
  const [openId, setOpenId] = useState(items[0]?.id ?? null)
  const safeOpenId = items.some((item) => item.id === openId) ? openId : (items[0]?.id ?? null)

  return (
    <ul className={`divide-y ${dark ? 'divide-white/15' : 'divide-[#e8e4dc]/90'}`}>
      {items.map((item) => {
        const open = safeOpenId === item.id
        const hasAnswer = Boolean(String(item.answer || '').trim())
        return (
          <li key={item.id}>
            <button
              type="button"
              id={`fdc-faq-btn-${item.id}`}
              aria-expanded={open}
              aria-controls={`fdc-faq-panel-${item.id}`}
              onClick={() => setOpenId(open ? null : item.id)}
              className={`flex w-full items-start justify-between gap-4 py-4 text-left transition ${
                dark ? 'text-white hover:text-white/90' : 'text-[#171b22] hover:text-[#2a313b]'
              }`}
            >
              <span className="font-serif text-base font-semibold leading-snug sm:text-[17px]">
                {item.question}
              </span>
              {hasAnswer ? (
                <span
                  className={`mt-1 shrink-0 text-lg leading-none transition ${open ? 'rotate-45' : ''}`}
                  aria-hidden
                >
                  +
                </span>
              ) : null}
            </button>
            {hasAnswer ? (
              <div
                id={`fdc-faq-panel-${item.id}`}
                role="region"
                aria-labelledby={`fdc-faq-btn-${item.id}`}
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <p
                    className={`pb-4 text-sm leading-relaxed sm:text-[15px] ${
                      dark ? 'text-white/80' : 'text-[#4b505a]'
                    }`}
                  >
                    {item.answer}
                  </p>
                </div>
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

/** Sección pública: Mapa interactivo (lista de ubicaciones + mapa). */
export function FdcMapInteractiveSection({ visitInfo }) {
  const { titleTone, usesDarkTone: dark } = useFdcSectionTone(visitInfo)
  const directions = visitInfo?.directions || {}
  const points = useMemo(
    () =>
      (directions.points || [])
        .filter(
          (p) =>
            p?.isActive !== false &&
            Number.isFinite(Number(p?.lat)) &&
            Number.isFinite(Number(p?.lng)) &&
            (String(p?.title || '').trim() || String(p?.address || '').trim()),
        )
        .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)),
    [directions.points],
  )

  const [activePointId, setActivePointId] = useState('')

  useEffect(() => {
    if (!points.length) {
      setActivePointId('')
      return
    }
    setActivePointId((prev) =>
      points.some((p) => p.id === prev) ? prev : points[0].id,
    )
  }, [points])

  if (!fdcVisitDirectionsHasContent(visitInfo) || points.length === 0) return null

  const sectionTitle = String(directions.title || 'Mapa interactivo').trim()
  const showTitle = directions.showTitle !== false && Boolean(sectionTitle)
  const center = directions.center || {
    lat: Number(points[0]?.lat) || -26.2312,
    lng: Number(points[0]?.lng) || -65.2818,
  }
  const zoom = Number(directions.zoom) || 14

  return (
    <div>
      {showTitle ? <FdcSectionTitle title={sectionTitle} tone={titleTone} /> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.4fr)] lg:items-stretch xl:gap-8">
        <LocationsPanel
          points={points}
          activePointId={activePointId}
          onSelect={setActivePointId}
          dark={dark}
        />
        <FdcVisitMap
          center={center}
          zoom={zoom}
          points={points}
          activePointId={activePointId}
          onSelectPoint={setActivePointId}
          dark={dark}
        />
      </div>
    </div>
  )
}

/** Sección pública: Preguntas frecuentes. */
export function FdcFaqSection({ visitInfo }) {
  if (!fdcVisitFaqHasContent(visitInfo)) return null

  const faq = visitInfo?.faq || {}
  const faqToneConfig = {
    backgroundStyle: faq.backgroundStyle ?? visitInfo?.backgroundStyle,
    backgroundImageUrl: faq.backgroundImageUrl ?? '',
    overlayOpacity: faq.overlayOpacity ?? visitInfo?.overlayOpacity,
  }
  const { titleTone, usesDarkTone: dark } = useFdcSectionTone(faqToneConfig)
  const faqItems = (faq.items || []).filter((f) => f?.question)
  const ctaLabel = String(faq.ctaLabel || '').trim()
  const ctaHref = String(faq.ctaHref || '').trim()
  const sectionTitle = String(faq.title || 'Preguntas frecuentes').trim()
  const showTitle = faq.showTitle !== false && Boolean(sectionTitle)

  const faqCtaClass = dark
    ? 'inline-flex min-h-11 items-center justify-center rounded-sm border border-white/75 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-[#171b22] sm:text-xs'
    : 'inline-flex min-h-11 items-center justify-center rounded-sm border border-[#d4b483] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#171b22] transition hover:bg-[#d4b483]/10 sm:text-xs'

  return (
    <div className="mx-auto max-w-3xl">
      {showTitle ? <FdcSectionTitle title={sectionTitle} tone={titleTone} /> : null}
      <FaqAccordion items={faqItems} dark={dark} />
      {ctaLabel && ctaHref ? (
        <div className="mt-6 flex justify-center">
          <SmartLink href={ctaHref} className={faqCtaClass}>
            {ctaLabel}
          </SmartLink>
        </div>
      ) : ctaLabel ? (
        <div className="mt-6 flex justify-center">
          <span className={`${faqCtaClass} cursor-default opacity-80`}>{ctaLabel}</span>
        </div>
      ) : null}
    </div>
  )
}

/** Vista previa admin: ambas secciones apiladas. */
export function FdcVisitInfoSection({ visitInfo }) {
  const showMap = fdcVisitDirectionsHasContent(visitInfo)
  const showFaq = fdcVisitFaqHasContent(visitInfo)
  if (!showMap && !showFaq) return null

  return (
    <div className="space-y-10">
      {showMap ? <FdcMapInteractiveSection visitInfo={visitInfo} /> : null}
      {showFaq ? <FdcFaqSection visitInfo={visitInfo} /> : null}
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fdcVisitInfoHasContent } from '../../data/fdcContent.js'
import { resolveFdcVisitMapCoords } from '../../utils/fdcVisitMap.js'
import { FdcVisitMap } from './FdcVisitMap.jsx'
import { useFdcSectionTone } from './FdcSectionToneContext.jsx'

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

function BlockTitle({ title, showTitle, dark, className = '' }) {
  const text = String(title || '').trim()
  if (!showTitle || !text) return null
  return (
    <h2
      className={`font-serif text-lg font-bold uppercase tracking-[0.06em] sm:text-xl lg:text-2xl ${
        dark ? 'text-white' : 'text-[#171b22]'
      } ${className}`.trim()}
    >
      {text}
    </h2>
  )
}

function PinIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
    </svg>
  )
}

function ExternalMapIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H18v4.5M18 6l-7.5 7.5M10.5 6H6a1.5 1.5 0 0 0-1.5 1.5v10.5A1.5 1.5 0 0 0 6 19.5h10.5a1.5 1.5 0 0 0 1.5-1.5V13"
      />
    </svg>
  )
}

function splitVenueAddress(address) {
  const raw = String(address || '').trim()
  if (!raw) return { venue: '', detail: '' }
  const parts = raw.split(',').map((part) => part.trim()).filter(Boolean)
  if (parts.length <= 1) return { venue: raw, detail: '' }
  return { venue: parts[0], detail: raw }
}

function DirectionsPanel({ directions, address, mapUrl, mapButtonLabel, dark }) {
  const { venue, detail } = splitVenueAddress(address)
  const showDetail = Boolean(detail && detail.toLowerCase() !== venue.toLowerCase())

  const cardClass = dark
    ? 'border-white/12 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
    : 'border-[#e8e4dc] bg-white shadow-[0_14px_36px_-28px_rgba(23,27,34,0.35)] ring-1 ring-[#171b22]/[0.04]'
  const venueClass = dark ? 'text-white' : 'text-[#171b22]'
  const detailClass = dark ? 'text-white/75' : 'text-[#4b505a]'
  const pinBadgeClass = dark
    ? 'bg-[#d4b483]/15 text-[#d4b483] ring-1 ring-[#d4b483]/30'
    : 'bg-[#171b22] text-[#d4b483] ring-1 ring-[#171b22]/10'
  const mapBtnClass = dark
    ? 'border border-white/20 bg-white/10 text-white hover:border-white/35 hover:bg-white/15'
    : 'border border-[#171b22] bg-[#171b22] text-white hover:bg-[#2a313b] hover:border-[#2a313b]'

  const titleGap =
    directions.showTitle !== false && String(directions.title || '').trim()
      ? 'mt-4 sm:mt-5'
      : ''

  return (
    <aside className="flex min-w-0 flex-col lg:max-w-[13.5rem] xl:max-w-[14.5rem]">
      <BlockTitle
        title={directions.title}
        showTitle={directions.showTitle !== false}
        dark={dark}
      />

      <div className={`${titleGap} flex flex-col gap-4`}>
        {address ? (
          <div className={`rounded-2xl border p-4 sm:p-[1.125rem] ${cardClass}`}>
            <div className="flex items-start gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${pinBadgeClass}`}
                aria-hidden
              >
                <PinIcon className="h-[1.125rem] w-[1.125rem]" />
              </span>
              <div className="min-w-0 pt-0.5">
                {venue ? (
                  <p className={`font-serif text-[1.05rem] font-bold leading-snug sm:text-lg ${venueClass}`}>
                    {venue}
                  </p>
                ) : null}
                {showDetail ? (
                  <p className={`mt-1.5 text-xs leading-relaxed sm:text-[13px] ${detailClass}`}>{detail}</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {mapUrl ? (
          <SmartLink
            href={mapUrl}
            className={`group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] transition sm:text-[11px] ${mapBtnClass}`}
          >
            <ExternalMapIcon className="h-3.5 w-3.5 shrink-0 opacity-90 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span className="truncate">{mapButtonLabel}</span>
          </SmartLink>
        ) : null}
      </div>
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

export function FdcVisitInfoSection({ visitInfo }) {
  if (!fdcVisitInfoHasContent(visitInfo)) return null

  const { usesDarkTone: dark } = useFdcSectionTone(visitInfo)
  const directions = visitInfo?.directions || {}
  const faq = visitInfo?.faq || {}
  const faqItems = (faq.items || []).filter((f) => f?.question)

  const address = String(directions.address || '').trim()
  const mapUrl = String(directions.mapUrl || '').trim()
  const mapButtonLabel = String(directions.mapButtonLabel || '').trim() || 'Ver en mapa'
  const ctaLabel = String(faq.ctaLabel || '').trim()
  const ctaHref = String(faq.ctaHref || '').trim()
  const mapCoords = resolveFdcVisitMapCoords(directions)
  const hasDirections = Boolean(address || mapUrl || mapCoords)
  const hasFaq = faqItems.length > 0
  const showMap = Number.isFinite(mapCoords.lat) && Number.isFinite(mapCoords.lng)

  const faqCtaClass = dark
    ? 'inline-flex min-h-11 items-center justify-center rounded-sm border border-white/75 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-[#171b22] sm:text-xs'
    : 'inline-flex min-h-11 items-center justify-center rounded-sm border border-[#d4b483] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#171b22] transition hover:bg-[#d4b483]/10 sm:text-xs'

  const gridClass =
    hasDirections && showMap && hasFaq
      ? 'lg:grid-cols-[minmax(11rem,0.62fr)_minmax(0,1.48fr)_minmax(0,1.15fr)]'
      : hasDirections && showMap
        ? 'lg:grid-cols-[minmax(11rem,0.65fr)_minmax(0,1fr)]'
        : hasDirections && hasFaq
          ? 'lg:grid-cols-[minmax(11rem,0.65fr)_minmax(0,1fr)]'
          : 'mx-auto max-w-3xl'

  const venueLabel = splitVenueAddress(address).venue || address

  return (
    <div className={`grid gap-8 xl:gap-10 ${gridClass}`}>
      {hasDirections ? (
        <DirectionsPanel
          directions={directions}
          address={address}
          mapUrl={mapUrl}
          mapButtonLabel={mapButtonLabel}
          dark={dark}
        />
      ) : null}

      {showMap ? (
        <div className="min-w-0 lg:min-h-[17.5rem]">
          <FdcVisitMap
            center={mapCoords}
            zoom={mapCoords.zoom}
            label={venueLabel}
            address={address}
            dark={dark}
          />
        </div>
      ) : null}

      {hasFaq ? (
        <div className="min-w-0">
          <BlockTitle title={faq.title} showTitle={faq.showTitle !== false} dark={dark} />
          <div className={faq.showTitle !== false && String(faq.title || '').trim() ? 'mt-4 sm:mt-5' : ''}>
            <FaqAccordion items={faqItems} dark={dark} />
            {ctaLabel && ctaHref ? (
              <div className="mt-6 flex justify-center lg:justify-start">
                <SmartLink href={ctaHref} className={faqCtaClass}>
                  {ctaLabel}
                </SmartLink>
              </div>
            ) : ctaLabel ? (
              <div className="mt-6 flex justify-center lg:justify-start">
                <span className={`${faqCtaClass} cursor-default opacity-80`}>{ctaLabel}</span>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

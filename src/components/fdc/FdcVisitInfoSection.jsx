import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { useFdcSectionTone } from './FdcSectionToneContext.jsx'
import { fdcVisitInfoHasContent } from '../../data/fdcContent.js'

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

function BlockTitle({ title, showTitle, dark }) {
  const text = String(title || '').trim()
  if (!showTitle || !text) return null
  return (
    <h2
      className={`font-serif text-xl font-bold uppercase tracking-[0.06em] sm:text-2xl ${
        dark ? 'text-white' : 'text-[#171b22]'
      }`}
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
  const mapImageSrc =
    resolveMediaUrl(directions.mapImageUrl) || String(directions.mapImageUrl || '').trim()
  const ctaLabel = String(faq.ctaLabel || '').trim()
  const ctaHref = String(faq.ctaHref || '').trim()

  const hasDirections = Boolean(address || mapUrl || mapImageSrc)
  const hasFaq = faqItems.length > 0

  const textMuted = dark ? 'text-white/80' : 'text-[#4b505a]'
  const mapBtnClass =
    'inline-flex min-h-11 items-center justify-center rounded-sm bg-[#171b22] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-black sm:text-xs'
  const faqCtaClass = dark
    ? 'inline-flex min-h-11 items-center justify-center rounded-sm border border-white/75 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-[#171b22] sm:text-xs'
    : 'inline-flex min-h-11 items-center justify-center rounded-sm border border-[#d4b483] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#171b22] transition hover:bg-[#d4b483]/10 sm:text-xs'

  return (
    <div
      className={`grid gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16 ${
        hasDirections && hasFaq ? '' : 'mx-auto max-w-3xl'
      }`}
    >
      {hasDirections ? (
        <div>
          <BlockTitle
            title={directions.title}
            showTitle={directions.showTitle !== false}
            dark={dark}
          />
          <div
            className={`${directions.showTitle !== false && String(directions.title || '').trim() ? 'mt-5' : ''} flex flex-col gap-6 md:flex-row md:items-start md:gap-5 lg:gap-6`}
          >
            <div className="min-w-0 flex-1">
              {address ? (
                <p className={`flex items-start gap-2.5 text-sm leading-relaxed sm:text-[15px] ${textMuted}`}>
                  <PinIcon className={`mt-0.5 shrink-0 ${dark ? 'text-[#d4b483]' : 'text-[#171b22]'}`} />
                  <span>{address}</span>
                </p>
              ) : null}
              {mapUrl ? (
                <SmartLink href={mapUrl} className={`${address ? 'mt-5' : ''} ${mapBtnClass}`}>
                  {mapButtonLabel}
                </SmartLink>
              ) : null}
            </div>
            {mapImageSrc ? (
              <div className="mx-auto w-full max-w-[15.5rem] shrink-0 overflow-hidden rounded-xl shadow-[0_16px_40px_-24px_rgba(23,27,34,0.45)] ring-1 ring-[#e8e4dc]/80 md:mx-0">
                {mapUrl ? (
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                      src={mapImageSrc}
                      alt="Ubicación en mapa"
                      className="aspect-[4/3] h-full w-full object-cover transition hover:scale-[1.02]"
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                ) : (
                  <img
                    src={mapImageSrc}
                    alt="Ubicación en mapa"
                    className="aspect-[4/3] h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
            ) : mapUrl ? (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`mx-auto flex aspect-[4/3] w-full max-w-[15.5rem] shrink-0 flex-col items-center justify-center rounded-xl border border-dashed px-4 text-center ${
                  dark
                    ? 'border-white/25 bg-white/5 text-white/70 hover:bg-white/10'
                    : 'border-[#ddd7ca] bg-[#efe8dc]/50 text-[#4b505a] hover:bg-[#efe8dc]'
                } md:mx-0`}
              >
                <PinIcon className={`mb-2 h-8 w-8 ${dark ? 'text-[#d4b483]' : 'text-[#171b22]/70'}`} />
                <span className="text-xs font-semibold uppercase tracking-wide">Abrir mapa</span>
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {hasFaq ? (
        <div>
          <BlockTitle title={faq.title} showTitle={faq.showTitle !== false} dark={dark} />
          <div className={faq.showTitle !== false && String(faq.title || '').trim() ? 'mt-5' : ''}>
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

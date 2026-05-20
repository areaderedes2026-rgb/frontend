import { Link } from 'react-router-dom'
import { MunicipalServiceIcon } from './MunicipalServiceIcon.jsx'
import { ROUTES } from '../../utils/constants.js'

function resolveHref(href) {
  const value = String(href || '').trim()
  if (!value) return ROUTES.atencionCiudadano
  if (value.startsWith('#') || value.startsWith('http')) return value
  return value.startsWith('/') ? value : `/${value}`
}

function isExternalHref(href) {
  return String(href || '').startsWith('http')
}

function CardInner({ service }) {
  const href = resolveHref(service.linkHref)
  const meta = [service.mode, service.eta].filter(Boolean).join(' · ')

  const body = (
    <>
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-600 ring-1 ring-sky-100/80 transition duration-500 group-hover:scale-110 group-hover:bg-sky-100 group-hover:ring-sky-200/90">
        <MunicipalServiceIcon service={service} className="h-7 w-7" />
      </span>
      <h3 className="mt-5 text-base font-bold leading-snug tracking-tight text-[#171b22] transition-colors duration-300 group-hover:text-sky-900 sm:text-[1.05rem]">
        {service.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#5c6370]">
        {service.summary}
      </p>
      {meta ? (
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 transition-colors duration-300 group-hover:text-sky-700/80">
          {meta}
        </p>
      ) : null}
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 opacity-0 transition-all duration-300 group-hover:opacity-100">
        Consultar
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </>
  )

  const className =
    'group flex h-full min-h-[220px] flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-5 py-7 text-center shadow-[0_8px_30px_-18px_rgba(15,23,42,0.25)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-sky-200/70 hover:shadow-[0_20px_48px_-22px_rgba(14,116,190,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 sm:min-h-[240px] sm:px-6 sm:py-8'

  if (isExternalHref(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {body}
      </a>
    )
  }

  if (href.startsWith('#')) {
    return (
      <a href={href} className={className}>
        {body}
      </a>
    )
  }

  return (
    <Link to={href} className={className}>
      {body}
    </Link>
  )
}

export function MunicipalServiceCard({ service, as: Wrapper = 'article' }) {
  return (
    <Wrapper className="h-full list-none">
      <CardInner service={service} />
    </Wrapper>
  )
}

export function MunicipalServiceCardSkeleton() {
  return (
    <div className="flex min-h-[220px] animate-pulse flex-col items-center rounded-2xl border border-slate-200/80 bg-white px-5 py-7 sm:min-h-[240px] sm:px-6 sm:py-8">
      <div className="h-14 w-14 rounded-full bg-slate-100" />
      <div className="mt-5 h-5 w-3/4 rounded-lg bg-slate-100" />
      <div className="mt-3 h-4 w-full rounded bg-slate-50" />
      <div className="mt-2 h-4 w-5/6 rounded bg-slate-50" />
    </div>
  )
}

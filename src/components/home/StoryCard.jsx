import { Link } from 'react-router-dom'

export function StoryCard({
  title,
  text,
  to,
  cta = 'Ver más',
  badge = '',
  className = '',
}) {
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-6 shadow-sm ring-1 ring-[#1a1d24]/5 transition-all duration-500 hover:-translate-y-1 hover:border-sky-200/90 hover:shadow-lg hover:shadow-sky-500/10 ${className}`.trim()}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-sky-300/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {badge ? (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-800">{badge}</p>
      ) : null}
      <h3 className="text-lg font-semibold tracking-tight text-[#171b22]">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#4b505a]">{text}</p>
      <Link
        to={to}
        className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-sky-800 transition-colors hover:text-[#171b22]"
      >
        {cta}
        <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
          →
        </span>
      </Link>
    </article>
  )
}

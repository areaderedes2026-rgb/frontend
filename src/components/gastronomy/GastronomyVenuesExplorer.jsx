import { useMemo, useState } from 'react'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'
import { NewsCoverMedia } from '../news/NewsCoverMedia.jsx'

function digitsOnly(value) {
  return String(value || '').replace(/[^\d+]/g, '')
}

function telHref(phone) {
  const digits = digitsOnly(phone)
  return digits ? `tel:${digits}` : null
}

function whatsappHref(whatsapp, phone) {
  const raw = digitsOnly(whatsapp || phone)
  if (!raw) return null
  const number = raw.startsWith('+') ? raw.slice(1) : raw
  if (!number) return null
  return `https://wa.me/${number}`
}

function instagramHref(value) {
  const raw = String(value || '').trim()
  if (!raw) return null
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  const handle = raw.replace(/^@/, '')
  if (!handle) return null
  return `https://instagram.com/${handle}`
}

function PinIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  )
}

function PhoneIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  )
}

function ClockIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function ActionLink({ href, children, external = false }) {
  if (!href) return null
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="inline-flex items-center gap-1 rounded-full border border-[#ddd7ca] bg-white px-3 py-1.5 text-xs font-semibold text-[#171b22] transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900"
    >
      {children}
    </a>
  )
}

function VenueCard({ venue, featured = false }) {
  const call = telHref(venue.phone)
  const wa = whatsappHref(venue.whatsapp, venue.phone)
  const ig = instagramHref(venue.instagram)
  const maps = String(venue.mapsUrl || '').trim() || null
  return (
    <article
      id={`local-${venue.id}`}
      className={`group flex h-full scroll-mt-[calc(var(--navbar-h,5rem)+1.25rem)] flex-col overflow-hidden rounded-3xl border border-[#ddd7ca] bg-white shadow-sm ring-1 ring-[#1a1d24]/5 transition duration-500 hover:-translate-y-1 hover:border-sky-200/80 hover:shadow-[0_24px_64px_-34px_rgba(2,132,199,0.22)] ${
        featured ? 'sm:flex-row' : ''
      }`}
    >
      <div className={`relative shrink-0 overflow-hidden ${featured ? 'sm:w-[46%]' : ''}`}>
        <NewsCoverMedia
          imageUrl={venue.imageUrl}
          className={featured ? 'aspect-16/10 w-full sm:aspect-auto sm:h-full' : 'aspect-16/10 w-full'}
          imgClassName="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/50 via-transparent to-transparent"
          aria-hidden
        />
        <span className="absolute left-3 top-3 inline-flex rounded-full border border-white/25 bg-slate-950/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
          {venue.category || 'Local'}
        </span>
      </div>

      <div className={`flex flex-1 flex-col p-5 ${featured ? 'sm:p-7' : 'sm:p-6'}`}>
        <h3 className={`font-serif font-bold tracking-tight text-[#171b22] ${featured ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
          {venue.name}
        </h3>

        <div className="mt-3 space-y-1.5 text-sm text-[#4b505a]">
          {venue.location ? (
            <p className="flex items-start gap-2">
              <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-800" />
              <span>{venue.location}</span>
            </p>
          ) : null}
          {venue.phone ? (
            <p className="flex items-start gap-2">
              <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-800" />
              <span className="tabular-nums">{venue.phone}</span>
            </p>
          ) : null}
          {venue.hours ? (
            <p className="flex items-start gap-2">
              <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-800" />
              <span>{venue.hours}</span>
            </p>
          ) : null}
        </div>

        {venue.description ? (
          <p className={`mt-3 text-sm leading-relaxed text-[#4b505a] ${featured ? '' : 'line-clamp-4'}`}>
            {venue.description}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <ActionLink href={call}>Llamar</ActionLink>
          <ActionLink href={wa} external>
            WhatsApp
          </ActionLink>
          <ActionLink href={maps} external>
            Cómo llegar
          </ActionLink>
          <ActionLink href={ig} external>
            Instagram
          </ActionLink>
        </div>
      </div>
    </article>
  )
}

export function GastronomyVenuesExplorer({
  categories = [],
  venues = [],
  searchPlaceholder = 'Buscar por nombre, barrio o tipo…',
  searchQuery = '',
  onSearchChange,
}) {
  const [activeCategory, setActiveCategory] = useState(categories[0] || 'Todos')
  const query = searchQuery

  const cats = categories.length ? categories : ['Todos']
  const effectiveCategory = cats.includes(activeCategory) ? activeCategory : cats[0]

  const filtered = useMemo(() => {
    const q = String(query || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    return venues.filter((venue) => {
      if (effectiveCategory && effectiveCategory !== 'Todos' && venue.category !== effectiveCategory) {
        return false
      }
      if (!q) return true
      const haystack = [venue.name, venue.category, venue.location, venue.description, venue.phone]
        .join(' ')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      return haystack.includes(q)
    })
  }, [effectiveCategory, query, venues])

  const featured = filtered[0] || null
  const rest = filtered.slice(1)

  function handleQuery(value) {
    onSearchChange?.(value)
  }

  return (
    <div id="catalogo-locales" className="scroll-mt-[calc(var(--navbar-h)+1rem)]">
      <RevealOnScroll variant="slow">
        <div className="flex flex-col gap-3 border-b border-[#ddd7ca] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">Directorio</p>
            <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
              Locales gastronómicos
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#4b505a]">
              Filtrá por tipo o buscá por nombre. Tocá llamar, WhatsApp o cómo llegar para contactar al local.
            </p>
          </div>
          <p className="text-sm font-semibold text-[#171b22]">
            {filtered.length} {filtered.length === 1 ? 'propuesta' : 'propuestas'}
          </p>
        </div>
      </RevealOnScroll>

      <RevealOnScroll variant="newsCardSlow" delayMs={40}>
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {cats.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  cat === effectiveCategory
                    ? 'bg-[#171b22] text-white shadow-sm'
                    : 'border border-[#d8d5cd] bg-white text-[#3e434d] hover:border-sky-200 hover:text-[#171b22]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Buscar locales</span>
            <input
              type="search"
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-full border border-[#d6d0c3] bg-white py-2.5 pr-4 pl-4 text-sm text-[#171b22] shadow-sm transition placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200/80"
            />
          </label>
        </div>
      </RevealOnScroll>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#d8d5cd] bg-[#f8f7f3] px-5 py-12 text-center">
          <p className="font-serif text-lg font-semibold text-[#171b22]">No hay locales para mostrar</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#5c6169]">
            Probá otra categoría o buscá con otra palabra. El directorio se actualiza desde el panel municipal.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {featured ? (
            <RevealOnScroll variant="slow">
              <VenueCard venue={featured} featured />
            </RevealOnScroll>
          ) : null}
          {rest.length > 0 ? (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {rest.map((venue, idx) => (
                <li key={venue.id} className="h-full">
                  <RevealOnScroll variant="newsCardSlow" delayMs={Math.min(idx * 70, 280)} className="h-full">
                    <VenueCard venue={venue} />
                  </RevealOnScroll>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  )
}

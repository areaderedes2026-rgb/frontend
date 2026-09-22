import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion as Motion } from 'motion/react'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'
import { NewsCoverMedia } from '../news/NewsCoverMedia.jsx'
import { gastronomyVenueHasMapPoint } from '../../data/gastronomicCatalogContent.js'

const ease = [0.22, 1, 0.36, 1]

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

function normalizeQuery(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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

function SearchIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  )
}

function venueContacts(venue) {
  return {
    call: telHref(venue.phone),
    wa: whatsappHref(venue.whatsapp, venue.phone),
    ig: instagramHref(venue.instagram),
    maps: String(venue.mapsUrl || '').trim() || null,
  }
}

function ActionLink({ href, children, external = false }) {
  if (!href) return null
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex min-h-9 items-center rounded-full border border-[#ddd7ca] bg-white px-3 py-1.5 text-xs font-semibold text-[#171b22] transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900"
    >
      {children}
    </a>
  )
}

function MapActionButton({ onClick }) {
  if (!onClick) return null
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="inline-flex min-h-9 items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900 transition hover:border-sky-300 hover:bg-sky-100"
    >
      Ver en el mapa
    </button>
  )
}

function VenueDetailSheet({ venue, onClose, onShowOnMap }) {
  const titleId = useId()
  const closeRef = useRef(null)
  const contacts = venueContacts(venue)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const id = requestAnimationFrame(() => closeRef.current?.focus())
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      cancelAnimationFrame(id)
    }
  }, [onClose])

  return (
    <Motion.div
      className="fixed inset-0 z-[150] flex items-end justify-center p-0 sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="Cerrar ficha del local"
        onClick={onClose}
      />
      <Motion.div
        className="relative z-10 flex max-h-[min(92dvh,44rem)] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-lg sm:rounded-2xl"
        initial={{ y: 28, opacity: 0.96 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ duration: 0.32, ease }}
      >
        <div className="relative shrink-0">
          <NewsCoverMedia
            imageUrl={venue.imageUrl}
            className="aspect-16/10 w-full"
            imgClassName="h-full w-full object-cover"
            loading="eager"
            iconScale="lg"
          />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#171b22]/55 text-white backdrop-blur-sm transition hover:bg-[#171b22]/75"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {venue.category ? (
            <p className="text-[11px] font-bold uppercase tracking-wide text-sky-800">{venue.category}</p>
          ) : null}
          <h3 id={titleId} className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#171b22]">
            {venue.name}
          </h3>
          <div className="mt-3 space-y-2 text-sm text-[#4b505a]">
            {venue.location ? (
              <p className="flex gap-2">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-800" />
                <span>{venue.location}</span>
              </p>
            ) : null}
            {venue.hours ? (
              <p className="flex gap-2">
                <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-800" />
                <span>{venue.hours}</span>
              </p>
            ) : null}
            {venue.phone ? (
              <p className="flex gap-2">
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-800" />
                <span className="tabular-nums">{venue.phone}</span>
              </p>
            ) : null}
          </div>
          {venue.description ? (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#4b505a]">{venue.description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-[#ddd7ca] bg-white px-5 py-4 sm:px-6">
          {gastronomyVenueHasMapPoint(venue) ? (
            <MapActionButton
              onClick={() => {
                onClose()
                onShowOnMap?.(venue)
              }}
            />
          ) : null}
          <ActionLink href={contacts.call}>Llamar</ActionLink>
          <ActionLink href={contacts.wa} external>
            WhatsApp
          </ActionLink>
          <ActionLink href={contacts.maps} external>
            Cómo llegar
          </ActionLink>
          <ActionLink href={contacts.ig} external>
            Instagram
          </ActionLink>
        </div>
      </Motion.div>
    </Motion.div>
  )
}

function VenueCard({ venue, index, onOpen, onShowOnMap }) {
  const contacts = venueContacts(venue)
  const showOnMap = gastronomyVenueHasMapPoint(venue) ? () => onShowOnMap?.(venue) : null
  const hasActions = contacts.call || contacts.wa || contacts.maps || contacts.ig || showOnMap

  return (
    <Motion.article
      id={`local-${venue.id}`}
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.035, 0.18), ease }}
      className="group flex h-full scroll-mt-[calc(var(--navbar-h,5rem)+6rem)] flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-white shadow-sm transition duration-500 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-md sm:flex-row"
    >
      <button
        type="button"
        onClick={() => onOpen(venue)}
        className="flex min-w-0 flex-1 flex-col text-left sm:flex-row focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-inset"
      >
        <div className="relative w-full shrink-0 overflow-hidden sm:w-[42%] sm:min-h-[12.5rem]">
          <NewsCoverMedia
            imageUrl={venue.imageUrl}
            className="aspect-16/10 h-full w-full sm:aspect-auto"
            imgClassName="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading={index < 4 ? 'eager' : 'lazy'}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          {venue.category ? (
            <p className="text-[11px] font-bold uppercase tracking-wide text-sky-800">{venue.category}</p>
          ) : null}
          <h3 className="mt-1 font-serif text-lg font-bold tracking-tight text-[#171b22] group-hover:text-sky-900 sm:text-xl">
            {venue.name}
          </h3>
          <div className="mt-2 space-y-1 text-sm text-[#4b505a]">
            {venue.location ? (
              <p className="flex items-start gap-1.5">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-800" />
                <span className="line-clamp-2">{venue.location}</span>
              </p>
            ) : null}
            {venue.hours ? (
              <p className="flex items-start gap-1.5">
                <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-800" />
                <span className="line-clamp-1">{venue.hours}</span>
              </p>
            ) : null}
          </div>
          {venue.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#4b505a]">{venue.description}</p>
          ) : null}
          <span className="mt-3 text-sm font-semibold text-sky-800">Ver ficha →</span>
        </div>
      </button>
      {hasActions ? (
        <div className="flex flex-wrap gap-2 border-t border-[#eeeae2] px-4 py-3 sm:hidden">
          <MapActionButton onClick={showOnMap} />
          <ActionLink href={contacts.call}>Llamar</ActionLink>
          <ActionLink href={contacts.wa} external>
            WhatsApp
          </ActionLink>
          <ActionLink href={contacts.maps} external>
            Cómo llegar
          </ActionLink>
        </div>
      ) : null}
      {hasActions ? (
        <div className="hidden flex-col justify-center gap-2 border-l border-[#eeeae2] px-3 py-4 sm:flex">
          <MapActionButton onClick={showOnMap} />
          <ActionLink href={contacts.call}>Llamar</ActionLink>
          <ActionLink href={contacts.wa} external>
            WhatsApp
          </ActionLink>
          <ActionLink href={contacts.maps} external>
            Cómo llegar
          </ActionLink>
        </div>
      ) : null}
    </Motion.article>
  )
}

export function GastronomyVenuesExplorer({
  categories = [],
  venues = [],
  searchPlaceholder = 'Buscar por nombre, barrio o tipo…',
  searchQuery = '',
  onSearchChange,
  onShowOnMap,
}) {
  const [activeCategory, setActiveCategory] = useState(categories[0] || 'Todos')
  const [selected, setSelected] = useState(null)
  const query = searchQuery
  const cats = categories.length ? categories : ['Todos']
  const effectiveCategory = cats.includes(activeCategory) ? activeCategory : cats[0]

  useEffect(() => {
    if (!cats.includes(activeCategory)) setActiveCategory(cats[0])
  }, [activeCategory, cats])

  const filtered = useMemo(() => {
    const q = normalizeQuery(query)
    return venues.filter((venue) => {
      if (effectiveCategory && effectiveCategory !== 'Todos' && venue.category !== effectiveCategory) {
        return false
      }
      if (!q) return true
      const haystack = normalizeQuery(
        [venue.name, venue.category, venue.location, venue.description, venue.phone].join(' '),
      )
      return haystack.includes(q)
    })
  }, [effectiveCategory, query, venues])

  const categoryCounts = useMemo(() => {
    const q = normalizeQuery(query)
    const searched = venues.filter((venue) => {
      if (!q) return true
      return normalizeQuery(
        [venue.name, venue.category, venue.location, venue.description, venue.phone].join(' '),
      ).includes(q)
    })
    const counts = { Todos: searched.length }
    for (const cat of cats) {
      if (cat === 'Todos') continue
      counts[cat] = searched.filter((v) => v.category === cat).length
    }
    return counts
  }, [cats, query, venues])

  const openVenue = useCallback((venue) => {
    setSelected(venue)
  }, [])

  return (
    <div id="catalogo-locales" className="scroll-mt-[calc(var(--navbar-h)+1rem)]">
      <RevealOnScroll variant="slow">
        <div className="flex flex-col gap-2 border-b border-[#ddd7ca] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">Directorio</p>
            <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
              Locales gastronómicos
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#4b505a]">
              Filtrá por tipo o buscá por nombre. Tocá la tarjeta para ver la ficha, o usá «Ver en el mapa»
              para volar hasta el local.
            </p>
          </div>
          <p className="text-sm font-semibold text-[#171b22]">
            {filtered.length} {filtered.length === 1 ? 'propuesta' : 'propuestas'}
          </p>
        </div>
      </RevealOnScroll>

      <div className="sticky top-[var(--navbar-h,5rem)] z-20 -mx-1 mt-5 bg-[#fcfcfa]/95 px-1 py-3 backdrop-blur-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden">
            {cats.map((cat) => {
              const active = cat === effectiveCategory
              const count = categoryCounts[cat] ?? 0
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-[#171b22] text-white shadow-sm'
                      : 'border border-[#d8d5cd] bg-white text-[#3e434d] hover:border-sky-200 hover:text-[#171b22]'
                  }`}
                >
                  {cat}
                  <span className={`text-[11px] tabular-nums ${active ? 'text-white/70' : 'text-[#8a8f97]'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Buscar locales</span>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-full border border-[#d6d0c3] bg-white py-2.5 pr-4 pl-10 text-sm text-[#171b22] shadow-sm transition placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200/80"
            />
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#d8d5cd] bg-[#f8f7f3] px-5 py-12 text-center">
          <p className="font-serif text-lg font-semibold text-[#171b22]">No hay locales para mostrar</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#5c6169]">
            Probá otra categoría o buscá con otra palabra. El directorio se actualiza desde el panel municipal.
          </p>
          {query || (effectiveCategory && effectiveCategory !== 'Todos') ? (
            <button
              type="button"
              className="mt-5 inline-flex min-h-10 items-center rounded-full bg-[#171b22] px-4 text-sm font-semibold text-white"
              onClick={() => {
                setActiveCategory(cats.includes('Todos') ? 'Todos' : cats[0])
                onSearchChange?.('')
              }}
            >
              Ver todos los locales
            </button>
          ) : null}
        </div>
      ) : (
        <Motion.div layout className="mt-6 grid gap-5 lg:grid-cols-1 xl:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((venue, idx) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                index={idx}
                onOpen={openVenue}
                onShowOnMap={onShowOnMap}
              />
            ))}
          </AnimatePresence>
        </Motion.div>
      )}

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {selected ? (
                <VenueDetailSheet
                  key={selected.id}
                  venue={selected}
                  onClose={() => setSelected(null)}
                  onShowOnMap={onShowOnMap}
                />
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  )
}

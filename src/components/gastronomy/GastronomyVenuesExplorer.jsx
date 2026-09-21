import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion as Motion } from 'motion/react'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'
import { NewsCoverMedia } from '../news/NewsCoverMedia.jsx'

const ease = [0.16, 1, 0.3, 1]

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

function WhatsAppIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.52 3.48A11.8 11.8 0 0 0 12.06 0C5.5 0 .16 5.33.16 11.88c0 2.1.55 4.14 1.6 5.95L0 24l6.33-1.66a11.86 11.86 0 0 0 5.72 1.46h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.24-6.16-3.42-8.44ZM12.06 21.7h-.01a9.84 9.84 0 0 1-5.01-1.37l-.36-.21-3.76.98 1-3.66-.23-.38a9.82 9.82 0 0 1-1.51-5.26c0-5.42 4.41-9.83 9.85-9.83 2.63 0 5.1 1.02 6.96 2.88a9.77 9.77 0 0 1 2.88 6.95c0 5.43-4.42 9.84-9.82 9.84Zm5.4-7.37c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.3-.02-.46.13-.6.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.11 3.22 5.11 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
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

function ActionButton({ href, children, tone = 'ghost', external = false, className = '' }) {
  if (!href) return null
  const tones = {
    ghost:
      'border border-[#e4dfd4] bg-white text-[#171b22] hover:border-[#c9c2b3] hover:bg-[#faf8f4]',
    dark: 'border border-[#171b22] bg-[#171b22] text-white hover:bg-[#2a2f38]',
    wa: 'border border-transparent bg-[#128C7E] text-white hover:bg-[#0e7a6e]',
  }
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition ${tones[tone] || tones.ghost} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </a>
  )
}

function VenueDetailSheet({ venue, onClose }) {
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
      className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#0c1017]/55"
        aria-label="Cerrar ficha del local"
        onClick={onClose}
      />
      <Motion.div
        className="relative z-10 flex max-h-[min(92dvh,44rem)] w-full max-w-xl flex-col overflow-hidden rounded-t-[1.6rem] bg-[#fcfcfa] shadow-[0_40px_100px_-36px_rgba(23,27,34,0.55)] sm:rounded-[1.6rem]"
        initial={{ y: 48, opacity: 0.85 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 32, opacity: 0 }}
        transition={{ duration: 0.38, ease }}
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
            className="absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0c1017]/55 text-white backdrop-blur-sm transition hover:bg-[#0c1017]/75"
            aria-label="Cerrar"
          >
            ✕
          </button>
          {venue.category ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-white/92 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#171b22]">
              {venue.category}
            </span>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <h3 id={titleId} className="font-serif text-2xl font-bold tracking-tight text-[#171b22]">
            {venue.name}
          </h3>
          <div className="mt-3 space-y-2 text-sm text-[#4b505a]">
            {venue.location ? (
              <p className="flex gap-2">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#b45309]" />
                <span>{venue.location}</span>
              </p>
            ) : null}
            {venue.hours ? (
              <p className="flex gap-2">
                <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#b45309]" />
                <span>{venue.hours}</span>
              </p>
            ) : null}
            {venue.phone ? (
              <p className="flex gap-2">
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#b45309]" />
                <span className="tabular-nums">{venue.phone}</span>
              </p>
            ) : null}
          </div>
          {venue.description ? (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#4b505a]">{venue.description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-[#eee9df] bg-white px-5 py-4 sm:px-6">
          <ActionButton href={contacts.wa} tone="wa" external className="flex-1 sm:flex-none">
            <WhatsAppIcon />
            WhatsApp
          </ActionButton>
          <ActionButton href={contacts.call} tone="dark" className="flex-1 sm:flex-none">
            Llamar
          </ActionButton>
          <ActionButton href={contacts.maps} external>
            Cómo llegar
          </ActionButton>
          <ActionButton href={contacts.ig} external>
            Instagram
          </ActionButton>
        </div>
      </Motion.div>
    </Motion.div>
  )
}

function VenueCard({ venue, index, onOpen }) {
  const contacts = venueContacts(venue)
  const primary = contacts.wa || contacts.call || contacts.maps

  return (
    <Motion.article
      id={`local-${venue.id}`}
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.2), ease }}
      className="group flex h-full scroll-mt-[calc(var(--navbar-h,5rem)+5.5rem)] flex-col overflow-hidden rounded-[1.35rem] bg-white shadow-[0_18px_50px_-36px_rgba(23,27,34,0.45)] ring-1 ring-[#171b22]/6 transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-34px_rgba(180,83,9,0.28)]"
    >
      <button
        type="button"
        onClick={() => onOpen(venue)}
        className="flex flex-1 flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b45309] focus-visible:ring-offset-2"
      >
        <div className="relative overflow-hidden">
          <NewsCoverMedia
            imageUrl={venue.imageUrl}
            className="aspect-[4/3] w-full"
            imgClassName="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
            loading={index < 4 ? 'eager' : 'lazy'}
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#171b22]/55 via-transparent to-transparent" />
          {venue.category ? (
            <span className="absolute top-3 left-3 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#171b22]">
              {venue.category}
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col px-4 pt-4 pb-3 sm:px-5">
          <h3 className="font-serif text-xl font-bold tracking-tight text-[#171b22]">{venue.name}</h3>
          <div className="mt-2 space-y-1 text-[13px] text-[#5c6169]">
            {venue.location ? (
              <p className="flex items-start gap-1.5">
                <PinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b45309]" />
                <span className="line-clamp-2">{venue.location}</span>
              </p>
            ) : null}
            {venue.hours ? (
              <p className="flex items-start gap-1.5">
                <ClockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b45309]" />
                <span className="line-clamp-1">{venue.hours}</span>
              </p>
            ) : null}
          </div>
          {venue.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#5c6169]">{venue.description}</p>
          ) : null}
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b45309]">Ver ficha</p>
        </div>
      </button>
      <div className="mt-auto flex flex-wrap gap-2 px-4 pb-4 sm:px-5">
        {contacts.wa ? (
          <ActionButton href={contacts.wa} tone="wa" external className="min-h-9 px-3 text-xs">
            <WhatsAppIcon className="h-3.5 w-3.5" />
            WhatsApp
          </ActionButton>
        ) : null}
        {contacts.maps ? (
          <ActionButton href={contacts.maps} external className="min-h-9 px-3 text-xs">
            Cómo llegar
          </ActionButton>
        ) : null}
        {!contacts.wa && contacts.call ? (
          <ActionButton href={contacts.call} tone="dark" className="min-h-9 px-3 text-xs">
            Llamar
          </ActionButton>
        ) : null}
        {!primary ? (
          <button
            type="button"
            onClick={() => onOpen(venue)}
            className="inline-flex min-h-9 items-center rounded-full border border-[#e4dfd4] px-3 text-xs font-semibold text-[#171b22]"
          >
            Ver datos
          </button>
        ) : null}
      </div>
    </Motion.article>
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
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b45309]">Dónde comer</p>
          <h2 className="mt-1.5 font-serif text-3xl font-bold tracking-tight text-[#171b22] sm:text-4xl">
            Locales de Trancas
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#5c6169] sm:text-base">
            Elegí el tipo, buscá por nombre o barrio y contactá al instante. Tocá una tarjeta para ver la ficha
            completa.
          </p>
        </div>
      </RevealOnScroll>

      <div className="sticky top-[calc(var(--navbar-h,5rem)-0.25rem)] z-30 -mx-1 mt-6 bg-[#f6f3ee]/92 px-1 py-3 backdrop-blur-md sm:mt-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden">
            {cats.map((cat) => {
              const active = cat === effectiveCategory
              const count = categoryCounts[cat] ?? 0
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-[#171b22] text-white shadow-sm'
                      : 'bg-white text-[#3e434d] ring-1 ring-[#e4dfd4] hover:ring-[#c9c2b3]'
                  }`}
                >
                  {cat}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                      active ? 'bg-white/15 text-white' : 'bg-[#f3efe6] text-[#5c6169]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
          <label className="relative block w-full lg:ml-auto lg:max-w-xs">
            <span className="sr-only">Buscar locales</span>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#8a8580]" />
            <input
              type="search"
              value={query}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-full border-0 bg-white py-2.5 pr-4 pl-10 text-sm text-[#171b22] shadow-sm ring-1 ring-[#e4dfd4] transition placeholder:text-[#9a958d] focus:ring-2 focus:ring-[#b45309]/35 focus:outline-none"
            />
          </label>
        </div>
        <p className="mt-2 text-xs font-medium text-[#7a756c]">
          {filtered.length} {filtered.length === 1 ? 'lugar para visitar' : 'lugares para visitar'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-[1.4rem] border border-dashed border-[#ddd6c8] bg-white/70 px-5 py-14 text-center">
          <p className="font-serif text-xl font-bold text-[#171b22]">No encontramos ese lugar</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#5c6169]">
            Probá con otro nombre, barrio o tipo. El directorio lo actualiza la Municipalidad.
          </p>
          {query || effectiveCategory !== 'Todos' ? (
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
        <Motion.div layout className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((venue, idx) => (
              <VenueCard key={venue.id} venue={venue} index={idx} onOpen={openVenue} />
            ))}
          </AnimatePresence>
        </Motion.div>
      )}

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {selected ? (
                <VenueDetailSheet key={selected.id} venue={selected} onClose={() => setSelected(null)} />
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  )
}

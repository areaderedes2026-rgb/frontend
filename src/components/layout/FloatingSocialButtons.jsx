import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { SOCIAL_LINKS } from '../../utils/constants.js'
import {
  buildWhatsAppUrl,
  MUNICIPAL_WHATSAPP_DEFAULT_MESSAGE,
  MUNICIPAL_WHATSAPP_PHONE,
  openWhatsAppUrl,
} from '../../utils/whatsapp.js'

function InstagramIcon({ className = 'h-4.5 w-4.5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
    </svg>
  )
}

function FacebookIcon({ className = 'h-4.5 w-4.5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M14.8 8.1h2.1V4.7h-2.4c-3.3 0-4.8 1.9-4.8 4.9v2H7.5v3.3h2.2v4.4h3.6v-4.4h2.6l.4-3.3h-3V10c0-1.1.3-1.9 1.5-1.9Z"
        fill="currentColor"
      />
    </svg>
  )
}

function WhatsAppIcon({ className = 'h-4.5 w-4.5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function YouTubeIcon({ className = 'h-4.5 w-4.5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M21.2 8.2a2.9 2.9 0 0 0-2-2.1C17.4 5.6 12 5.6 12 5.6s-5.4 0-7.2.5a2.9 2.9 0 0 0-2 2.1c-.5 1.8-.5 3.8-.5 3.8s0 2 .5 3.8a2.9 2.9 0 0 0 2 2.1c1.8.5 7.2.5 7.2.5s5.4 0 7.2-.5a2.9 2.9 0 0 0 2-2.1c.5-1.8.5-3.8.5-3.8s0-2-.5-3.8Z"
        fill="currentColor"
      />
      <path d="m10.4 14.6 4.5-2.6-4.5-2.6v5.2Z" fill="#0b1220" />
    </svg>
  )
}

/** Icono abstracto “redes” (nodos) para el botón principal. */
function SocialHubIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.65" />
      <circle cx="6" cy="19" r="2.2" stroke="currentColor" strokeWidth="1.65" />
      <circle cx="18" cy="19" r="2.2" stroke="currentColor" strokeWidth="1.65" />
      <path
        d="M12 7.3v4.2M8.4 16.4l3-5M15.6 16.4l-3-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

const MUNICIPAL_WHATSAPP_HREF = buildWhatsAppUrl(
  MUNICIPAL_WHATSAPP_PHONE,
  MUNICIPAL_WHATSAPP_DEFAULT_MESSAGE,
)

const LINKS = [
  {
    key: 'whatsapp',
    href: MUNICIPAL_WHATSAPP_HREF,
    label: 'WhatsApp de la municipalidad',
    Icon: WhatsAppIcon,
    ring: 'focus-visible:ring-emerald-400/45',
    btn: 'border-emerald-500/35 bg-linear-to-br from-emerald-500/92 via-emerald-600/88 to-green-700/88 hover:from-emerald-500 hover:to-green-600',
    openInNewTabViaScript: true,
  },
  {
    key: 'instagram',
    href: SOCIAL_LINKS.instagram,
    label: 'Instagram de la municipalidad',
    Icon: InstagramIcon,
    ring: 'focus-visible:ring-fuchsia-400/45',
    btn: 'border-fuchsia-500/35 bg-linear-to-br from-fuchsia-600/88 via-pink-600/85 to-violet-700/88 hover:from-fuchsia-500 hover:to-violet-600',
  },
  {
    key: 'facebook',
    href: SOCIAL_LINKS.facebook,
    label: 'Facebook de la municipalidad',
    Icon: FacebookIcon,
    ring: 'focus-visible:ring-blue-400/45',
    btn: 'border-blue-500/35 bg-linear-to-br from-blue-600/88 via-blue-700/85 to-indigo-800/88 hover:from-blue-500 hover:to-indigo-700',
  },
  {
    key: 'youtube',
    href: SOCIAL_LINKS.youtube,
    label: 'YouTube de la municipalidad',
    Icon: YouTubeIcon,
    ring: 'focus-visible:ring-red-400/45',
    btn: 'border-red-500/35 bg-linear-to-br from-red-600/88 via-rose-600/85 to-red-700/88 hover:from-red-500 hover:to-red-600',
  },
]

export function FloatingSocialButtons() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const menuId = useId()

  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen((v) => !v), [])

  useEffect(() => {
    if (!open) return
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) close()
    }
    function onKey(e) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed bottom-4 right-3 z-40 sm:bottom-5 sm:right-5"
    >
      <div className="pointer-events-auto relative">
        <div
          id={menuId}
          role="group"
          aria-label="Enlaces a redes sociales y WhatsApp"
          className={`absolute right-0 bottom-full mb-2 flex flex-col items-end gap-2 ${
            open ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          {LINKS.map((item, index) => {
            const delayMs = open ? index * 90 : (LINKS.length - 1 - index) * 75
            const Icon = item.Icon
            return (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                {...(!open ? { 'aria-hidden': true } : {})}
                tabIndex={open ? 0 : -1}
                onClick={(e) => {
                  if (item.openInNewTabViaScript) {
                    e.preventDefault()
                    openWhatsAppUrl(item.href)
                  }
                  setOpen(false)
                }}
                className={[
                  'inline-flex h-11 w-11 items-center justify-center rounded-xl border text-white shadow-md shadow-black/25 outline-none',
                  'motion-safe:transition-[transform,opacity,visibility] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]',
                  'motion-reduce:transition-none',
                  item.btn,
                  item.ring,
                  'focus-visible:ring-4',
                  open
                    ? 'visible translate-y-0 scale-100 opacity-100'
                    : 'invisible translate-y-6 scale-[0.92] opacity-0',
                ].join(' ')}
                style={{ transitionDelay: `${delayMs}ms` }}
              >
                <Icon />
              </a>
            )
          })}
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={
            open
              ? 'Cerrar menú de redes sociales y WhatsApp'
              : 'Abrir menú de redes sociales y WhatsApp'
          }
          className={[
            'pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/14',
            'bg-slate-950/88 text-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.55)] backdrop-blur-md',
            'outline-none transition-[transform,box-shadow,border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            'hover:border-white/22 hover:bg-slate-900/95 hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.5)]',
            'focus-visible:ring-4 focus-visible:ring-sky-400/40',
            open ? 'ring-1 ring-white/18' : '',
          ].join(' ')}
        >
          <span
            className={[
              'inline-flex transition-transform duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
              open ? 'rotate-135' : 'rotate-0',
            ].join(' ')}
            aria-hidden
          >
            <SocialHubIcon className="h-5 w-5" />
          </span>
        </button>
      </div>
    </div>
  )
}

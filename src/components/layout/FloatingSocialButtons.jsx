import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { SOCIAL_LINKS } from '../../utils/constants.js'

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

const LINKS = [
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
          aria-label="Enlaces a redes sociales"
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
                onClick={() => setOpen(false)}
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
          aria-label={open ? 'Cerrar menú de redes sociales' : 'Abrir menú de redes sociales'}
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

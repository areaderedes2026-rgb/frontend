import { SOCIAL_LINKS } from '../../utils/constants.js'

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4.5 w-4.5">
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

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4.5 w-4.5">
      <path
        d="M14.8 8.1h2.1V4.7h-2.4c-3.3 0-4.8 1.9-4.8 4.9v2H7.5v3.3h2.2v4.4h3.6v-4.4h2.6l.4-3.3h-3V10c0-1.1.3-1.9 1.5-1.9Z"
        fill="currentColor"
      />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4.5 w-4.5">
      <path
        d="M21.2 8.2a2.9 2.9 0 0 0-2-2.1C17.4 5.6 12 5.6 12 5.6s-5.4 0-7.2.5a2.9 2.9 0 0 0-2 2.1c-.5 1.8-.5 3.8-.5 3.8s0 2 .5 3.8a2.9 2.9 0 0 0 2 2.1c1.8.5 7.2.5 7.2.5s5.4 0 7.2-.5a2.9 2.9 0 0 0 2-2.1c.5-1.8.5-3.8.5-3.8s0-2-.5-3.8Z"
        fill="currentColor"
      />
      <path d="m10.4 14.6 4.5-2.6-4.5-2.6v5.2Z" fill="#0b1220" />
    </svg>
  )
}

export function FloatingSocialButtons() {
  return (
    <div className="pointer-events-none fixed bottom-4 right-3 z-40 flex flex-col gap-2 rounded-2xl border border-slate-700/60 bg-slate-950/70 p-2 backdrop-blur-sm sm:bottom-5 sm:right-5">
      <a
        href={SOCIAL_LINKS.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram de la municipalidad"
        className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-fuchsia-500/40 bg-linear-to-br from-fuchsia-600/85 via-pink-600/85 to-violet-700/85 text-white shadow-md shadow-black/30 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:from-fuchsia-500 hover:to-violet-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400/50"
      >
        <InstagramIcon />
      </a>
      <a
        href={SOCIAL_LINKS.facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook de la municipalidad"
        className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/40 bg-linear-to-br from-blue-600/85 via-blue-700/85 to-indigo-800/85 text-white shadow-md shadow-black/30 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:from-blue-500 hover:to-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/50"
      >
        <FacebookIcon />
      </a>
      <a
        href={SOCIAL_LINKS.youtube}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube de la municipalidad"
        className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/40 bg-linear-to-br from-red-600/85 via-rose-600/85 to-red-700/85 text-white shadow-md shadow-black/30 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:from-red-500 hover:to-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400/50"
      >
        <YouTubeIcon />
      </a>
    </div>
  )
}

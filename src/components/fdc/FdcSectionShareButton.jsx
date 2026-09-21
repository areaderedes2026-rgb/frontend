import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { buildPageSectionUrl, copyTextToClipboard } from '../../utils/copyText.js'

function ShareIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.75v9.5M12 3.75 8.75 7M12 3.75 15.25 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.75 10.5H6A2.25 2.25 0 0 0 3.75 12.75v6A2.25 2.25 0 0 0 6 21h12a2.25 2.25 0 0 0 2.25-2.25v-6A2.25 2.25 0 0 0 18 10.5h-.75"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5.5 12.5 10 17l8.5-9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function FdcSectionShareButton({
  sectionId,
  usesDarkTone = false,
  className = '',
  compact = false,
}) {
  const liveId = useId()
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const timerRef = useRef(0)
  const busyRef = useRef(false)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const onShare = useCallback(
    async (event) => {
      event.preventDefault()
      event.stopPropagation()
      if (busyRef.current) return
      busyRef.current = true

      const url = buildPageSectionUrl(sectionId)
      let ok = await copyTextToClipboard(url)

      if (!ok && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
          await navigator.share({ url, title: document.title })
          ok = true
        } catch (err) {
          if (err?.name === 'AbortError') {
            busyRef.current = false
            return
          }
        }
      }

      setCopied(ok)
      setFailed(!ok)
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        setCopied(false)
        setFailed(false)
        busyRef.current = false
      }, 2200)
      if (!ok) busyRef.current = false
    },
    [sectionId],
  )

  const toneClass = usesDarkTone
    ? copied
      ? 'border-[#d4b483]/80 bg-[#d4b483]/20 text-[#d4b483]'
      : 'border-[#d4b483]/45 bg-black/20 text-[#d4b483] hover:border-[#d4b483]/80 hover:bg-white/10 hover:text-[#e8d5b0]'
    : copied
      ? 'border-[#8a7048]/50 bg-[#d4b483]/18 text-[#6e562e]'
      : 'border-[#171b22]/18 bg-white/90 text-[#171b22] hover:border-[#171b22]/40 hover:bg-white'

  const label = failed ? 'No se pudo copiar' : copied ? 'Enlace copiado' : 'Compartir'
  const title = failed
    ? 'No se pudo copiar el enlace. Probá de nuevo.'
    : copied
      ? 'Enlace copiado al portapapeles'
      : 'Copiar enlace de esta sección'

  return (
    <div className={`relative ${className}`.trim()}>
      <button
        type="button"
        onClick={onShare}
        aria-describedby={liveId}
        aria-label={title}
        title={title}
        className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border px-3 text-[10px] font-bold uppercase tracking-[0.12em] shadow-sm backdrop-blur-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483] sm:min-h-10 sm:px-3.5 sm:text-[11px] ${
          compact ? 'min-w-11 px-0 sm:min-w-10' : ''
        } ${toneClass}`}
      >
        {copied ? <CheckIcon className="h-4 w-4" /> : <ShareIcon className="h-4 w-4" />}
        {compact ? <span className="sr-only">{label}</span> : <span>{copied ? 'Copiado' : 'Compartir'}</span>}
      </button>
      <p id={liveId} className="sr-only" aria-live="polite">
        {copied ? 'Enlace copiado al portapapeles' : failed ? 'No se pudo copiar el enlace' : ''}
      </p>
    </div>
  )
}

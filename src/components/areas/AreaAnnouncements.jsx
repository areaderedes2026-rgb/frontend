import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  announcementDismissStorageKey,
  isAnnouncementsSectionVisible,
  normalizeAnnouncementsSection,
} from '../../utils/areaAnnouncements.js'

const VARIANT_STYLES = {
  info: {
    shell: 'border-sky-200/90 bg-sky-50/95 text-sky-950',
    accent: 'bg-sky-600',
    badge: 'bg-sky-100 text-sky-900',
    link: 'text-sky-900 hover:text-sky-950',
  },
  warning: {
    shell: 'border-amber-200/90 bg-amber-50/95 text-amber-950',
    accent: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-900',
    link: 'text-amber-900 hover:text-amber-950',
  },
  success: {
    shell: 'border-emerald-200/90 bg-emerald-50/95 text-emerald-950',
    accent: 'bg-emerald-600',
    badge: 'bg-emerald-100 text-emerald-900',
    link: 'text-emerald-900 hover:text-emerald-950',
  },
  urgent: {
    shell: 'border-rose-300/90 bg-rose-50/95 text-rose-950 shadow-[0_0_0_1px_rgba(244,63,94,0.08)]',
    accent: 'bg-rose-600',
    badge: 'bg-rose-100 text-rose-900',
    link: 'text-rose-900 hover:text-rose-950',
  },
}

function readDismissedIds(areaSlug) {
  if (typeof window === 'undefined') return new Set()
  const out = new Set()
  try {
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i)
      if (!key || !key.startsWith('mt-area-announce-dismiss:')) continue
      const prefix = `mt-area-announce-dismiss:${String(areaSlug || '').trim()}:`
      if (!key.startsWith(prefix)) continue
      if (window.sessionStorage.getItem(key) === '1') {
        out.add(key.slice(prefix.length))
      }
    }
  } catch {
    return new Set()
  }
  return out
}

function AnnouncementCard({ item, layout, onDismiss, dismissed }) {
  const styles = VARIANT_STYLES[item.variant] || VARIANT_STYLES.info
  const title = String(item.title || '').trim()
  const message = String(item.message || '').trim()
  const linkUrl = String(item.linkUrl || '').trim()
  const linkLabel = String(item.linkLabel || '').trim() || 'Más información'
  const canDismiss = Boolean(item.dismissible) && typeof onDismiss === 'function'

  if (dismissed) return null

  const isFloating = layout === 'floating'

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border shadow-md backdrop-blur-sm ${styles.shell} ${
        isFloating ? 'w-full max-w-sm' : 'w-full'
      }`}
      role="status"
      aria-live="polite"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${styles.accent}`} aria-hidden />
      <div className={`flex gap-3 ${isFloating ? 'p-4' : 'p-4 sm:p-5'}`}>
        <div className="min-w-0 flex-1 pl-2">
          <div className="flex flex-wrap items-start gap-2">
            {title ? (
              <h3
                className={`font-bold tracking-tight text-[#171b22] ${
                  isFloating ? 'text-sm' : 'text-base sm:text-lg'
                }`}
              >
                {title}
              </h3>
            ) : null}
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}
            >
              {item.variant === 'urgent'
                ? 'Urgente'
                : item.variant === 'warning'
                  ? 'Aviso'
                  : item.variant === 'success'
                    ? 'Confirmación'
                    : 'Información'}
            </span>
          </div>
          {message ? (
            <p
              className={`mt-2 leading-relaxed text-[#2f3440] ${
                isFloating ? 'text-xs sm:text-sm' : 'text-sm sm:text-[15px]'
              }`}
            >
              {message}
            </p>
          ) : null}
          {linkUrl ? (
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-3 inline-flex items-center gap-1 text-sm font-semibold underline-offset-2 hover:underline ${styles.link}`}
            >
              {linkLabel}
              <span aria-hidden>↗</span>
            </a>
          ) : null}
        </div>
        {canDismiss ? (
          <button
            type="button"
            onClick={() => onDismiss(item.id)}
            className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-black/5 hover:text-slate-800"
            aria-label="Cerrar anuncio"
          >
            <span className="text-lg leading-none" aria-hidden>
              ×
            </span>
          </button>
        ) : null}
      </div>
    </article>
  )
}

function AreaAnnouncementsInline({ items, areaSlug }) {
  const [dismissedIds, setDismissedIds] = useState(() => readDismissedIds(areaSlug))

  const dismiss = useCallback(
    (id) => {
      const key = announcementDismissStorageKey(areaSlug, id)
      try {
        window.sessionStorage.setItem(key, '1')
      } catch {
        /* ignore */
      }
      setDismissedIds((prev) => new Set([...prev, String(id)]))
    },
    [areaSlug],
  )

  const visible = items.filter((item) => !dismissedIds.has(String(item.id)))
  if (!visible.length) return null

  return (
    <section
      id="anuncios-area"
      className="scroll-mt-[calc(var(--navbar-h,5rem)+1rem)]"
      aria-label="Anuncios del área"
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800">Anuncios</p>
      <div className="mt-3 space-y-3">
        {visible.map((item, idx) => (
          <AnnouncementCard
            key={item.id || `ann-inline-${idx}`}
            item={item}
            layout="inline"
            onDismiss={item.dismissible ? dismiss : undefined}
            dismissed={false}
          />
        ))}
      </div>
    </section>
  )
}

function AreaAnnouncementsFloating({ items, areaSlug }) {
  const [dismissedIds, setDismissedIds] = useState(() => readDismissedIds(areaSlug))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const dismiss = useCallback(
    (id) => {
      const key = announcementDismissStorageKey(areaSlug, id)
      try {
        window.sessionStorage.setItem(key, '1')
      } catch {
        /* ignore */
      }
      setDismissedIds((prev) => new Set([...prev, String(id)]))
    },
    [areaSlug],
  )

  const visible = useMemo(
    () => items.filter((item) => !dismissedIds.has(String(item.id))),
    [items, dismissedIds],
  )

  if (!mounted || !visible.length) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[45] flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:justify-end sm:px-0"
      aria-label="Anuncios flotantes"
    >
      <div className="pointer-events-auto flex w-full max-w-md flex-col gap-2.5 sm:max-w-sm">
        {visible.map((item, idx) => (
          <AnnouncementCard
            key={item.id || `ann-float-${idx}`}
            item={item}
            layout="floating"
            onDismiss={item.dismissible ? dismiss : undefined}
            dismissed={false}
          />
        ))}
      </div>
    </div>
  )
}

export function AreaAnnouncements({ announcementsSection, areaSlug, displayModeOverride }) {
  if (!isAnnouncementsSectionVisible(announcementsSection)) return null

  const section = normalizeAnnouncementsSection(announcementsSection)
  const displayMode = displayModeOverride || section.displayMode
  if (displayModeOverride && displayMode !== displayModeOverride) return null
  const items = section.items

  if (displayMode === 'floating') {
    return <AreaAnnouncementsFloating items={items} areaSlug={areaSlug} />
  }

  return <AreaAnnouncementsInline items={items} areaSlug={areaSlug} />
}

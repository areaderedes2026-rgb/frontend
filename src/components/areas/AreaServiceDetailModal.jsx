import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion as Motion } from 'motion/react'
import { resolveMediaUrl } from '../../utils/imageUrl.js'

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fn = () => setReduce(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return reduce
}

const easeOut = [0.22, 1, 0.36, 1]

function MetaCard({ label, children, className = '' }) {
  if (!children) return null
  return (
    <div
      className={`rounded-xl border border-[#e5e2da] bg-white/80 p-4 shadow-sm sm:p-5 ${className}`.trim()}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-800">{label}</p>
      <div className="mt-2 text-sm leading-relaxed text-[#2f3440] sm:text-[15px]">{children}</div>
    </div>
  )
}

function DescriptionBlock({ description }) {
  if (description) {
    return (
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[#e5e2da] bg-linear-to-b from-white to-[#faf9f6] p-5 shadow-sm sm:p-6 lg:p-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">Descripción</p>
        <p className="mt-3 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-[#3d424c] sm:text-[15px] sm:leading-[1.65]">
          {description}
        </p>
      </div>
    )
  }
  return (
    <div className="flex min-h-[100px] flex-1 items-center justify-center rounded-2xl border border-dashed border-[#e0dcd4] bg-[#faf9f6]/90 p-6 text-center text-sm text-slate-500">
      Sin descripción cargada.
    </div>
  )
}

function ProjectCard({ project }) {
  const img = project?.imageUrl ? resolveMediaUrl(project.imageUrl) : ''
  const title = String(project?.title || '').trim()
  const description = String(project?.description || '').trim()
  const status = String(project?.status || '').trim()
  const linkUrl = String(project?.linkUrl || '').trim()
  const linkLabel = String(project?.linkLabel || '').trim() || 'Ver proyecto'
  if (!title && !description && !status && !img && !linkUrl) return null
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#e5e2da] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-500/10">
      {img ? (
        <img
          src={img}
          alt=""
          className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-linear-to-br from-slate-100 to-sky-50 text-xs font-bold uppercase tracking-wide text-slate-400">
          Proyecto
        </div>
      )}
      <div className="p-4 sm:p-5">
        {status ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700">
            {status}
          </p>
        ) : null}
        {title ? (
          <h3 className={`text-base font-bold tracking-tight text-slate-900 ${status ? 'mt-1.5' : ''}`}>
            {title}
          </h3>
        ) : null}
        {description ? (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#4b505a]">
            {description}
          </p>
        ) : null}
        {linkUrl ? (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center rounded-xl border border-[#d7d1c7] bg-[#fcfcfa] px-3 py-2 text-xs font-bold text-sky-800 transition hover:border-sky-200 hover:bg-sky-50"
          >
            {linkLabel}
            <span className="ml-1" aria-hidden>
              ↗
            </span>
          </a>
        ) : null}
      </div>
    </article>
  )
}

/**
 * Modal público de detalle de servicio: panel muy ancho (7xl / 88rem), 2 columnas en `lg`, 3 zonas en `xl`.
 */
export function AreaServiceDetailModal({ service, open, onClose }) {
  const titleId = useId()
  const reduceMotion = usePrefersReducedMotion()
  const duration = reduceMotion ? 0.01 : 0.5

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const img = service?.imageUrl ? resolveMediaUrl(service.imageUrl) : ''
  const title = String(service?.title || '').trim() || 'Servicio'
  const mode = String(service?.mode || '').trim()
  const description = String(service?.description || '').trim()
  const personInCharge = String(service?.personInCharge || '').trim()
  const generalObjective = String(service?.generalObjective || '').trim()
  const projects = Array.isArray(service?.projects)
    ? service.projects.filter((project) =>
        Boolean(
          project?.title ||
            project?.description ||
            project?.status ||
            project?.imageUrl ||
            project?.linkUrl,
        ),
      )
    : []
  const hasMeta = Boolean(personInCharge || generalObjective)
  const hasProjects = projects.length > 0
  const hasAnyContent =
    Boolean(img) || Boolean(mode) || hasMeta || Boolean(description) || hasProjects
  const modalKey = service?.id || title

  return createPortal(
    <AnimatePresence mode="wait">
      {open && service ? (
        <Motion.div
          key={modalKey}
          className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-5 lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration * 0.85, ease: easeOut }}
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <Motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative flex max-h-[min(94dvh,1020px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-[0_28px_80px_-24px_rgba(15,23,42,0.45)] xl:max-w-7xl 2xl:max-w-[min(88rem,calc(100vw-3rem))]"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration, ease: easeOut }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 shrink-0 bg-linear-to-r from-sky-500 to-sky-600" />

            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e8e4dc] px-4 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-6">
              <div className="min-w-0 flex-1">
                {mode ? (
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700 sm:text-xs">
                    {mode}
                  </p>
                ) : null}
                <h2
                  id={titleId}
                  className={`font-bold tracking-tight text-slate-900 ${mode ? 'mt-1.5' : ''} text-xl leading-tight sm:text-2xl lg:text-3xl`}
                >
                  {title}
                </h2>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-xl border border-transparent p-2 text-slate-500 transition hover:border-[#e5e2da] hover:bg-[#f4f1ea] hover:text-slate-800"
                aria-label="Cerrar ventana"
                onClick={onClose}
              >
                <span className="block text-2xl leading-none sm:text-3xl" aria-hidden>
                  ×
                </span>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
              {!hasAnyContent ? (
                <p className="px-4 py-10 text-center text-sm text-slate-500 sm:px-8 lg:px-10">
                  No hay más información cargada para este servicio.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-6 px-4 py-6 sm:gap-8 sm:px-8 sm:py-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:py-8 xl:gap-10">
                  {/* Columna imagen */}
                  <div className="lg:col-span-5 xl:col-span-4">
                    {img ? (
                      <div className="overflow-hidden rounded-2xl border border-[#e5e2da] bg-[#f0ece4] shadow-inner">
                        <img
                          src={img}
                          alt=""
                          className="aspect-video w-full object-cover sm:aspect-16/10 lg:max-h-[min(50vh,480px)] lg:object-cover"
                          loading="eager"
                          decoding="async"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-video min-h-[140px] items-center justify-center rounded-2xl border border-dashed border-[#ddd7ca] bg-[#f4f2ec] text-sm font-medium text-slate-500 sm:aspect-16/10 lg:min-h-[200px]">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  {/* Derecha: en lg una columna (meta + texto); en xl dos columnas internas = 3 zonas visuales */}
                  <div
                    className={`flex min-h-0 flex-col gap-6 lg:col-span-7 xl:col-span-8 xl:gap-8 ${hasMeta ? 'xl:grid xl:min-h-[min(52vh,520px)] xl:grid-cols-2' : ''}`}
                  >
                    {hasMeta ? (
                      <div className="flex flex-col gap-4 sm:gap-5">
                        {personInCharge ? (
                          <MetaCard label="A cargo">
                            <p className="font-semibold text-slate-900">{personInCharge}</p>
                          </MetaCard>
                        ) : null}
                        {generalObjective ? (
                          <MetaCard label="Objetivo general">
                            <p className="text-[#4b505a]">{generalObjective}</p>
                          </MetaCard>
                        ) : null}
                      </div>
                    ) : null}

                    <div
                      className={`flex min-h-0 min-w-0 flex-col ${hasMeta ? 'xl:max-h-[min(70vh,640px)]' : 'xl:col-span-2'}`}
                    >
                      <DescriptionBlock description={description} />
                    </div>
                  </div>
                  {hasProjects ? (
                    <section className="lg:col-span-12">
                      <div className="rounded-3xl border border-[#e5e2da] bg-[#f8f7f3] p-4 sm:p-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-800">
                              Proyectos
                            </p>
                            <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                              Proyectos vinculados al servicio
                            </h3>
                          </div>
                          <p className="text-xs font-semibold text-slate-500">
                            {projects.length} proyecto{projects.length === 1 ? '' : 's'}
                          </p>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {projects.map((project, idx) => (
                            <ProjectCard key={project.id || `project-${idx}`} project={project} />
                          ))}
                        </div>
                      </div>
                    </section>
                  ) : null}
                </div>
              )}
            </div>
          </Motion.div>
        </Motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

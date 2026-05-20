import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion as Motion } from 'motion/react'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'
import { Container } from '../ui/Container.jsx'
import { LinkButton } from '../ui/LinkButton.jsx'
import {
  MunicipalServiceCard,
  MunicipalServiceCardSkeleton,
} from './MunicipalServiceCard.jsx'
import { buildServiceCategories } from '../../data/servicesPageContent.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { ROUTES } from '../../utils/constants.js'

const easeOut = [0.22, 1, 0.36, 1]

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

function resolveHref(href) {
  const value = String(href || '').trim()
  if (!value) return ROUTES.atencionCiudadano
  if (value.startsWith('#') || value.startsWith('http')) return value
  return value.startsWith('/') ? value : `/${value}`
}

function isExternalHref(href) {
  return String(href || '').startsWith('http')
}

function ServicesGrid({ services, previewMode, reduceMotion }) {
  const duration = reduceMotion ? 0.01 : 0.4

  if (!services.length) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-[#5c6370]">
        No hay trámites publicados en esta categoría.
      </p>
    )
  }

  if (reduceMotion) {
    return (
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {services.map((item) => (
          <MunicipalServiceCard key={item.id || item.slug} service={item} as="li" />
        ))}
      </ul>
    )
  }

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <Motion.ul
        key={services.map((s) => s.id).join('-') || 'empty'}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: duration * 0.6, ease: easeOut }}
      >
        {services.map((item, idx) => (
          <Motion.li
            key={item.id || item.slug}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{
              duration,
              delay: previewMode ? 0 : Math.min(idx * 0.05, 0.35),
              ease: easeOut,
            }}
            className="h-full"
          >
            <MunicipalServiceCard service={item} />
          </Motion.li>
        ))}
      </Motion.ul>
    </AnimatePresence>
  )
}

export function ServicesPublicView({ content, services = [], previewMode = false }) {
  const [category, setCategory] = useState('Todos')
  const reduceMotion = usePrefersReducedMotion()
  const faqList = Array.isArray(content?.faq) ? content.faq : []
  const [openFaq, setOpenFaq] = useState(faqList[0]?.id || '')

  const categories = useMemo(() => buildServiceCategories(content), [content])
  const activeServices = useMemo(
    () =>
      [...services]
        .filter((item) => item.isActive !== false)
        .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)),
    [services],
  )

  const visible = useMemo(() => {
    if (category === 'Todos') return activeServices
    return activeServices.filter((item) => item.category === category)
  }, [activeServices, category])

  const heroImage = resolveMediaUrl(content?.heroImageUrl) || content?.heroImageUrl || ''

  return (
    <section
      className={`relative overflow-hidden bg-[#f4f5f7] ${
        previewMode
          ? ''
          : '-mt-[calc(var(--navbar-h,5rem)+1.5rem)] pb-12 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-16'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-20%,rgba(56,189,248,0.08),transparent_70%)]"
        aria-hidden
      />

      <div className="relative min-h-[48dvh] overflow-hidden border-b border-white/10 bg-[#171b22] sm:min-h-[52dvh] lg:min-h-[54dvh]">
        <header className="relative overflow-hidden">
          {heroImage ? (
            <img
              src={heroImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
              loading={previewMode ? 'lazy' : 'eager'}
              decoding="async"
            />
          ) : null}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/80 to-slate-900/40" />
          <Container
            className={`relative z-10 flex min-h-[48dvh] flex-col justify-center pb-8 sm:min-h-[52dvh] sm:pb-10 lg:min-h-[54dvh] lg:pb-12 ${
              previewMode
                ? 'pt-8'
                : 'pt-[calc(var(--navbar-h,5rem)+1rem)] sm:pt-[calc(var(--navbar-h,5rem)+1.5rem)]'
            }`}
          >
            <p className="hero-enter-eyebrow text-xs font-bold uppercase tracking-[0.22em] text-sky-200">
              {content?.heroEyebrow || 'Guía municipal'}
            </p>
            <h1 className="hero-enter-title mt-3 max-w-4xl font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {content?.heroTitle || 'Trámites y servicios'}
            </h1>
            <p className="hero-enter-subtitle mt-3 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
              {content?.heroSubtitle || ''}
            </p>
            <div className="hero-enter-actions mt-6 flex flex-wrap gap-3">
              {isExternalHref(content?.heroPrimaryHref) ? (
                <a
                  href={resolveHref(content?.heroPrimaryHref)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[#171b22] shadow-sm transition hover:bg-slate-100"
                >
                  {content?.heroPrimaryLabel || 'Ver trámites'}
                </a>
              ) : (
                <a
                  href={resolveHref(content?.heroPrimaryHref)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[#171b22] shadow-sm transition hover:bg-slate-100"
                >
                  {content?.heroPrimaryLabel || 'Ver trámites'}
                </a>
              )}
              <Link
                to={resolveHref(content?.heroSecondaryHref)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/35 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/55 hover:bg-white/15"
              >
                {content?.heroSecondaryLabel || 'Atención al ciudadano'}
              </Link>
            </div>
          </Container>
        </header>
      </div>

      <Container className="relative">
        <RevealOnScroll variant="slow">
          <article className="mt-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.12)]">
            <div className="grid gap-0 lg:grid-cols-12">
              <div className="border-b border-slate-100 p-6 lg:col-span-8 lg:border-b-0 lg:border-r lg:p-8">
                <h2 className="text-lg font-bold tracking-tight text-[#171b22]">
                  Cómo iniciar tu gestión
                </h2>
                <ol className="mt-5 grid gap-3 sm:grid-cols-2">
                  {(content?.steps || []).map((step, i) => (
                    <li
                      key={`${i}-${step}`}
                      className="flex gap-3 rounded-xl bg-slate-50/80 px-4 py-3.5 ring-1 ring-slate-100"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-[#4b505a]">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <aside className="p-6 lg:col-span-4 lg:p-8">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
                  Horarios y canales
                </h3>
                <ul className="mt-4 space-y-2">
                  {(content?.scheduleLines || []).map((line) => (
                    <li
                      key={line}
                      className="rounded-lg border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 text-sm text-[#4b505a]"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </article>
        </RevealOnScroll>

        <section id="tramites-disponibles" className="mt-12 scroll-mt-32 sm:mt-14">
          <RevealOnScroll variant="slow">
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
                {content?.proceduresEyebrow || 'Trámites disponibles'}
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl lg:text-4xl">
                {content?.proceduresTitle || 'Directorio de servicios'}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#5c6370] sm:mx-0">
                Elegí el trámite que necesitás. Cada tarjeta te lleva al canal de gestión correspondiente.
              </p>
            </div>

            {categories.length > 1 ? (
              <div
                className="mt-8 flex flex-wrap justify-center gap-2 sm:justify-start"
                role="tablist"
                aria-label="Filtrar por categoría"
              >
                {categories.map((item) => {
                  const active = item === category
                  return (
                    <button
                      key={item}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setCategory(item)}
                      className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                        active
                          ? 'bg-sky-600 text-white shadow-md shadow-sky-500/25'
                          : 'border border-slate-200 bg-white text-[#4b505a] hover:border-sky-200 hover:text-sky-800'
                      }`}
                    >
                      {item}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </RevealOnScroll>

          <div className="mt-8 sm:mt-10">
            <ServicesGrid
              services={visible}
              previewMode={previewMode}
              reduceMotion={reduceMotion}
            />
          </div>
        </section>

        <section className="mt-14 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-10">
          <RevealOnScroll variant="slow" className="lg:col-span-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
              Preguntas frecuentes
            </h2>
            <p className="mt-2 font-serif text-2xl font-bold text-[#171b22]">Antes de iniciar</p>
            <p className="mt-3 text-sm leading-relaxed text-[#5c6370]">
              Respuestas orientativas. Para casos puntuales, abrí una consulta en Atención al
              ciudadano.
            </p>
          </RevealOnScroll>
          <RevealOnScroll variant="slow" delayMs={previewMode ? 0 : 110} className="lg:col-span-7">
            <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.1)]">
              {faqList.map((item) => {
                const open = openFaq === item.id
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? '' : item.id)}
                      className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors duration-300 hover:bg-slate-50/80 sm:px-6 sm:py-5"
                      aria-expanded={open}
                    >
                      <span className="text-sm font-semibold text-[#171b22] sm:text-base">
                        {item.q}
                      </span>
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-300 ${
                          open ? 'rotate-180 border-sky-200 bg-sky-50 text-sky-700' : ''
                        }`}
                        aria-hidden
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </span>
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm leading-relaxed text-[#5c6370] sm:px-6">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </RevealOnScroll>
        </section>

        <RevealOnScroll variant="newsCardSlow" delayMs={previewMode ? 0 : 140}>
          <section className="mt-12 overflow-hidden rounded-3xl border border-slate-800/20 bg-linear-to-br from-[#171b22] via-slate-800 to-[#1e293b] p-8 text-center shadow-xl sm:mt-14 sm:p-10">
            <p className="font-serif text-xl font-bold text-white sm:text-2xl">
              {content?.finalCtaTitle || '¿No encontrás tu trámite?'}
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
              {content?.finalCtaText || ''}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <LinkButton to={resolveHref(content?.finalPrimaryHref)}>
                {content?.finalPrimaryLabel || 'Ir a Atención al ciudadano'}
              </LinkButton>
              <Link
                to={resolveHref(content?.finalSecondaryHref)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                {content?.finalSecondaryLabel || 'Ver novedades'}
              </Link>
            </div>
          </section>
        </RevealOnScroll>
      </Container>
    </section>
  )
}

export function ServicesPublicSkeleton() {
  return (
    <section className="relative -mt-[calc(var(--navbar-h,5rem)+1.5rem)] overflow-hidden bg-[#f4f5f7] pb-12 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-16">
      <div className="h-64 animate-pulse bg-slate-200 sm:h-72" />
      <Container className="relative mt-8">
        <div className="h-40 animate-pulse rounded-2xl bg-white" />
        <div className="mt-12">
          <div className="mx-auto h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
          <div className="mx-auto mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-100" />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i}>
                <MunicipalServiceCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}

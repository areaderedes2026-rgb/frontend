import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'
import { Container } from '../ui/Container.jsx'
import { LinkButton } from '../ui/LinkButton.jsx'
import {
  MunicipalServiceCard,
  MunicipalServiceDetailModal,
} from './MunicipalServiceDirectory.jsx'
import { buildServiceCategories, normalizeMunicipalService } from '../../data/servicesPageContent.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { ROUTES } from '../../utils/constants.js'

function resolveHref(href) {
  const value = String(href || '').trim()
  if (!value) return ROUTES.atencionCiudadano
  if (value.startsWith('#') || value.startsWith('http')) return value
  return value.startsWith('/') ? value : `/${value}`
}

function isExternalHref(href) {
  return String(href || '').startsWith('http')
}

export function ServicesPublicView({ content, services = [], previewMode = false }) {
  const [category, setCategory] = useState('Todos')
  const [detailService, setDetailService] = useState(null)
  const faqList = Array.isArray(content?.faq) ? content.faq : []
  const [openFaq, setOpenFaq] = useState(faqList[0]?.id || '')

  const categories = useMemo(() => buildServiceCategories(content), [content])
  const activeServices = useMemo(
    () =>
      [...services]
        .filter((item) => item.isActive !== false)
        .map((item, index) => normalizeMunicipalService(item, index + 1))
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
      className={`relative overflow-hidden bg-linear-to-b from-[#f1eee8] via-[#f7f7f5] to-[#fcfcfa] ${
        previewMode
          ? ''
          : '-mt-[calc(var(--navbar-h,5rem)+1.5rem)] pb-12 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-16'
      }`}
    >
      <MunicipalServiceDetailModal
        open={Boolean(detailService)}
        service={detailService}
        onClose={() => setDetailService(null)}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_20%_-10%,rgba(56,189,248,0.12),transparent_65%)]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_100%_10%,rgba(15,23,42,0.12),transparent_70%)]"
        aria-hidden
      />

      <div className="relative min-h-[52dvh] overflow-hidden border-b border-white/10 bg-[#171b22] sm:min-h-[56dvh] lg:min-h-[58dvh]">
        <header className="relative overflow-hidden">
          {heroImage ? (
            <img
              src={heroImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading={previewMode ? 'lazy' : 'eager'}
              decoding="async"
            />
          ) : null}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/88 to-slate-900/35" />
          <Container
            className={`relative z-10 flex min-h-[52dvh] flex-col justify-center pb-8 sm:min-h-[56dvh] sm:pb-10 lg:min-h-[58dvh] lg:pb-12 ${
              previewMode
                ? 'pt-8'
                : 'pt-[calc(var(--navbar-h,5rem)+1rem)] sm:pt-[calc(var(--navbar-h,5rem)+1.5rem)]'
            }`}
          >
            <p className="hero-enter-eyebrow text-xs font-bold uppercase tracking-[0.22em] text-sky-200">
              {content?.heroEyebrow || 'Guía municipal'}
            </p>
            <h1 className="hero-enter-title mt-3 max-w-4xl font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {content?.heroTitle || 'Servicios al vecino'}
            </h1>
            <p className="hero-enter-subtitle mt-3 max-w-3xl text-sm leading-relaxed text-slate-100 sm:text-base">
              {content?.heroSubtitle || ''}
            </p>
            <div className="hero-enter-actions mt-5 flex flex-wrap gap-3">
              {isExternalHref(content?.heroPrimaryHref) ? (
                <a
                  href={resolveHref(content?.heroPrimaryHref)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#171b22] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222831]"
                >
                  {content?.heroPrimaryLabel || 'Ver trámites'}
                </a>
              ) : (
                <a
                  href={resolveHref(content?.heroPrimaryHref)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#171b22] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222831]"
                >
                  {content?.heroPrimaryLabel || 'Ver trámites'}
                </a>
              )}
              <Link
                to={resolveHref(content?.heroSecondaryHref)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/15"
              >
                {content?.heroSecondaryLabel || 'Atención al ciudadano'}
              </Link>
            </div>
          </Container>
        </header>
      </div>

      <Container className="relative">
        <RevealOnScroll variant="slow">
          <article className="mt-8 overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
            <div className="grid gap-0 border-t border-[#ddd7ca] lg:grid-cols-12">
              <div className="border-b border-[#ddd7ca] p-5 lg:col-span-8 lg:border-b-0 lg:border-r sm:p-6">
                <h2 className="text-base font-semibold text-slate-900">Cómo iniciar tu gestión</h2>
                <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(content?.steps || []).map((step, i) => (
                    <li key={`${i}-${step}`} className="rounded-xl border border-[#ddd7ca] bg-[#f8f7f3] p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                        Paso {i + 1}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[#3e434d]">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <aside className="p-5 sm:p-6 lg:col-span-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-sky-800">
                  Horarios y canales
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-[#3e434d]">
                  {(content?.scheduleLines || []).map((line) => (
                    <li
                      key={line}
                      className="rounded-lg border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </article>
        </RevealOnScroll>

        <section id="tramites-disponibles" className="mt-10 sm:mt-12">
          <RevealOnScroll variant="slow">
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-800">
                  {content?.proceduresEyebrow || 'Trámites disponibles'}
                </p>
                <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                  {content?.proceduresTitle || 'Directorio de servicios'}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      item === category
                        ? 'bg-[#171b22] text-white'
                        : 'border border-[#d8d5cd] bg-white text-[#3e434d] hover:border-sky-200 hover:text-[#171b22]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          {visible.length === 0 ? (
            <p className="rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 text-center text-sm text-[#4b505a]">
              No hay trámites publicados en esta categoría.
            </p>
          ) : (
            <ul className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((item, idx) => (
                <li key={item.id || item.slug} className="h-full">
                  <RevealOnScroll variant="newsCardSlow" delayMs={previewMode ? 0 : idx * 80} className="h-full">
                    <MunicipalServiceCard
                      service={item}
                      onVerMas={setDetailService}
                      className="h-full"
                    />
                  </RevealOnScroll>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-10">
          <RevealOnScroll variant="slow" className="lg:col-span-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-sky-800">
              Preguntas frecuentes
            </h2>
            <p className="mt-2 font-serif text-2xl font-bold text-[#171b22]">
              Antes de iniciar un trámite
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#4b505a]">
              Estas respuestas orientan la gestión inicial. Para casos puntuales podés abrir una
              consulta en Atención al ciudadano.
            </p>
          </RevealOnScroll>
          <RevealOnScroll variant="slow" delayMs={previewMode ? 0 : 110} className="lg:col-span-7">
            <div className="divide-y divide-[#ddd7ca] rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
              {faqList.map((item) => {
                const open = openFaq === item.id
                return (
                  <div key={item.id} className="px-1">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? '' : item.id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-[#f8f7f3] sm:px-5 sm:py-5"
                      aria-expanded={open}
                    >
                      <span className="text-sm font-semibold text-[#171b22] sm:text-base">
                        {item.q}
                      </span>
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#ddd7ca] bg-white text-slate-500 transition ${
                          open ? 'rotate-180 border-sky-200 text-sky-700' : ''
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
                        <p className="px-4 pb-4 text-sm leading-relaxed text-[#4b505a] sm:px-5 sm:pb-5">
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
          <section className="mt-10 overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-center shadow-lg sm:mt-12 sm:p-10">
            <p className="font-serif text-xl font-bold text-white sm:text-2xl">
              {content?.finalCtaTitle || '¿No encontrás tu trámite?'}
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
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

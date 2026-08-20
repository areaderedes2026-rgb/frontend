import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FdcArtistsSection,
  FdcGallerySection,
  FdcNewsSection,
  FdcScheduleSection,
  FdcSectionNav,
  FdcSectionTitle,
  FdcSponsorsSection,
  FdcTicketsSection,
} from '../../components/fdc/FdcFestivalSections.jsx'
import { FdcFestivalHero } from '../../components/fdc/FdcFestivalHero.jsx'
import { FdcStallApplicationForm } from '../../components/fdc/FdcStallApplicationForm.jsx'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { Container } from '../../components/ui/Container.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import {
  DEFAULT_FDC_CONTENT,
  FDC_DEFAULT_HERO_IMAGE,
  formatFdcDateLabel,
  getFdcFormWindowState,
  mergeFdcContent,
} from '../../data/fdcContent.js'
import { fetchFdcContent } from '../../services/fdcService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'

function FdcSubmitSuccess({ result }) {
  const id = result?.id
  const email = result?.email || ''
  const emailQueued = Boolean(result?.emailQueued)

  return (
    <div
      id="fdc-exito"
      tabIndex={-1}
      className="flex min-h-[calc(100dvh-var(--navbar-h,5rem))] flex-col justify-center py-6 outline-none sm:py-10"
      role="status"
      aria-live="polite"
    >
      <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-[0_12px_40px_-24px_rgba(23,27,34,0.35)] sm:rounded-3xl">
        <div className="border-b border-emerald-100 bg-linear-to-br from-emerald-50 via-white to-[#f3f7fb] px-4 py-7 text-center sm:px-8 sm:py-10">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm"
            aria-hidden
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-800 sm:text-xs">
            Listo
          </p>
          <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
            ¡Preinscripción enviada!
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#4b505a] sm:text-base">
            Recibimos tu solicitud de puesto comercial. Guardá el número de comprobante.
          </p>
        </div>

        <div className="space-y-5 px-4 py-6 sm:px-8 sm:py-8">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
              Número de solicitud
            </p>
            <p className="mt-1 font-serif text-4xl font-bold tabular-nums text-[#171b22] sm:text-5xl">
              #{id ?? '—'}
            </p>
          </div>

          <p className="text-center text-sm leading-relaxed text-[#4b505a]">
            {emailQueued && email
              ? `La constancia se está enviando a ${email}. Revisá la bandeja de entrada y spam en unos minutos.`
              : email
                ? `Tu solicitud quedó registrada. Si no llega la constancia a ${email}, consultá en la municipalidad con este número.`
                : 'Tu solicitud quedó registrada. Consultá en la municipalidad con el número de solicitud si necesitás novedades.'}
          </p>

          <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3.5 py-3 text-center text-xs leading-relaxed text-amber-950 sm:text-sm">
            Esta preinscripción no implica la adjudicación del espacio. La organización evaluará cada
            solicitud según disponibilidad y requisitos.
          </p>

          <div className="flex justify-center pt-1">
            <Link
              to={ROUTES.home}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#ddd7ca] bg-white px-5 text-sm font-semibold text-[#171b22] transition hover:border-sky-200 hover:bg-sky-50"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FiestaDelCaballo() {
  const apiEnabled = isApiConfigured()
  const [page, setPage] = useState(() =>
    apiEnabled ? { ...DEFAULT_FDC_CONTENT, heroImageUrl: '' } : { ...DEFAULT_FDC_CONTENT },
  )
  const [hydrated, setHydrated] = useState(!apiEnabled)
  const [toast, setToast] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!apiEnabled) return
      try {
        const remote = await fetchFdcContent()
        if (!cancelled) setPage(mergeFdcContent(DEFAULT_FDC_CONTENT, remote || {}))
      } catch {
        if (!cancelled) setPage({ ...DEFAULT_FDC_CONTENT })
      } finally {
        if (!cancelled) setHydrated(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [apiEnabled])

  useEffect(() => {
    if (!submitSuccess) return
    const preferReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, left: 0, behavior: preferReduced ? 'auto' : 'smooth' })
    const t = window.setTimeout(() => {
      document.getElementById('fdc-exito')?.focus?.({ preventScroll: true })
    }, 120)
    return () => window.clearTimeout(t)
  }, [submitSuccess])

  const windowState = useMemo(() => getFdcFormWindowState(page), [page])
  const formOpen = windowState === 'open'
  const fromLabel = formatFdcDateLabel(page.formOpenFrom)
  const untilLabel = formatFdcDateLabel(page.formOpenUntil)
  const windowMessage =
    windowState === 'before'
      ? `La preinscripción abre el ${fromLabel || 'día indicado'}.`
      : windowState === 'after'
        ? `La preinscripción cerró el ${untilLabel || 'día indicado'}.`
        : ''

  const heroImage =
    page.heroImageUrl?.trim() || DEFAULT_FDC_CONTENT.heroImageUrl?.trim() || FDC_DEFAULT_HERO_IMAGE

  const primaryCta =
    page.showPrimaryButton !== false && page.heroPrimaryLabel
      ? { label: page.heroPrimaryLabel, href: page.heroPrimaryHref || '#solicitud-puestos' }
      : null
  const secondaryCta =
    page.showSecondaryButton !== false && page.heroSecondaryLabel
      ? { label: page.heroSecondaryLabel, href: page.heroSecondaryHref || '#cronograma' }
      : null

  if (submitSuccess) {
    return (
      <>
        {toast ? <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} /> : null}
        <section className="relative bg-linear-to-b from-emerald-50/80 via-[#f7f7f5] to-[#fcfcfa] pb-10 sm:pb-14">
          <Container className="relative max-w-[min(100%,28rem)]!">
            <FdcSubmitSuccess result={submitSuccess} />
          </Container>
        </section>
      </>
    )
  }

  return (
    <>
      {toast ? <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} /> : null}

      <div className="relative -mt-[calc(var(--navbar-h,5rem)+1.5rem)] flex h-dvh max-h-dvh flex-col sm:-mt-[calc(var(--navbar-h,5rem)+2rem)]">
        <FdcFestivalHero
          contentReady={hydrated}
          imageUrl={hydrated ? heroImage : ''}
          overlayOpacity={page.overlayOpacity}
          eyebrow={page.showHeroBadge !== false ? page.heroEyebrow : ''}
          title={page.showHeroTitle !== false ? page.heroTitle : ''}
          subtitle={page.showHeroSubtitle !== false ? page.heroSubtitle : ''}
          primaryCta={hydrated ? primaryCta : null}
          secondaryCta={hydrated ? secondaryCta : null}
        />
        <FdcSectionNav items={page.sectionNav} />
      </div>

      {(page.artists?.items || []).some((a) => a?.name) ? (
        <section
          id="cartelera"
          className="relative isolate border-y border-[#e8e5dd] bg-[#f7f7f5] py-14 sm:py-16 lg:py-20 scroll-mt-[calc(var(--navbar-h,5rem)+4rem)]"
        >
          <Container className="relative z-10">
            <RevealOnScroll variant="slow">
              <FdcArtistsSection artists={page.artists} />
            </RevealOnScroll>
          </Container>
        </section>
      ) : null}

      {(page.schedule?.days || []).length > 0 ? (
        <section
          id="cronograma"
          className="relative isolate border-y border-white/10 bg-[#171b22] py-14 text-white sm:py-16 lg:py-20 scroll-mt-[calc(var(--navbar-h,5rem)+4rem)]"
        >
          <Container className="relative z-10">
            <RevealOnScroll variant="slow">
              <FdcScheduleSection schedule={page.schedule} />
            </RevealOnScroll>
          </Container>
        </section>
      ) : null}

      {String(page.tickets?.title || '').trim() ? (
        <RevealOnScroll variant="slow">
          <FdcTicketsSection tickets={page.tickets} />
        </RevealOnScroll>
      ) : null}

      {(page.news?.items || []).some((n) => n?.title) ? (
        <section
          id="noticias"
          className="relative isolate border-y border-[#e8e5dd] bg-[#f7f7f5] py-14 sm:py-16 lg:py-20 scroll-mt-[calc(var(--navbar-h,5rem)+4rem)]"
        >
          <Container className="relative z-10">
            <RevealOnScroll variant="slow">
              <FdcNewsSection news={page.news} />
            </RevealOnScroll>
          </Container>
        </section>
      ) : null}

      {(page.gallery?.items || []).some((g) => g?.imageUrl) ? (
        <section
          id="galeria"
          className="relative isolate border-y border-white/10 bg-[#171b22] py-14 text-white sm:py-16 lg:py-20 scroll-mt-[calc(var(--navbar-h,5rem)+4rem)]"
        >
          <Container className="relative z-10">
            <RevealOnScroll variant="slow">
              <FdcGallerySection gallery={page.gallery} tone="dark" />
            </RevealOnScroll>
          </Container>
        </section>
      ) : null}

      {(page.sponsors?.items || []).some((s) => s?.logoUrl || s?.name) ? (
        <section className="relative isolate border-y border-[#e8e5dd] bg-[#f7f7f5] py-14 sm:py-16 lg:py-20">
          <Container className="relative z-10">
            <RevealOnScroll variant="slow">
              <FdcSponsorsSection sponsors={page.sponsors} tone="light" />
            </RevealOnScroll>
          </Container>
        </section>
      ) : null}

      <section
        id="solicitud-puestos"
        className="relative isolate border-y border-white/10 bg-[#171b22] py-14 text-white sm:py-16 lg:py-20 scroll-mt-[calc(var(--navbar-h,5rem)+4rem)]"
      >
        <Container className="relative z-10 max-w-[min(100%,96rem)]!">
          <RevealOnScroll variant="slow">
            <FdcSectionTitle
              title={page.ctaTitle || 'Solicitud de puestos comerciales'}
              tone="dark"
            />
            {fromLabel && untilLabel ? (
              <p className="mb-5 text-center text-xs font-medium text-slate-300 sm:mb-6 sm:text-sm">
                Periodo de preinscripción:{' '}
                <span className="font-semibold text-white">
                  {fromLabel} al {untilLabel}
                </span>
              </p>
            ) : null}
            <FdcStallApplicationForm
              formNotice={page.formNotice}
              formOpen={formOpen}
              windowMessage={windowMessage}
              onSuccess={(result) => {
                const id = result?.application?.id
                const email = String(result?.application?.email || '').trim()
                setSubmitSuccess({
                  id,
                  email,
                  emailQueued: Boolean(result?.emailQueued || result?.emailSent),
                })
                setToast({
                  variant: 'success',
                  message: id
                    ? `Preinscripción enviada. Número de solicitud: #${id}.`
                    : 'Preinscripción enviada correctamente.',
                })
              }}
            />
          </RevealOnScroll>
        </Container>
      </section>
    </>
  )
}

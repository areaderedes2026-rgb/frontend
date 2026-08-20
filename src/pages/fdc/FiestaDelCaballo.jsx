import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FdcArtistsSection,
  FdcGallerySection,
  FdcIntroBlock,
  FdcNewsSection,
  FdcScheduleSection,
  FdcSectionNav,
  FdcSponsorsSection,
  FdcTicketsSection,
  FdcUsefulInfoSection,
} from '../../components/fdc/FdcFestivalSections.jsx'
import { FdcStallApplicationForm } from '../../components/fdc/FdcStallApplicationForm.jsx'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { PageListHeroHeader } from '../../components/shared/PageListHeroHeader.jsx'
import { Container } from '../../components/ui/Container.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import {
  DEFAULT_FDC_CONTENT,
  FDC_DEFAULT_HERO_IMAGE,
  fdcHeroToHeaderProps,
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

  const heroProps = {
    ...(hydrated ? fdcHeroToHeaderProps(page) : {}),
    imageUrl: hydrated ? heroImage : '',
    contentReady: hydrated,
  }

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

      <section className="relative -mt-[calc(var(--navbar-h,5rem)+1.5rem)] overflow-hidden bg-linear-to-b from-[#efe8dc] via-[#f7f7f5] to-[#fcfcfa] pb-10 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-14">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_15%_-10%,rgba(180,83,9,0.16),transparent_60%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_100%_5%,rgba(15,23,42,0.14),transparent_70%)]"
          aria-hidden
        />

        <PageListHeroHeader {...heroProps} />

        {page.heroDateBadge || page.heroSlogan ? (
          <Container className="relative pt-5 text-center sm:pt-7">
            {page.heroDateBadge ? (
              <span className="inline-flex items-center rounded-full border border-amber-200/90 bg-amber-50/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-amber-950 sm:text-sm">
                {page.heroDateBadge}
              </span>
            ) : null}
            {page.heroSlogan ? (
              <p className="mx-auto mt-3 max-w-2xl font-serif text-base italic leading-relaxed text-[#4b505a] sm:text-lg">
                {page.heroSlogan}
              </p>
            ) : null}
          </Container>
        ) : null}

        <FdcSectionNav items={page.sectionNav} />

        <Container className="relative max-w-[min(100%,72rem)]!">
          <p className="pt-5 text-sm font-medium text-sky-700 sm:pt-7">
            <Link to={ROUTES.home} className="transition-colors hover:text-sky-900">
              ← Volver al inicio
            </Link>
          </p>

          <div className="mt-5 space-y-10 pb-8 sm:mt-6 sm:space-y-12 sm:pb-10">
            <RevealOnScroll variant="slow">
              <FdcIntroBlock
                title={page.introTitle}
                paragraphs={page.introParagraphs}
                highlights={page.highlights}
              />
            </RevealOnScroll>

            <RevealOnScroll variant="slow">
              <FdcScheduleSection schedule={page.schedule} />
            </RevealOnScroll>

            <RevealOnScroll variant="slow">
              <FdcArtistsSection artists={page.artists} />
            </RevealOnScroll>

            <RevealOnScroll variant="slow">
              <FdcTicketsSection tickets={page.tickets} />
            </RevealOnScroll>

            <RevealOnScroll variant="slow">
              <FdcNewsSection news={page.news} />
            </RevealOnScroll>

            <RevealOnScroll variant="slow">
              <FdcGallerySection gallery={page.gallery} />
            </RevealOnScroll>

            <RevealOnScroll variant="slow">
              <FdcUsefulInfoSection usefulInfo={page.usefulInfo} />
            </RevealOnScroll>

            <RevealOnScroll variant="slow">
              <FdcSponsorsSection sponsors={page.sponsors} />
            </RevealOnScroll>
          </div>
        </Container>

        <Container className="relative max-w-[min(100%,42rem)]!">
          <section className="scroll-mt-[calc(var(--navbar-h,5rem)+4rem)] rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-7">
            {page.ctaTitle ? (
              <h2 className="font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                {page.ctaTitle}
              </h2>
            ) : null}
            {page.ctaBody ? (
              <p className="mt-3 text-sm leading-relaxed text-[#4b505a] sm:text-base">{page.ctaBody}</p>
            ) : null}

            {fromLabel && untilLabel ? (
              <p className="mt-4 text-center text-xs font-medium text-[#4b505a] sm:text-sm">
                Periodo de preinscripción:{' '}
                <span className="font-semibold text-[#171b22]">
                  {fromLabel} al {untilLabel}
                </span>
              </p>
            ) : null}

            <div className="mt-5">
              <RevealOnScroll variant="slow">
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
            </div>
          </section>
        </Container>
      </section>
    </>
  )
}

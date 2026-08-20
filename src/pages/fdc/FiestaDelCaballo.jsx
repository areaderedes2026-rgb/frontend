import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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

export function FiestaDelCaballo() {
  const apiEnabled = isApiConfigured()
  const [page, setPage] = useState(() =>
    apiEnabled ? { ...DEFAULT_FDC_CONTENT, heroImageUrl: '' } : { ...DEFAULT_FDC_CONTENT },
  )
  const [hydrated, setHydrated] = useState(!apiEnabled)
  const [toast, setToast] = useState(null)
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

  return (
    <>
      {toast ? <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} /> : null}

      <section className="relative -mt-[calc(var(--navbar-h,5rem)+1.5rem)] overflow-hidden bg-linear-to-b from-[#efe8dc] via-[#f7f7f5] to-[#fcfcfa] pb-12 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-16">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_15%_-10%,rgba(180,83,9,0.16),transparent_60%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_100%_5%,rgba(15,23,42,0.14),transparent_70%)]"
          aria-hidden
        />

        <PageListHeroHeader {...heroProps} />

        <Container className="relative max-w-[min(100%,96rem)]!">
          <p className="pt-6 text-sm font-medium text-sky-700 sm:pt-8">
            <Link to={ROUTES.home} className="transition-colors hover:text-sky-900">
              ← Volver al inicio
            </Link>
          </p>

          <article className="mt-5 overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
            <div className="space-y-10 p-5 sm:p-7 lg:p-10">
              <RevealOnScroll variant="slow">
                <section className="rounded-3xl border border-[#ddd7ca] bg-[#f8f7f3] p-6 sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
                    Fiesta del Caballo
                  </p>
                  <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                    {page.introTitle}
                  </h2>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#4b505a] sm:text-base">
                    {(page.introParagraphs || []).map((paragraph) => (
                      <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                    ))}
                  </div>
                  {page.highlights?.length > 0 ? (
                    <dl className="mt-6 grid gap-3 sm:grid-cols-3">
                      {page.highlights.map((item) => (
                        <div
                          key={`${item.label}-${item.value}`}
                          className="rounded-2xl border border-[#ddd7ca] bg-white px-4 py-3"
                        >
                          <dt className="text-[11px] font-bold uppercase tracking-wide text-amber-800">
                            {item.label}
                          </dt>
                          <dd className="mt-1 text-sm font-semibold text-[#171b22]">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="#solicitud-puestos"
                      className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#171b22] px-5 text-sm font-semibold text-white transition hover:bg-black"
                    >
                      Ir al formulario de puestos
                    </a>
                    <Link
                      to={ROUTES.events}
                      className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#ddd7ca] bg-white px-5 text-sm font-semibold text-[#171b22] transition hover:border-sky-200 hover:bg-sky-50"
                    >
                      Ver agenda municipal
                    </Link>
                  </div>
                </section>
              </RevealOnScroll>

              <RevealOnScroll variant="slow">
                <section>
                  <div className="mb-5 border-b border-[#ddd7ca] pb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
                      Preinscripción
                    </p>
                    <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                      Solicitud de puestos comerciales
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#4b505a]">
                      Completá el formulario. Al enviarlo vas a recibir una constancia automática en tu
                      correo con el número de solicitud.
                      {fromLabel && untilLabel
                        ? ` Periodo de preinscripción: ${fromLabel} al ${untilLabel}.`
                        : ''}
                    </p>
                  </div>

                  <FdcStallApplicationForm
                    formNotice={page.formNotice}
                    formOpen={formOpen}
                    windowMessage={windowMessage}
                    onSuccess={(result) => {
                      const id = result?.application?.id
                      const emailNote = result?.emailSent
                        ? ' Te enviamos la constancia a tu correo.'
                        : ' La solicitud quedó registrada; si no llega el mail, revisá spam o consultanos.'
                      setToast({
                        variant: 'success',
                        message: id
                          ? `Preinscripción enviada. Número de solicitud: #${id}.${emailNote}`
                          : `Preinscripción enviada.${emailNote}`,
                      })
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  />
                </section>
              </RevealOnScroll>

              {page.ctaTitle || page.ctaBody ? (
                <RevealOnScroll variant="slow">
                  <section className="rounded-3xl border border-[#ddd7ca] bg-linear-to-br from-amber-50/90 via-white to-[#f8f7f3] p-6 sm:p-8">
                    <h2 className="font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                      {page.ctaTitle}
                    </h2>
                    {page.ctaBody ? (
                      <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-[#4b505a] sm:text-base">
                        {page.ctaBody}
                      </p>
                    ) : null}
                  </section>
                </RevealOnScroll>
              ) : null}
            </div>
          </article>
        </Container>
      </section>
    </>
  )
}

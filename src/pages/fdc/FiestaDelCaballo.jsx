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

        <Container className="relative max-w-[min(100%,42rem)]!">
          <p className="pt-5 text-sm font-medium text-sky-700 sm:pt-7">
            <Link to={ROUTES.home} className="transition-colors hover:text-sky-900">
              ← Volver al inicio
            </Link>
          </p>

          {fromLabel && untilLabel ? (
            <p className="mt-3 text-center text-xs font-medium text-[#4b505a] sm:text-sm">
              Periodo de preinscripción:{' '}
              <span className="font-semibold text-[#171b22]">
                {fromLabel} al {untilLabel}
              </span>
            </p>
          ) : null}

          <div className="mt-4 sm:mt-5">
            <RevealOnScroll variant="slow">
              <FdcStallApplicationForm
                formNotice={page.formNotice}
                formOpen={formOpen}
                windowMessage={windowMessage}
                onSuccess={(result) => {
                  const id = result?.application?.id
                  const emailNote = result?.emailSent
                    ? ' Te enviamos la constancia a tu correo.'
                    : result?.emailQueued
                      ? ' En unos segundos te llega la constancia al correo.'
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
            </RevealOnScroll>
          </div>
        </Container>
      </section>
    </>
  )
}

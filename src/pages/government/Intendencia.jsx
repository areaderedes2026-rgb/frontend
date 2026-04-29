import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../../components/ui/Container.jsx'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import {
  DEFAULT_INTENDENCIA_CONTENT,
  mergeIntendenciaContent,
} from '../../data/intendenciaContent.js'
import { fetchIntendenciaContent } from '../../services/intendenciaService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'
import {
  HydrationDarkPanelRows,
  HydrationIntendenciaBioLines,
  HydrationIntendenciaPortrait,
} from '../../components/skeleton/PageHydrationSkeleton.jsx'

export function Intendencia() {
  const apiEnabled = isApiConfigured()
  const [content, setContent] = useState(() =>
    apiEnabled
      ? {
          ...DEFAULT_INTENDENCIA_CONTENT,
          heroImageUrl: '',
          mayorPhotoUrl: '',
          mayorName: '',
          mayorRole: '',
          mayorBio: '',
          contactEmail: '',
          contactPhone: '',
          officeHours: '',
        }
      : DEFAULT_INTENDENCIA_CONTENT,
  )
  const [loadingContent, setLoadingContent] = useState(apiEnabled)

  useEffect(() => {
    let cancelled = false
    async function loadContent() {
      if (!apiEnabled) return
      try {
        const remote = await fetchIntendenciaContent()
        if (!remote || cancelled) return
        setContent(mergeIntendenciaContent(DEFAULT_INTENDENCIA_CONTENT, remote))
      } catch {
        // Si falla API, se mantiene el contenido por defecto.
      } finally {
        if (!cancelled) setLoadingContent(false)
      }
    }
    loadContent()
    return () => {
      cancelled = true
    }
  }, [apiEnabled])

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-[#f7f9fc] via-[#fcfcfa] to-white pb-12 sm:pb-16">
      <Container className="max-w-[min(100%,96rem)]!">
        <p className="pt-1 text-sm font-medium text-sky-700">
          <Link to={ROUTES.home} className="transition-colors hover:text-sky-900">
            ← Volver al inicio
          </Link>
        </p>

        <div className="mt-5 grid gap-6 lg:grid-cols-12">
          <RevealOnScroll variant="newsCardSlow" delayMs={80} className="lg:col-span-8">
            <section
              id="intendencia"
              className="h-full rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
            >
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Intendencia
              </h2>
              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
                {loadingContent ? (
                  <HydrationIntendenciaPortrait />
                ) : (
                  <img
                    src={content.mayorPhotoUrl || content.heroImageUrl || '/favicon.png?v=2'}
                    alt={content.mayorName}
                    className="h-120 w-full rounded-2xl object-cover object-top ring-1 ring-slate-200/80 sm:w-52 lg:w-56"
                  />
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                    Intendente
                  </p>
                  {loadingContent ? (
                    <HydrationIntendenciaBioLines />
                  ) : (
                    <>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                        {content.mayorName}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        {content.mayorRole}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
                        {content.mayorBio}
                      </p>
                    </>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      to={ROUTES.areas}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-white"
                    >
                      Ver todas las áreas
                    </Link>
                    <a
                      href="#contacto-intendencia"
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white transition hover:bg-sky-800"
                    >
                      Contactar Intendencia
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </RevealOnScroll>

          <RevealOnScroll variant="slow" delayMs={120} className="lg:col-span-4">
            <aside
              id="contacto-intendencia"
              className="h-full rounded-3xl border border-slate-200/80 bg-slate-900 p-5 text-slate-100 shadow-sm sm:p-6"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
                Contacto directo
              </p>
              {loadingContent ? (
                <HydrationDarkPanelRows rows={3} className="mt-4" />
              ) : (
                <div className="mt-4 space-y-2 text-sm leading-relaxed">
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                    <span className="font-semibold">Correo:</span> {content.contactEmail}
                  </p>
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                    <span className="font-semibold">Teléfono:</span> {content.contactPhone}
                  </p>
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                    <span className="font-semibold">Horario:</span> {content.officeHours}
                  </p>
                </div>
              )}
              <div className="mt-5 rounded-xl border border-sky-300/30 bg-sky-500/10 p-3 text-xs text-sky-100">
                La intendencia articula con todas las áreas para priorizar obras, servicios y
                acciones comunitarias.
              </div>
            </aside>
          </RevealOnScroll>
        </div>

        <RevealOnScroll variant="newsCardSlow" delayMs={160}>
          <section className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Ejes de gestión
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                'Planificación y coordinación interáreas',
                'Cercanía institucional con vecinos',
                'Seguimiento de obras y servicios estratégicos',
                'Transparencia y acceso a la información pública',
                'Articulación con instituciones locales',
                'Mejora continua de la atención ciudadana',
              ].map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3 text-sm font-medium text-slate-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </RevealOnScroll>
      </Container>
    </section>
  )
}

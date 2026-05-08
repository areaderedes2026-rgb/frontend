import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../../components/ui/Container.jsx'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import {
  DEFAULT_LEGISLADOR_ESTE_CONTENT,
  mergeLegisladorEsteContent,
} from '../../data/legisladorEsteContent.js'
import { fetchLegisladorEsteContent } from '../../services/legisladorEsteService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'
import {
  HydrationDarkPanelRows,
  HydrationIntendenciaBioLines,
  HydrationIntendenciaPortrait,
} from '../../components/skeleton/PageHydrationSkeleton.jsx'

export function LegisladorEste() {
  const apiEnabled = isApiConfigured()
  const [content, setContent] = useState(() =>
    apiEnabled
      ? {
          ...DEFAULT_LEGISLADOR_ESTE_CONTENT,
          heroImageUrl: '',
          legislatorPhotoUrl: '',
          legislatorName: '',
          legislatorRole: '',
          legislatorBio: '',
          contactEmail: '',
          contactPhone: '',
          officeHours: '',
        }
      : DEFAULT_LEGISLADOR_ESTE_CONTENT,
  )
  const [loadingContent, setLoadingContent] = useState(apiEnabled)

  useEffect(() => {
    let cancelled = false
    async function loadContent() {
      if (!apiEnabled) return
      try {
        const remote = await fetchLegisladorEsteContent()
        if (!remote || cancelled) return
        setContent(mergeLegisladorEsteContent(DEFAULT_LEGISLADOR_ESTE_CONTENT, remote))
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

  const panelHasContent =
    Boolean(content.showContactEmail) ||
    Boolean(content.showContactPhone) ||
    Boolean(content.showOfficeHours) ||
    Boolean(content.showContactNote)
  const showContactPanel = Boolean(content.showContactPanel) && panelHasContent
  const showLegislatorPhoto = Boolean(content.showLegislatorPhoto)
  const showLegislatorRole = Boolean(content.showLegislatorRole)
  const showLegislatorBio = Boolean(content.showLegislatorBio)
  const showManagementAxes = Boolean(content.showManagementAxes)
  const profileColSpanClass = showContactPanel ? 'lg:col-span-8' : 'lg:col-span-12'

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-[#f7f9fc] via-[#fcfcfa] to-white pb-12 sm:pb-16">
      <Container className="max-w-[min(100%,96rem)]!">
        <p className="pt-1 text-sm font-medium text-sky-700">
          <Link to={ROUTES.home} className="transition-colors hover:text-sky-900">
            ← Volver al inicio
          </Link>
        </p>

        <div className="mt-5 grid gap-6 lg:grid-cols-12">
          <RevealOnScroll variant="newsCardSlow" delayMs={80} className={profileColSpanClass}>
            <section
              id="legislador-este"
              className="h-full rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
            >
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Legislador por el Este
              </h2>
              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
                {showLegislatorPhoto ? (
                  loadingContent ? (
                    <HydrationIntendenciaPortrait />
                  ) : (
                    <img
                      src={content.legislatorPhotoUrl || content.heroImageUrl || '/favicon.png?v=2'}
                      alt={content.legislatorName}
                      className="h-120 w-full rounded-2xl object-cover object-top ring-1 ring-slate-200/80 sm:w-52 lg:w-56"
                    />
                  )
                ) : null}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                    Legislador
                  </p>
                  {loadingContent ? (
                    <HydrationIntendenciaBioLines />
                  ) : (
                    <>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                        {content.legislatorName}
                      </h3>
                      {showLegislatorRole && content.legislatorRole ? (
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          {content.legislatorRole}
                        </p>
                      ) : null}
                      {showLegislatorBio && content.legislatorBio ? (
                        <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
                          {content.legislatorBio}
                        </p>
                      ) : null}
                    </>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      to={ROUTES.areas}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-white"
                    >
                      Ver todas las áreas
                    </Link>
                    {showContactPanel ? (
                      <a
                        href="#contacto-legislador-este"
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white transition hover:bg-sky-800"
                      >
                        Contactar al legislador
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          </RevealOnScroll>

          {showContactPanel ? (
            <RevealOnScroll variant="slow" delayMs={120} className="lg:col-span-4">
              <aside
                id="contacto-legislador-este"
                className="h-full rounded-3xl border border-slate-200/80 bg-slate-900 p-5 text-slate-100 shadow-sm sm:p-6"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
                  Contacto directo
                </p>
                {loadingContent ? (
                  <HydrationDarkPanelRows rows={3} className="mt-4" />
                ) : (
                  <div className="mt-4 space-y-2 text-sm leading-relaxed">
                    {content.showContactEmail && content.contactEmail ? (
                      <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                        <span className="font-semibold">Correo:</span> {content.contactEmail}
                      </p>
                    ) : null}
                    {content.showContactPhone && content.contactPhone ? (
                      <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                        <span className="font-semibold">Teléfono:</span> {content.contactPhone}
                      </p>
                    ) : null}
                    {content.showOfficeHours && content.officeHours ? (
                      <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                        <span className="font-semibold">Horario:</span> {content.officeHours}
                      </p>
                    ) : null}
                  </div>
                )}
                {content.showContactNote ? (
                  <div className="mt-5 rounded-xl border border-sky-300/30 bg-sky-500/10 p-3 text-xs text-sky-100">
                    El legislador articula con la intendencia y las áreas para canalizar
                    proyectos y reclamos de los vecinos en la legislatura.
                  </div>
                ) : null}
              </aside>
            </RevealOnScroll>
          ) : null}
        </div>

        {showManagementAxes ? (
          <RevealOnScroll variant="newsCardSlow" delayMs={160}>
            <section className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Ejes de gestión legislativa
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  'Representación territorial de la sección Este',
                  'Acompañamiento a gestiones municipales',
                  'Promoción de proyectos de ley locales',
                  'Articulación con organismos provinciales',
                  'Cercanía y escucha activa a vecinos',
                  'Transparencia y rendición pública de cuentas',
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
        ) : null}
      </Container>
    </section>
  )
}

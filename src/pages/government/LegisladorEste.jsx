import { useEffect, useState } from 'react'
import { Container } from '../../components/ui/Container.jsx'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { LinkButton } from '../../components/ui/LinkButton.jsx'
import { LegisladorCommissionsSection } from '../../components/legislador/LegisladorCommissionsSection.jsx'
import { LegisladorLawsSection } from '../../components/legislador/LegisladorLawsSection.jsx'
import { LegisladorProjectsSection } from '../../components/legislador/LegisladorProjectsSection.jsx'
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
} from '../../components/skeleton/PageHydrationSkeleton.jsx'

function ContactCell({ label, value, href }) {
  const inner = (
    <>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300/90">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className="group rounded-2xl border border-white/12 bg-white/6 px-4 py-3 transition hover:border-sky-300/35 hover:bg-white/10"
      >
        {inner}
      </a>
    )
  }

  return (
    <div className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3">
      {inner}
    </div>
  )
}

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
  const showPresentedProjects =
    Boolean(content.showPresentedProjects) && content.presentedProjects?.enabled !== false
  const showCommissions =
    Boolean(content.showCommissions) && content.commissions?.enabled !== false
  const showLaws = Boolean(content.showLaws) && content.laws?.enabled !== false

  return (
    <section className="relative -mt-[calc(var(--navbar-h,5rem)+1.5rem)] bg-[#f7f7f5] pb-12 pt-[calc(var(--navbar-h,5rem)+0.5rem)] sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-16 sm:pt-[calc(var(--navbar-h,5rem)+0.75rem)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_45%_at_20%_-10%,rgba(56,189,248,0.08),transparent_60%)]"
        aria-hidden
      />

      <Container className="relative max-w-[min(100%,96rem)]!">
        <h1 className="sr-only">{content.heroTitle || 'Legislador por el Este'}</h1>

        <RevealOnScroll variant="newsCardSlow" delayMs={80} className="mb-2">
          <article
            id="legislador-este"
            className="overflow-hidden rounded-[1.75rem] border border-[#ddd7ca] bg-white shadow-[0_24px_80px_-54px_rgba(15,23,42,0.35)]"
          >
            <div className="grid gap-0 lg:grid-cols-[300px_1fr] lg:items-stretch">
              {showLegislatorPhoto ? (
                <div className="relative aspect-square w-full overflow-hidden bg-slate-200 lg:aspect-auto lg:h-full lg:min-h-[300px]">
                  {loadingContent ? (
                    <div className="absolute inset-0 animate-pulse bg-slate-200" aria-hidden />
                  ) : (
                    <>
                      <img
                        src={content.legislatorPhotoUrl || content.heroImageUrl || '/favicon.png?v=2'}
                        alt={content.legislatorName}
                        className="absolute inset-0 h-full w-full object-cover object-top"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent lg:bg-linear-to-r lg:from-transparent lg:via-transparent lg:to-black/8"
                        aria-hidden
                      />
                    </>
                  )}
                </div>
              ) : null}

              <div className="flex flex-col justify-center p-5 pb-8 sm:p-7 sm:pb-10 lg:p-8 lg:pb-12">
                <p className="inline-flex w-fit rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-800">
                  Legislador
                </p>
                {loadingContent ? (
                  <HydrationIntendenciaBioLines className="mt-4" />
                ) : (
                  <>
                    <h2 className="mt-4 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                      {content.legislatorName}
                    </h2>
                    {showLegislatorRole && content.legislatorRole ? (
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        {content.legislatorRole}
                      </p>
                    ) : null}
                    {showLegislatorBio && content.legislatorBio ? (
                      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                        {content.legislatorBio}
                      </p>
                    ) : null}
                  </>
                )}
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <LinkButton to={ROUTES.areas} variant="secondary">
                    Ver todas las áreas
                  </LinkButton>
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

            {showContactPanel ? (
              <aside
                id="contacto-legislador-este"
                className="rounded-b-[1.75rem] border-t border-white/10 bg-[#171b22] px-5 py-6 sm:px-7 sm:py-7"
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-300">
                    Contacto directo
                  </p>
                  <p className="mt-1 max-w-xl text-sm text-slate-300">
                    Canales oficiales del despacho del legislador por el Este.
                  </p>
                </div>

                {loadingContent ? (
                  <HydrationDarkPanelRows rows={3} className="mt-4" />
                ) : (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {content.showContactEmail && content.contactEmail ? (
                      <ContactCell
                        label="Correo"
                        value={content.contactEmail}
                        href={`mailto:${content.contactEmail}`}
                      />
                    ) : null}
                    {content.showContactPhone && content.contactPhone ? (
                      <ContactCell
                        label="Teléfono"
                        value={content.contactPhone}
                        href={`tel:${content.contactPhone.replace(/\s/g, '')}`}
                      />
                    ) : null}
                    {content.showOfficeHours && content.officeHours ? (
                      <ContactCell label="Horario" value={content.officeHours} />
                    ) : null}
                  </div>
                )}

                {content.showContactNote ? (
                  <p className="mt-5 rounded-2xl border border-sky-300/20 bg-sky-500/10 px-4 py-3.5 text-sm leading-relaxed text-sky-100">
                    El legislador articula con la intendencia y las áreas para canalizar
                    proyectos y reclamos de los vecinos en la legislatura.
                  </p>
                ) : null}
              </aside>
            ) : null}
          </article>
        </RevealOnScroll>

        {showPresentedProjects ? (
          <LegisladorProjectsSection section={content.presentedProjects} />
        ) : null}

        {showCommissions ? (
          <LegisladorCommissionsSection section={content.commissions} />
        ) : null}

        {showLaws ? <LegisladorLawsSection section={content.laws} /> : null}
      </Container>
    </section>
  )
}

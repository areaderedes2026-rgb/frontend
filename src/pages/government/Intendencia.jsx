import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../../components/ui/Container.jsx'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { StorySection } from '../../components/home/StorySection.jsx'
import { LinkButton } from '../../components/ui/LinkButton.jsx'
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
} from '../../components/skeleton/PageHydrationSkeleton.jsx'

const MANAGEMENT_AXES = [
  'Planificación y coordinación interáreas',
  'Cercanía institucional con vecinos',
  'Seguimiento de obras y servicios estratégicos',
  'Transparencia y acceso a la información pública',
  'Articulación con instituciones locales',
  'Mejora continua de la atención ciudadana',
]

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

  const panelHasContent =
    Boolean(content.showContactEmail) ||
    Boolean(content.showContactPhone) ||
    Boolean(content.showOfficeHours) ||
    Boolean(content.showContactNote)
  const showContactPanel = Boolean(content.showContactPanel) && panelHasContent
  const showMayorPhoto = Boolean(content.showMayorPhoto)
  const showMayorRole = Boolean(content.showMayorRole)
  const showMayorBio = Boolean(content.showMayorBio)
  const showManagementAxes = Boolean(content.showManagementAxes)

  return (
    <section className="relative bg-[#f7f7f5] pb-12 sm:pb-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_45%_at_20%_-10%,rgba(56,189,248,0.08),transparent_60%)]"
        aria-hidden
      />

      <Container className="relative max-w-[min(100%,96rem)]! pt-[calc(var(--navbar-h,5rem)+1.25rem)] sm:pt-[calc(var(--navbar-h,5rem)+1.75rem)]">
        <p className="text-sm font-medium text-sky-700">
          <Link to={ROUTES.home} className="transition-colors hover:text-sky-900">
            ← Volver al inicio
          </Link>
        </p>

        <header className="mt-6 max-w-3xl">
          {loadingContent ? (
            <div className="animate-pulse space-y-3" aria-hidden>
              <div className="h-4 w-36 rounded bg-slate-200" />
              <div className="h-10 w-64 rounded bg-slate-200" />
              <div className="h-4 w-full max-w-xl rounded bg-slate-100" />
            </div>
          ) : (
            <>
              <p className="inline-flex rounded-full border border-[#ddd7ca] bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-sky-800">
                {content.heroEyebrow}
              </p>
              <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#171b22] sm:text-4xl">
                {content.heroTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#3e434d] sm:text-base">
                {content.heroSubtitle}
              </p>
            </>
          )}
        </header>

        <RevealOnScroll variant="newsCardSlow" delayMs={80} className="mt-8">
          <article
            id="perfil-intendente"
            className="rounded-[1.75rem] border border-[#ddd7ca] bg-white shadow-[0_24px_80px_-54px_rgba(15,23,42,0.35)]"
          >
            <div className="grid gap-0 lg:grid-cols-[minmax(0,300px)_1fr]">
              {showMayorPhoto ? (
                <div className="relative min-h-[240px] overflow-hidden rounded-t-[1.75rem] bg-slate-200 lg:min-h-[320px] lg:rounded-none lg:rounded-l-[1.75rem]">
                  {loadingContent ? (
                    <div className="absolute inset-0 animate-pulse bg-slate-200" aria-hidden />
                  ) : (
                    <>
                      <img
                        src={content.mayorPhotoUrl || content.heroImageUrl || '/favicon.png?v=2'}
                        alt={content.mayorName}
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

              <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-8">
                <p className="inline-flex w-fit rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-800">
                  Intendente
                </p>
                {loadingContent ? (
                  <HydrationIntendenciaBioLines className="mt-4" />
                ) : (
                  <>
                    <h2 className="mt-4 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                      {content.mayorName}
                    </h2>
                    {showMayorRole && content.mayorRole ? (
                      <p className="mt-1 text-sm font-semibold text-slate-600">{content.mayorRole}</p>
                    ) : null}
                    {showMayorBio && content.mayorBio ? (
                      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                        {content.mayorBio}
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
                      href="#contacto-intendencia"
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white transition hover:bg-sky-800"
                    >
                      Contactar Intendencia
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            {showContactPanel ? (
              <aside
                id="contacto-intendencia"
                className="rounded-b-[1.75rem] border-t border-white/10 bg-[#171b22] px-5 py-6 sm:px-7 sm:py-7"
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-300">
                    Contacto directo
                  </p>
                  <p className="mt-1 max-w-xl text-sm text-slate-300">
                    Canales oficiales del despacho de intendencia.
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
                    La intendencia articula con todas las áreas para priorizar obras, servicios y
                    acciones comunitarias.
                  </p>
                ) : null}
              </aside>
            ) : null}
          </article>
        </RevealOnScroll>
      </Container>

      {showManagementAxes ? (
        <StorySection
          eyebrow="Gestión municipal"
          title="Ejes de gestión"
          subtitle="Prioridades que orientan la coordinación del gobierno local y el trabajo con la comunidad."
          tone="light"
          className="pb-0!"
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MANAGEMENT_AXES.map((item, index) => (
              <RevealOnScroll key={item} variant="slow" delayMs={60 + index * 40}>
                <li className="group flex h-full gap-3 rounded-2xl border border-[#ddd7ca] bg-white/80 px-4 py-4 shadow-sm transition hover:border-sky-200/80 hover:bg-white hover:shadow-md">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#171b22] text-xs font-bold text-white">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm font-medium leading-snug text-[#3e434d] group-hover:text-[#171b22]">
                    {item}
                  </p>
                </li>
              </RevealOnScroll>
            ))}
          </ul>
        </StorySection>
      ) : null}
    </section>
  )
}

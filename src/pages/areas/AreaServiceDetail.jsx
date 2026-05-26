import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { Container } from '../../components/ui/Container.jsx'
import { getAreaProfileBySlug, mergeAreaProfile } from '../../data/areaProfiles.js'
import { fetchAreaProfile } from '../../services/areaProfilesService.js'
import { fetchAreaPublicBySlug } from '../../services/areasService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { ServiceAuthoritySection } from '../../components/areas/ServiceAuthoritySection.jsx'
import { ServiceContactSection } from '../../components/areas/ServiceContactSection.jsx'
import { ServiceGallerySection } from '../../components/areas/ServiceGallerySection.jsx'
import { isServiceAuthoritySectionVisible } from '../../utils/serviceAuthority.js'
import { isServiceContactSectionVisible } from '../../utils/serviceContacts.js'
import { isServiceGallerySectionVisible } from '../../utils/serviceGallery.js'

function ServiceDetailSkeleton() {
  return (
    <section className="relative pb-14 sm:pb-20">
      <Container className="max-w-[min(100%,96rem)]!">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200/80" />
        <div className="mt-5 overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa]">
          <div className="h-64 animate-pulse bg-slate-100 sm:h-80 lg:h-96" />
          <div className="space-y-4 p-6 sm:p-8">
            <div className="h-8 w-2/3 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-50" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-50" />
          </div>
        </div>
      </Container>
    </section>
  )
}

function InfoRow({ label, children }) {
  if (!children) return null
  return (
    <div className="border-b border-[#e8e4dc] py-4 last:border-b-0">
      <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-800">{label}</dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-[#2f3440] sm:text-[15px]">{children}</dd>
    </div>
  )
}

function ProjectCard({ project }) {
  const img = project?.imageUrl ? resolveMediaUrl(project.imageUrl) : ''
  const title = String(project?.title || '').trim()
  const description = String(project?.description || '').trim()
  const status = String(project?.status || '').trim()
  const linkUrl = String(project?.linkUrl || '').trim()
  const linkLabel = String(project?.linkLabel || '').trim() || 'Ver proyecto'
  if (!title && !description && !status && !img && !linkUrl) return null

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/8">
      {img ? (
        <img
          src={img}
          alt=""
          className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-linear-to-br from-slate-100 to-sky-50 text-xs font-bold uppercase tracking-wide text-slate-400">
          Proyecto
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        {status ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700">{status}</p>
        ) : null}
        {title ? (
          <h3 className={`text-lg font-bold tracking-tight text-[#171b22] ${status ? 'mt-1.5' : ''}`}>
            {title}
          </h3>
        ) : null}
        {description ? (
          <p className="mt-2 flex-1 whitespace-pre-line text-sm leading-relaxed text-[#4b505a]">
            {description}
          </p>
        ) : null}
        {linkUrl ? (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-fit items-center rounded-xl border border-[#d7d1c7] bg-white px-4 py-2.5 text-xs font-bold text-sky-800 transition hover:border-sky-200 hover:bg-sky-50"
          >
            {linkLabel}
            <span className="ml-1.5" aria-hidden>
              ↗
            </span>
          </a>
        ) : null}
      </div>
    </article>
  )
}

function findServiceInProfile(profile, serviceId) {
  const services = Array.isArray(profile?.serviceBlocks) ? profile.serviceBlocks : []
  return services.find((item) => String(item?.id || '') === String(serviceId)) || null
}

export function AreaServiceDetail() {
  const { slug, serviceId } = useParams()
  const [remoteArea, setRemoteArea] = useState(null)
  const [areaHydrated, setAreaHydrated] = useState(!isApiConfigured())
  const [remoteProfile, setRemoteProfile] = useState(null)
  const [profileHydrated, setProfileHydrated] = useState(!isApiConfigured())

  const baseProfile = useMemo(
    () => getAreaProfileBySlug(slug, remoteArea),
    [slug, remoteArea],
  )
  const profile = useMemo(
    () => (baseProfile ? mergeAreaProfile(baseProfile, remoteProfile || {}) : null),
    [baseProfile, remoteProfile],
  )
  const area = profile?.area || null
  const service = useMemo(
    () => (profile ? findServiceInProfile(profile, serviceId) : null),
    [profile, serviceId],
  )

  useEffect(() => {
    let cancelled = false
    if (!isApiConfigured()) return () => {}
    fetchAreaPublicBySlug(slug)
      .then((data) => {
        if (!cancelled) setRemoteArea(data || null)
      })
      .catch(() => {
        if (!cancelled) setRemoteArea(null)
      })
      .finally(() => {
        if (!cancelled) setAreaHydrated(true)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    let cancelled = false
    if (!baseProfile || !isApiConfigured()) return () => {}
    fetchAreaProfile(slug)
      .then((remote) => {
        if (!cancelled) setRemoteProfile(remote || null)
      })
      .catch(() => {
        if (!cancelled) setRemoteProfile(null)
      })
      .finally(() => {
        if (!cancelled) setProfileHydrated(true)
      })
    return () => {
      cancelled = true
    }
  }, [slug, baseProfile])

  const loading = isApiConfigured() && (!areaHydrated || !profileHydrated)
  const areaUrl = ROUTES.area(slug)
  const servicesUrl = `${areaUrl}#servicios-area`

  if (loading) {
    return <ServiceDetailSkeleton />
  }

  if (!area || !profile) {
    return (
      <section className="pb-12">
        <Container className="max-w-2xl!">
          <h1 className="text-2xl font-bold text-slate-900">Área no encontrada</h1>
          <p className="mt-4 text-slate-600">
            <Link to={ROUTES.areas} className="font-semibold text-sky-700 hover:text-sky-900">
              Volver al listado de áreas
            </Link>
          </p>
        </Container>
      </section>
    )
  }

  if (!service) {
    return (
      <section className="pb-12">
        <Container className="max-w-2xl!">
          <RevealOnScroll variant="newsCardSlow" disabled>
            <div className="rounded-3xl border border-red-200/90 bg-linear-to-br from-red-50/90 to-white px-6 py-10 text-center shadow-sm">
              <p className="text-sm font-medium text-sky-700">
                <Link to={areaUrl} className="transition-colors hover:text-sky-900">
                  ← {area.title}
                </Link>
              </p>
              <h1 className="mt-4 text-2xl font-bold text-red-950">Servicio no encontrado</h1>
              <p className="mt-2 text-red-800/90">
                El servicio solicitado no existe o fue dado de baja.
              </p>
              <Link
                to={servicesUrl}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-700 px-5 text-sm font-semibold text-white transition hover:bg-sky-800"
              >
                Ver servicios del área
              </Link>
            </div>
          </RevealOnScroll>
        </Container>
      </section>
    )
  }

  const img = service.imageUrl ? resolveMediaUrl(service.imageUrl) : ''
  const title = String(service.title || '').trim() || 'Servicio'
  const mode = String(service.mode || '').trim()
  const description = String(service.description || '').trim()
  const personInCharge = String(service.personInCharge || '').trim()
  const generalObjective = String(service.generalObjective || '').trim()
  const projects = Array.isArray(service.projects)
    ? service.projects.filter((project) =>
        Boolean(
          project?.title ||
            project?.description ||
            project?.status ||
            project?.imageUrl ||
            project?.linkUrl,
        ),
      )
    : []
  const hasMeta = Boolean(personInCharge || generalObjective)
  const showContacts = isServiceContactSectionVisible(service.contactSection)
  const showAuthorities = isServiceAuthoritySectionVisible(service.authoritySection)
  const showGallery = isServiceGallerySectionVisible(service.gallerySection)
  const showSidebar = hasMeta || showContacts

  return (
    <section className="relative pb-14 sm:pb-20">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-linear-to-b from-sky-50/30 via-transparent to-transparent"
        aria-hidden
      />

      <Container className="max-w-[min(100%,96rem)]!">
        <RevealOnScroll variant="newsCard" delayMs={0}>
          <nav
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm font-medium text-sky-700"
            aria-label="Migas de pan"
          >
            <Link to={ROUTES.areas} className="transition-colors hover:text-sky-900">
              Áreas
            </Link>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <Link to={areaUrl} className="transition-colors hover:text-sky-900">
              {area.title}
            </Link>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <Link to={servicesUrl} className="transition-colors hover:text-sky-900">
              Servicios
            </Link>
          </nav>
        </RevealOnScroll>

        <RevealOnScroll variant="newsCardSlow" delayMs={40}>
          <article className="mt-5 overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
            <header className="relative overflow-hidden">
              {img ? (
                <img
                  src={img}
                  alt=""
                  className="h-64 w-full object-cover sm:h-80 lg:h-[28rem]"
                />
              ) : (
                <div
                  className="h-64 w-full bg-linear-to-br from-slate-200/90 via-sky-100/80 to-slate-100 sm:h-80 lg:h-[28rem]"
                  aria-hidden
                />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/50 to-slate-900/10" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
                {mode ? (
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
                    {mode}
                  </p>
                ) : (
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
                    Servicio del área
                  </p>
                )}
                <h1 className="mt-2 max-w-4xl font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {title}
                </h1>
                <p className="mt-3 text-sm font-medium text-slate-200 sm:text-base">{area.title}</p>
              </div>
            </header>

            <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-12 lg:gap-10 lg:p-10">
              <div className="space-y-8 lg:col-span-8">
                <RevealOnScroll variant="slow">
                  <section>
                    <h2 className="text-xl font-bold tracking-tight text-[#171b22] sm:text-2xl">
                      Sobre este servicio
                    </h2>
                    {description ? (
                      <p className="mt-4 whitespace-pre-wrap text-base leading-[1.75] text-[#3d424c] sm:text-lg sm:leading-[1.72]">
                        {description}
                      </p>
                    ) : (
                      <p className="mt-4 text-base italic text-slate-400">
                        Pronto sumaremos más información sobre este servicio.
                      </p>
                    )}
                  </section>
                </RevealOnScroll>

                {showAuthorities ? (
                  <RevealOnScroll variant="newsCardSlow" delayMs={60}>
                    <ServiceAuthoritySection authoritySection={service.authoritySection} />
                  </RevealOnScroll>
                ) : null}

                {projects.length > 0 ? (
                  <RevealOnScroll variant="newsCardSlow" delayMs={90}>
                    <section>
                      <div className="flex flex-col gap-2 border-b border-[#e8e4dc] pb-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-800">
                            Proyectos
                          </p>
                          <h2 className="mt-1 text-xl font-bold tracking-tight text-[#171b22] sm:text-2xl">
                            Iniciativas vinculadas
                          </h2>
                        </div>
                        <p className="text-xs font-semibold text-slate-500">
                          {projects.length} proyecto{projects.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                        {projects.map((project, idx) => (
                          <li key={project.id || `project-${idx}`}>
                            <ProjectCard project={project} />
                          </li>
                        ))}
                      </ul>
                    </section>
                  </RevealOnScroll>
                ) : null}

                {showGallery ? (
                  <RevealOnScroll variant="newsCardSlow" delayMs={120}>
                    <ServiceGallerySection gallerySection={service.gallerySection} />
                  </RevealOnScroll>
                ) : null}
              </div>

              {showSidebar ? (
                <aside className="lg:col-span-4">
                  <RevealOnScroll variant="slow" delayMs={110}>
                    <div className="sticky top-[calc(var(--navbar-h,5rem)+1rem)] space-y-5">
                      {hasMeta ? (
                        <article className="rounded-2xl border border-[#ddd7ca] bg-[#f8f7f3] px-5 py-2">
                          <h3 className="border-b border-[#e8e4dc] py-4 text-sm font-bold uppercase tracking-[0.16em] text-sky-800">
                            Información clave
                          </h3>
                          <dl>
                            <InfoRow label="A cargo">
                              {personInCharge ? (
                                <span className="font-semibold text-[#171b22]">{personInCharge}</span>
                              ) : null}
                            </InfoRow>
                            <InfoRow label="Objetivo general">{generalObjective}</InfoRow>
                          </dl>
                        </article>
                      ) : null}
                      {showContacts ? (
                        <article className="rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5">
                          <ServiceContactSection contactSection={service.contactSection} />
                        </article>
                      ) : null}
                    </div>
                  </RevealOnScroll>
                </aside>
              ) : null}
            </div>
          </article>
        </RevealOnScroll>

        <RevealOnScroll variant="newsCardSlow" delayMs={60}>
          <div className="mt-10 flex flex-wrap justify-center gap-3 border-t border-[#ddd7ca]/70 pt-10">
            <Link
              to={servicesUrl}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#2a313b] bg-[#171b22] px-8 text-sm font-semibold text-white shadow-[0_12px_32px_-16px_rgba(0,0,0,0.45)] transition hover:bg-[#222831] hover:shadow-lg"
            >
              <span aria-hidden className="text-base leading-none">
                ←
              </span>
              Servicios del área
            </Link>
            <Link
              to={areaUrl}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#ddd7ca] bg-white px-8 text-sm font-semibold text-[#171b22] transition hover:border-sky-200 hover:bg-sky-50/50"
            >
              Ver {area.title}
            </Link>
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  )
}

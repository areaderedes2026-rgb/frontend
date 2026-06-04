import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Container } from '../../components/ui/Container.jsx'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { AreaOfficeIcon } from '../../components/areas/areaOfficeIcons.jsx'
import { getAreaProfileBySlug, mergeAreaProfile } from '../../data/areaProfiles.js'
import { fetchAreaProfile } from '../../services/areaProfilesService.js'
import { fetchAreaOfficesPublic } from '../../services/areaOfficesService.js'
import { fetchAreaPublicBySlug } from '../../services/areasService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import {
  HydrationAreaCoverBand,
  HydrationDirectorCopyBlock,
  HydrationDirectorPhoto,
  HydrationHeroLightTextBlock,
} from '../../components/skeleton/PageHydrationSkeleton.jsx'
import { AreaSchoolsSection } from '../../components/areas/AreaSchoolsSection.jsx'
import { AreaProceduresSection } from '../../components/areas/AreaProceduresSection.jsx'
import { isProceduresSectionVisible } from '../../utils/areaProcedures.js'
import { AreaAnnouncements } from '../../components/areas/AreaAnnouncements.jsx'
import {
  isAnnouncementsSectionVisible,
  normalizeAnnouncementsSection,
} from '../../utils/areaAnnouncements.js'
import { AreaServicesSection } from '../../components/areas/AreaServicesSection.jsx'
import { getAreaDetailNavLinks } from '../../utils/areaDetailNav.js'
import { ROUTES } from '../../utils/constants.js'

export function AreaDetail() {
  const { slug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [remoteAreaState, setRemoteAreaState] = useState({
    slug: '',
    data: null,
    hydrated: false,
  })
  const [remoteProfileState, setRemoteProfileState] = useState({
    slug: '',
    data: null,
    hydrated: false,
  })
  const [officesState, setOfficesState] = useState({
    slug: '',
    items: [],
    hydrated: false,
    error: '',
  })
  const remoteArea = remoteAreaState.slug === slug ? remoteAreaState.data : null
  const areaHydrated =
    !isApiConfigured() || (remoteAreaState.slug === slug && remoteAreaState.hydrated)
  const remoteProfile =
    remoteProfileState.slug === slug ? remoteProfileState.data : null
  const profileHydrated =
    !isApiConfigured() ||
    (remoteProfileState.slug === slug && remoteProfileState.hydrated)
  const baseProfile = useMemo(
    () => getAreaProfileBySlug(slug, remoteArea),
    [slug, remoteArea],
  )
  const profile = useMemo(
    () => (baseProfile ? mergeAreaProfile(baseProfile, remoteProfile || {}) : null),
    [baseProfile, remoteProfile],
  )
  const area = profile?.area || null
  const showHeaderSkeleton = isApiConfigured() && !areaHydrated
  const showDirectorSkeleton = isApiConfigured() && !profileHydrated
  const directorPhotoUrl =
    !isApiConfigured() || profileHydrated ? profile?.director?.photoUrl || '' : ''
  const offices = !isApiConfigured()
    ? []
    : officesState.slug === slug && officesState.hydrated
      ? officesState.items
      : []
  const showOffices = offices.length > 0
  const officesHydratedForSlug =
    isApiConfigured() && officesState.slug === slug && officesState.hydrated
  const officesLoading = isApiConfigured() && !officesHydratedForSlug
  const showOfficesSection =
    officesLoading || showOffices || (officesHydratedForSlug && Boolean(officesState.error))
  const showServices = (profile?.serviceBlocks || []).length > 0
  const announcementsSection = profile?.announcementsSection
  const showAnnouncements = isAnnouncementsSectionVisible(announcementsSection)
  const announcementsDisplayMode = showAnnouncements
    ? normalizeAnnouncementsSection(announcementsSection).displayMode
    : null
  const navLinks = useMemo(() => getAreaDetailNavLinks(profile, { showOffices }), [profile, showOffices])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const legacyServiceId = params.get('serviceId')
    if (!legacyServiceId) return
    navigate(ROUTES.areaServiceDetail(slug, legacyServiceId), { replace: true })
  }, [location.search, navigate, slug])

  useEffect(() => {
    if (location.hash !== '#oficinas-area') return
    if (location.pathname !== `/areas/${slug}`) return
    if (!showOfficesSection) return

    const prefersReduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function scrollToOffices() {
      const el = document.getElementById('oficinas-area')
      if (!el) return
      el.scrollIntoView({
        behavior: prefersReduce ? 'auto' : 'smooth',
        block: 'start',
      })
    }

    const t1 = window.setTimeout(scrollToOffices, 40)
    const t2 = window.setTimeout(scrollToOffices, 280)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [
    location.hash,
    location.pathname,
    slug,
    showOfficesSection,
    officesLoading,
    showOffices,
  ])

  useEffect(() => {
    let cancelled = false
    if (!isApiConfigured()) return () => {}
    fetchAreaPublicBySlug(slug)
      .then((data) => {
        if (cancelled) return
        setRemoteAreaState({
          slug,
          data: data || null,
          hydrated: true,
        })
      })
      .catch(() => {
        if (cancelled) return
        setRemoteAreaState({
          slug,
          data: null,
          hydrated: true,
        })
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    let cancelled = false
    if (!isApiConfigured()) return () => {}
    const resetTimer = window.setTimeout(() => {
      if (cancelled) return
      setOfficesState({
        slug,
        items: [],
        hydrated: false,
        error: '',
      })
    }, 0)
    fetchAreaOfficesPublic(slug)
      .then((items) => {
        if (!cancelled) {
          setOfficesState({
            slug,
            items: Array.isArray(items) ? items : [],
            hydrated: true,
            error: '',
          })
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setOfficesState({
            slug,
            items: [],
            hydrated: true,
            error: e.message || '',
          })
        }
      })
    return () => {
      cancelled = true
      window.clearTimeout(resetTimer)
    }
  }, [slug])

  useEffect(() => {
    let cancelled = false
    if (!baseProfile || !isApiConfigured()) return () => {}
    fetchAreaProfile(slug)
      .then((remote) => {
        if (cancelled) return
        setRemoteProfileState({
          slug,
          data: remote || null,
          hydrated: true,
        })
      })
      .catch(() => {
        if (cancelled) return
        setRemoteProfileState({
          slug,
          data: null,
          hydrated: true,
        })
      })
    return () => {
      cancelled = true
    }
  }, [slug, baseProfile, remoteArea])

  if (!area) {
    return (
      <section>
        <Container className="max-w-2xl!">
          <h1 className="text-2xl font-bold text-slate-900">Área no encontrada</h1>
          <p className="mt-4 text-slate-600">
            <Link
              to="/areas"
              className="font-semibold text-sky-700 hover:text-sky-900"
            >
              Volver al listado de áreas
            </Link>
          </p>
        </Container>
      </section>
    )
  }

  return (
    <section className="relative pb-10 sm:pb-14">
      <Container className="max-w-[min(100%,96rem)]!">
        <p className="text-sm font-medium text-sky-700">
          <Link
            to="/areas"
            className="transition-colors hover:text-sky-900"
          >
            ← Todas las áreas
          </Link>
        </p>

        <article className="mt-5 rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
          <header className="relative overflow-hidden rounded-t-3xl">
            {showHeaderSkeleton ? (
              <HydrationAreaCoverBand />
            ) : (
              <img
                src={area.coverImage}
                alt=""
                className="h-56 w-full object-cover sm:h-64 lg:h-72"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/45 to-slate-900/10" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
              {showHeaderSkeleton ? (
                <HydrationHeroLightTextBlock />
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
                    {profile.heroTag}
                  </p>
                  <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    {area.title}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-100 sm:text-base">
                    {profile.mission}
                  </p>
                </>
              )}
            </div>
          </header>

          <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-12 lg:gap-10 lg:p-10">
            <aside className="lg:col-span-4 lg:sticky lg:top-[calc(var(--navbar-h)+1rem)] lg:self-start">
              <RevealOnScroll variant="slow">
                <div className="rounded-2xl border border-[#ddd7ca] bg-[#f8f7f3] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                  Navegación de contenido
                </p>
                <ul className="mt-4 space-y-2">
                  {navLinks.map(([href, label]) => (
                    <li key={href}>
                      <a
                        href={href}
                        className="flex items-center justify-between rounded-xl border border-[#ddd7ca] bg-white px-3 py-2 text-sm font-semibold text-[#171b22] transition hover:border-sky-200 hover:text-[#0f1319]"
                      >
                        <span>{label}</span>
                        <span aria-hidden>↘</span>
                      </a>
                    </li>
                  ))}
                </ul>
                </div>
              </RevealOnScroll>
            </aside>

            <div className="space-y-10 lg:col-span-8">
              {showAnnouncements && announcementsDisplayMode === 'inline' ? (
                <RevealOnScroll variant="slow">
                  <AreaAnnouncements
                    announcementsSection={announcementsSection}
                    areaSlug={slug}
                    displayModeOverride="inline"
                  />
                </RevealOnScroll>
              ) : null}

              <RevealOnScroll variant="newsCardSlow" delayMs={90}>
                <section id="director-area" className="rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Dirección del área
                </h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-[12rem_1fr]">
                  {directorPhotoUrl ? (
                    <img
                      src={directorPhotoUrl}
                      alt={profile.director.name}
                      className="aspect-4/5 w-full max-w-72 self-start rounded-2xl object-cover object-top ring-1 ring-slate-200/80 sm:aspect-auto sm:h-full sm:max-w-none sm:object-center"
                    />
                  ) : (
                    <HydrationDirectorPhoto />
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                      Responsable
                    </p>
                    {showDirectorSkeleton ? (
                      <HydrationDirectorCopyBlock />
                    ) : (
                      <>
                        <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                          {profile.director.name}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-[#4b505a]">
                          {profile.director.role}
                        </p>
                        <p className="mt-4 text-sm leading-relaxed text-[#4b505a] sm:text-base">
                          {profile.director.bio}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {String(area.description || '').trim() ? (
                  <div id="area-catalogo" className="mt-8 border-t border-[#e5e2da] pt-8">
                    <p className="max-w-3xl text-sm leading-relaxed text-[#4b505a] sm:text-base">
                      {String(area.description).trim()}
                    </p>
                  </div>
                ) : null}
                </section>
              </RevealOnScroll>

              {showOfficesSection ? (
                <RevealOnScroll variant="slow">
                  <section id="oficinas-area" className="scroll-mt-32">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                      Oficinas
                    </h2>
                    {officesLoading ? (
                      <>
                        <p className="mt-2 max-w-2xl text-sm text-[#4b505a]">
                          Cargando unidades publicadas…
                        </p>
                        <ul className="mt-5 flex flex-wrap gap-2 sm:gap-3" aria-hidden>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <li key={i}>
                              <div className="h-10 w-36 animate-pulse rounded-2xl bg-slate-100 sm:h-11 sm:w-40" />
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : officesState.error ? (
                      <p className="mt-3 text-sm text-amber-800" role="alert">
                        {officesState.error}
                      </p>
                    ) : (
                      <>
                        <p className="mt-2 max-w-2xl text-sm text-[#4b505a]">
                          Unidades internas del área. Elegí una para ver descripción y actividades.
                        </p>
                        <ul className="mt-5 flex flex-wrap gap-2 sm:gap-3">
                          {offices.map((o) => (
                            <li key={o.slug}>
                              <Link
                                to={`/areas/${encodeURIComponent(slug)}/oficinas/${encodeURIComponent(o.slug)}`}
                                className="group flex min-h-10 max-w-56 items-center gap-2.5 rounded-2xl border border-[#ddd7ca] bg-white px-3 py-2 text-left text-sm font-semibold text-[#171b22] shadow-sm transition hover:border-sky-200 hover:bg-sky-50/50 hover:text-sky-900 sm:max-w-64"
                              >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-800 transition group-hover:border-sky-200">
                                  <AreaOfficeIcon iconKey={o.iconKey} className="h-4 w-4" title="" />
                                </span>
                                <span className="min-w-0 truncate">{o.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </section>
                </RevealOnScroll>
              ) : null}

              {showServices ? (
                <RevealOnScroll variant="slow">
                  <AreaServicesSection
                    services={profile.serviceBlocks}
                    areaSlug={slug}
                  />
                </RevealOnScroll>
              ) : null}

              {profile.schoolsSection?.items?.length ? (
                <AreaSchoolsSection schoolsSection={profile.schoolsSection} />
              ) : null}

              {isProceduresSectionVisible(profile.proceduresSection) ? (
                <AreaProceduresSection proceduresSection={profile.proceduresSection} />
              ) : null}

              <RevealOnScroll variant="newsCardSlow" delayMs={120}>
                <section id="ubicacion-area" className="rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Ubicación y canales de contacto
                </h2>
                <p className="mt-2 text-sm text-[#4b505a] sm:text-base">
                  {profile.location.address}
                </p>
                <p className="mt-1 text-sm text-slate-500">{profile.location.references}</p>

                <div className="mt-6 overflow-hidden rounded-2xl border border-[#ddd7ca]">
                  <iframe
                    title={`Mapa de ${area.title}`}
                    src={profile.location.mapEmbedUrl}
                    className="h-72 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {profile.contactCards.map((card) => (
                    <article
                      key={card.label}
                      className="rounded-xl border border-[#ddd7ca] bg-[#f8f7f3] p-3"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">
                        {card.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{card.value}</p>
                      <p className="mt-1 text-xs text-slate-500">{card.note}</p>
                    </article>
                  ))}
                </div>

                <a
                  href={profile.location.mapExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-[#2a313b] bg-[#171b22] px-4 text-sm font-semibold text-white transition hover:bg-[#222831]"
                >
                  Abrir mapa en pestaña nueva
                </a>
                </section>
              </RevealOnScroll>
            </div>
          </div>
        </article>

        {showAnnouncements && announcementsDisplayMode === 'floating' ? (
          <AreaAnnouncements
            announcementsSection={announcementsSection}
            areaSlug={slug}
            displayModeOverride="floating"
          />
        ) : null}

        <div className="mt-6 rounded-2xl border border-sky-100 bg-linear-to-r from-sky-50 via-white to-sky-50/70 p-5 text-sm leading-relaxed text-slate-600 sm:p-6 sm:text-base">
          Todas las áreas comparten la misma base de navegación y secciones principales.
          Algunas pueden mostrar bloques extra (por ejemplo, escuelas en Cultura). Hasta que no
          exista un perfil guardado en el servidor, puede verse contenido de referencia; una vez
          guardado el perfil, lo publicado es el que definís en administración.
        </div>
      </Container>
    </section>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Container } from '../../components/ui/Container.jsx'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { getAreaBySlug } from '../../data/areas.js'
import { getAreaProfileBySlug, mergeAreaProfile } from '../../data/areaProfiles.js'
import { fetchAreaProfile } from '../../services/areaProfilesService.js'
import { fetchAreaPublicBySlug } from '../../services/areasService.js'
import { fetchAreaOfficePublic } from '../../services/areaOfficesService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { AreaOfficeIcon } from '../../components/areas/areaOfficeIcons.jsx'

function OfficeDetailSkeleton() {
  return (
    <section className="relative pb-14 sm:pb-20">
      <Container className="max-w-[min(100%,96rem)]!">
        <div className="h-4 w-52 animate-pulse rounded bg-slate-200/80" />
        <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#171b22] shadow-[0_12px_40px_-20px_rgba(0,0,0,0.45)]">
          <div className="relative px-5 py-6 text-center sm:px-7 sm:py-7">
            <div className="mx-auto h-12 w-12 animate-pulse rounded-xl bg-white/10" />
            <div className="mx-auto mt-4 h-2.5 w-20 animate-pulse rounded bg-white/15" />
            <div className="mx-auto mt-3 h-7 w-2/3 max-w-sm animate-pulse rounded-lg bg-white/12" />
            <div className="mx-auto mt-2.5 h-3.5 w-36 animate-pulse rounded bg-white/10" />
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-2xl space-y-3 px-4 text-center">
          <div className="mx-auto h-4 w-full animate-pulse rounded bg-slate-200/70" />
          <div className="mx-auto h-4 w-full animate-pulse rounded bg-slate-200/70" />
          <div className="mx-auto h-4 w-5/6 animate-pulse rounded bg-slate-200/60" />
        </div>
        <div className="mx-auto mt-14 grid max-w-none gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-[#ddd7ca]/80 bg-[#f8f7f3]/90"
            />
          ))}
        </div>
      </Container>
    </section>
  )
}

export function AreaOfficeDetail() {
  const { slug, officeSlug } = useParams()
  const [remoteArea, setRemoteArea] = useState(null)
  const [areaHydrated, setAreaHydrated] = useState(!isApiConfigured())
  const [remoteProfile, setRemoteProfile] = useState(null)
  const [profileHydrated, setProfileHydrated] = useState(!isApiConfigured())
  const [office, setOffice] = useState(null)
  const [officeLoading, setOfficeLoading] = useState(() => isApiConfigured())
  const [officeError, setOfficeError] = useState('')

  const baseArea = useMemo(() => getAreaBySlug(slug), [slug])
  const areaFromRemote = remoteArea && remoteArea.slug === slug ? remoteArea : null
  const area =
    areaFromRemote ||
    (baseArea
      ? {
          slug: baseArea.slug,
          title: baseArea.title,
          description: baseArea.description,
          coverImage: baseArea.coverImage,
        }
      : null)

  const baseProfile = useMemo(
    () => (baseArea ? getAreaProfileBySlug(slug, areaFromRemote || baseArea) : null),
    [slug, baseArea, areaFromRemote],
  )
  const profile = useMemo(
    () =>
      baseProfile ? mergeAreaProfile(baseProfile, remoteProfile || {}) : null,
    [baseProfile, remoteProfile],
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

  useEffect(() => {
    let cancelled = false
    if (!isApiConfigured()) return () => {}
    queueMicrotask(() => {
      if (cancelled) return
      setOfficeError('')
      setOfficeLoading(true)
    })
    fetchAreaOfficePublic(slug, officeSlug)
      .then((data) => {
        if (!cancelled) setOffice(data)
      })
      .catch((e) => {
        if (!cancelled) {
          setOffice(null)
          setOfficeError(e.message || 'No se pudo cargar la oficina.')
        }
      })
      .finally(() => {
        if (!cancelled) setOfficeLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug, officeSlug])

  if (!baseArea && !areaHydrated) {
    return <OfficeDetailSkeleton />
  }

  if (!area) {
    return (
      <section>
        <Container className="max-w-2xl!">
          <h1 className="text-2xl font-bold text-slate-900">Área no encontrada</h1>
          <p className="mt-4 text-slate-600">
            <Link to="/areas" className="font-semibold text-sky-700 hover:text-sky-900">
              Volver al listado de áreas
            </Link>
          </p>
        </Container>
      </section>
    )
  }

  if (!isApiConfigured()) {
    return (
      <section className="pb-12">
        <Container className="max-w-2xl!">
          <p className="text-sm font-medium text-sky-700">
            <Link
              to={`/areas/${encodeURIComponent(slug)}`}
              className="transition-colors hover:text-sky-900"
            >
              ← {area.title}
            </Link>
          </p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Contenido no disponible</h1>
          <p className="mt-2 text-slate-600">
            Para cargar el detalle de oficinas desde el servidor, configurá la variable{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm">VITE_API_URL</code>{' '}
            en el frontend.
          </p>
        </Container>
      </section>
    )
  }

  if (officeLoading) {
    return <OfficeDetailSkeleton />
  }

  if (officeError || !office) {
    return (
      <section className="pb-12">
        <Container className="max-w-2xl!">
          <RevealOnScroll variant="newsCardSlow" disabled>
            <div className="rounded-3xl border border-red-200/90 bg-linear-to-br from-red-50/90 to-white px-6 py-10 text-center shadow-sm">
              <p className="text-sm font-medium text-sky-700">
                <Link
                  to={`/areas/${encodeURIComponent(slug)}`}
                  className="transition-colors hover:text-sky-900"
                >
                  ← {area.title}
                </Link>
              </p>
              <h1 className="mt-4 text-2xl font-bold text-red-950">Oficina no encontrada</h1>
              <p className="mt-2 text-red-800/90">
                {officeError || 'La oficina solicitada no existe o fue dada de baja.'}
              </p>
              <Link
                to={`/areas/${encodeURIComponent(slug)}#oficinas-area`}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-700 px-5 text-sm font-semibold text-white transition hover:bg-sky-800"
              >
                Ver oficinas del área
              </Link>
            </div>
          </RevealOnScroll>
        </Container>
      </section>
    )
  }

  const heroTag = profileHydrated ? profile?.heroTag || 'Área municipal' : 'Área municipal'
  const activities = Array.isArray(office.activities) ? office.activities.filter(Boolean) : []

  return (
    <section className="relative pb-14 sm:pb-20">
      {/* Fondo suave fijo al viewport para profundidad (no interfiere con el scroll) */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-linear-to-b from-sky-50/35 via-transparent to-transparent"
        aria-hidden
      />

      <Container className="max-w-[min(100%,96rem)]!">
        <RevealOnScroll variant="newsCard" delayMs={0}>
          <nav
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm font-medium text-sky-700"
            aria-label="Migas de pan"
          >
            <Link to="/areas" className="transition-colors hover:text-sky-900">
              Áreas
            </Link>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <Link
              to={`/areas/${encodeURIComponent(slug)}`}
              className="transition-colors hover:text-sky-900"
            >
              {area.title}
            </Link>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <Link
              to={`/areas/${encodeURIComponent(slug)}#oficinas-area`}
              className="transition-colors hover:text-sky-900"
            >
              Oficinas
            </Link>
          </nav>
        </RevealOnScroll>

        <RevealOnScroll variant="newsCardSlow" delayMs={40}>
          <header className="relative mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#171b22] text-center shadow-[0_14px_44px_-22px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-md">
            <div
              className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/[0.07] via-transparent to-black/25"
              aria-hidden
            />
            <div className="relative px-5 py-6 sm:px-7 sm:py-7">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/12 bg-white/8 text-sky-300 shadow-[0_6px_20px_-8px_rgba(0,0,0,0.4)] sm:h-14 sm:w-14">
                <AreaOfficeIcon
                  iconKey={office.iconKey}
                  className="h-6 w-6 text-sky-300 sm:h-7 sm:w-7"
                  title=""
                />
              </div>
              <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-sky-200/95 sm:text-[0.7rem]">
                {heroTag}
              </p>
              <h1 className="mx-auto mt-2 max-w-[22ch] font-serif text-2xl font-bold leading-snug tracking-tight text-white sm:max-w-none sm:text-3xl sm:leading-tight">
                {office.name}
              </h1>
              <p className="mt-2 text-sm font-medium text-white/65">{area.title}</p>
            </div>
          </header>
        </RevealOnScroll>

        <RevealOnScroll variant="slow" delayMs={90}>
          <div className="relative mx-auto mt-12 max-w-4xl px-1 sm:mt-14 sm:px-4 lg:max-w-5xl">
            <span
              className="pointer-events-none absolute -left-1 top-0 font-serif text-5xl leading-none text-sky-200/50 sm:-left-2 sm:text-6xl"
              aria-hidden
            >
              “
            </span>
            <div className="relative text-center">
              {office.description?.trim() ? (
                <p className="whitespace-pre-wrap text-[1.0625rem] leading-[1.75] text-[#3a3f48] sm:text-lg sm:leading-[1.72]">
                  {office.description.trim()}
                </p>
              ) : (
                <p className="text-base italic text-slate-400">
                  Pronto sumaremos más información sobre esta oficina.
                </p>
              )}
            </div>
            <span
              className="pointer-events-none absolute -right-1 bottom-0 font-serif text-5xl leading-none text-sky-200/50 sm:-right-2 sm:text-6xl"
              aria-hidden
            >
              ”
            </span>
          </div>
        </RevealOnScroll>

        {activities.length > 0 ? (
          <div className="mx-auto mt-14 max-w-none sm:mt-16">
            <RevealOnScroll variant="newsCard" delayMs={30}>
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="h-px w-12 bg-linear-to-r from-transparent via-sky-300 to-transparent" />
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-sky-700/85">
                  Qué hacemos
                </p>
              </div>
            </RevealOnScroll>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
              {activities.map((line, idx) => (
                <li key={`${idx}-${line.slice(0, 32)}`}>
                  <RevealOnScroll variant="newsCard" delayMs={100 + idx * 75}>
                    <article className="group relative flex h-full min-h-22 flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-4 shadow-sm transition duration-300 ease-out before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-sky-300/0 before:to-transparent before:transition-colors hover:-translate-y-0.5 hover:border-sky-200/90 hover:shadow-md hover:shadow-sky-500/10 hover:before:via-sky-400/35">
                      <span className="absolute right-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-sky-600/95 px-1.5 text-[0.65rem] font-bold text-white tabular-nums ring-2 ring-white">
                        {idx + 1}
                      </span>
                      <p className="pr-8 text-left text-sm font-medium leading-snug text-[#2f343c] sm:text-[0.9375rem] sm:leading-relaxed">
                        {line}
                      </p>
                    </article>
                  </RevealOnScroll>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <RevealOnScroll variant="slow" delayMs={120}>
            <p className="mx-auto mt-14 max-w-md text-center text-sm text-slate-500">
              Las actividades de esta oficina se publicarán aquí cuando estén disponibles.
            </p>
          </RevealOnScroll>
        )}

        <RevealOnScroll variant="newsCardSlow" delayMs={60}>
          <div className="mt-14 flex justify-center border-t border-[#ddd7ca]/70 pt-10">
            <Link
              to={`/areas/${encodeURIComponent(slug)}#oficinas-area`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#2a313b] bg-[#171b22] px-8 text-sm font-semibold text-white shadow-[0_12px_32px_-16px_rgba(0,0,0,0.45)] transition hover:bg-[#222831] hover:shadow-lg"
            >
              <span aria-hidden className="text-base leading-none">
                ←
              </span>
              Oficinas del área
            </Link>
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  )
}

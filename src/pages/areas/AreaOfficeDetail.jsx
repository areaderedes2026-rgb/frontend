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
    return (
      <section className="pb-12">
        <Container className="max-w-3xl!">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-100" />
          <div className="mt-6 h-48 animate-pulse rounded-3xl bg-slate-100" />
        </Container>
      </section>
    )
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
    return (
      <section className="pb-12">
        <Container className="max-w-3xl!">
          <div className="h-4 w-56 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 h-10 w-2/3 animate-pulse rounded-lg bg-slate-100" />
          <div className="mt-8 h-40 animate-pulse rounded-2xl bg-slate-100" />
        </Container>
      </section>
    )
  }

  if (officeError || !office) {
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
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Oficina no encontrada</h1>
          <p className="mt-2 text-slate-600">
            {officeError || 'La oficina solicitada no existe o fue dada de baja.'}
          </p>
          <Link
            to={`/areas/${encodeURIComponent(slug)}#oficinas-area`}
            className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white hover:bg-sky-800"
          >
            Ver oficinas del área
          </Link>
        </Container>
      </section>
    )
  }

  const heroTag = profileHydrated ? profile?.heroTag || 'Área municipal' : 'Área municipal'

  return (
    <section className="relative pb-12 sm:pb-16">
      <Container className="max-w-3xl!">
        <nav className="text-sm font-medium text-sky-700">
          <Link to="/areas" className="transition-colors hover:text-sky-900">
            Áreas
          </Link>
          <span className="mx-2 text-slate-400" aria-hidden>
            /
          </span>
          <Link
            to={`/areas/${encodeURIComponent(slug)}`}
            className="transition-colors hover:text-sky-900"
          >
            {area.title}
          </Link>
          <span className="mx-2 text-slate-400" aria-hidden>
            /
          </span>
          <Link
            to={`/areas/${encodeURIComponent(slug)}#oficinas-area`}
            className="transition-colors hover:text-sky-900"
          >
            Oficinas
          </Link>
        </nav>

        <RevealOnScroll variant="slow">
          <header className="mt-6 rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">{heroTag}</p>
            <div className="mt-4 flex flex-wrap items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-800 ring-1 ring-sky-100/80">
                <AreaOfficeIcon iconKey={office.iconKey} className="h-7 w-7" title="" />
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {office.name}
                </h1>
                <p className="mt-2 text-sm text-slate-500">Oficina · {area.title}</p>
              </div>
            </div>
          </header>
        </RevealOnScroll>

        <RevealOnScroll variant="newsCardSlow" delayMs={80}>
          <article className="mt-6 rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Descripción</h2>
            <div className="prose prose-slate mt-4 max-w-none text-sm leading-relaxed text-[#4b505a] sm:text-base">
              {office.description ? (
                <p className="whitespace-pre-wrap">{office.description}</p>
              ) : (
                <p className="text-slate-400 italic">Sin descripción cargada.</p>
              )}
            </div>
          </article>
        </RevealOnScroll>

        <RevealOnScroll variant="slow" delayMs={120}>
          <section className="mt-6 rounded-3xl border border-[#ddd7ca] bg-linear-to-br from-[#f8f7f3] to-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Actividades</h2>
            {office.activities?.length ? (
              <ul className="mt-5 space-y-3">
                {office.activities.map((line, idx) => (
                  <li
                    key={`${idx}-${line.slice(0, 24)}`}
                    className="flex gap-3 rounded-2xl border border-[#ddd7ca] bg-white/90 px-4 py-3 text-sm leading-relaxed text-[#3e434d] shadow-sm sm:text-base"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="min-w-0 flex-1 pt-0.5">{line}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500 italic">
                Todavía no hay actividades publicadas para esta oficina.
              </p>
            )}
          </section>
        </RevealOnScroll>

        <div className="mt-8 text-center">
          <Link
            to={`/areas/${encodeURIComponent(slug)}#oficinas-area`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#2a313b] bg-[#171b22] px-5 text-sm font-semibold text-white transition hover:bg-[#222831]"
          >
            ← Volver a oficinas
          </Link>
        </div>
      </Container>
    </section>
  )
}

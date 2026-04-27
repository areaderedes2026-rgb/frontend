import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { Container } from '../../components/ui/Container.jsx'
import { fetchTourismPlacePublicBySlug } from '../../services/tourismPlacesService.js'
import { ROUTES } from '../../utils/constants.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'

export function TourismPlaceDetail() {
  const { slug = '' } = useParams()
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await fetchTourismPlacePublicBySlug(slug)
        if (!cancelled) {
          if (!data) setError('No encontramos el lugar turístico solicitado.')
          setPlace(data)
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'No se pudo cargar el lugar turístico.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <section className="pb-10 sm:pb-14">
        <Container>
          <div className="animate-pulse rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] p-8 shadow-sm">
            <div className="h-6 w-48 rounded bg-slate-100" />
            <div className="mt-4 h-4 w-full rounded bg-slate-100" />
            <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
          </div>
        </Container>
      </section>
    )
  }

  if (error || !place) {
    return (
      <section className="pb-10 sm:pb-14">
        <Container>
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center shadow-sm">
            <p className="text-base font-semibold text-red-900">{error || 'Lugar no encontrado.'}</p>
            <Link
              to={ROUTES.history}
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-800 transition hover:bg-red-100"
            >
              Volver a Historia
            </Link>
          </div>
        </Container>
      </section>
    )
  }

  const coverSrc = place.imageUrl ? resolveMediaUrl(place.imageUrl) : ''
  const gallery = Array.isArray(place.gallery) ? place.gallery.filter(Boolean) : []

  return (
    <section className="relative pb-10 sm:pb-14">
      <Container className="max-w-[min(100%,96rem)]!">
        <p className="text-sm font-medium text-sky-700">
          <Link
            to={ROUTES.history}
            className="transition-colors hover:text-sky-900"
          >
            ← Volver a Historia
          </Link>
        </p>
        <article className="mt-5 overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
          <header className="relative overflow-hidden">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt=""
                className="h-64 w-full object-cover sm:h-80 lg:h-96"
              />
            ) : (
              <div
                className="h-64 w-full bg-linear-to-br from-sky-200/90 via-sky-100 to-slate-200 sm:h-80 lg:h-96"
                aria-hidden
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/55 to-slate-900/15" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
                {place.category || 'Lugar turístico'}
              </p>
              <h1 className="mt-2 max-w-4xl font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {place.name}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-100 sm:text-base">
                {place.shortDescription}
              </p>
            </div>
          </header>

          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-12 lg:p-10">
            <section className="space-y-6 lg:col-span-8">
              <RevealOnScroll variant="slow">
                <article className="rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Sobre este lugar</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#4b505a] sm:text-base">
                  {place.fullDescription}
                </p>
                </article>
              </RevealOnScroll>

              {gallery.length > 0 ? (
                <RevealOnScroll variant="newsCardSlow" delayMs={90}>
                  <article className="rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">Galería</h2>
                  <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {gallery.map((url, i) => (
                      <li
                        key={`${url}-${i}`}
                        className="overflow-hidden rounded-xl border border-[#ddd7ca] bg-slate-50"
                      >
                        <img
                          src={resolveMediaUrl(url)}
                          alt=""
                          className="aspect-video w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </li>
                    ))}
                  </ul>
                  </article>
                </RevealOnScroll>
              ) : null}

              <RevealOnScroll variant="newsCardSlow" delayMs={130}>
                <article className="rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Como llegar</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#4b505a] sm:text-base">
                  {place.howToGet || 'Próximamente sumaremos indicaciones de acceso para este lugar.'}
                </p>
                {place.mapExternalUrl ? (
                  <a
                    href={place.mapExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-[#2a313b] bg-[#171b22] px-5 text-sm font-semibold text-white transition hover:bg-[#222831]"
                  >
                    Abrir mapa en nueva pestaña ↗
                  </a>
                ) : null}
                </article>
              </RevealOnScroll>
            </section>

            <aside className="space-y-5 lg:col-span-4">
              <RevealOnScroll variant="slow" delayMs={110}>
                <article className="rounded-2xl border border-[#ddd7ca] bg-[#f8f7f3] p-5">
                <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-sky-800">
                  Información útil
                </h3>
                <dl className="mt-3 space-y-3 text-sm text-[#3e434d]">
                  <div>
                    <dt className="font-semibold text-slate-900">Dirección</dt>
                    <dd>{place.address || 'A confirmar'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Horario</dt>
                    <dd>{place.visitingHours || 'Consultar disponibilidad'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Teléfono</dt>
                    <dd>{place.contactPhone || 'No informado'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Email</dt>
                    <dd>{place.contactEmail || 'No informado'}</dd>
                  </div>
                </dl>
                </article>
              </RevealOnScroll>

              <RevealOnScroll variant="newsCardSlow" delayMs={150}>
                <article className="overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa]">
                <h3 className="border-b border-[#ddd7ca] px-5 py-4 text-sm font-bold uppercase tracking-[0.16em] text-sky-800">
                  Mapa
                </h3>
                {place.mapEmbedUrl ? (
                  <iframe
                    src={place.mapEmbedUrl}
                    title={`Mapa de ${place.name}`}
                    className="h-64 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="p-5 text-sm text-slate-600">
                    Próximamente se incorporará el mapa embebido para este destino.
                  </div>
                )}
                </article>
              </RevealOnScroll>
            </aside>
          </div>
        </article>
      </Container>
    </section>
  )
}

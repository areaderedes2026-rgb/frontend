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

export function Intendencia() {
  const [content, setContent] = useState(DEFAULT_INTENDENCIA_CONTENT)

  useEffect(() => {
    let cancelled = false
    async function loadContent() {
      if (!isApiConfigured()) return
      try {
        const remote = await fetchIntendenciaContent()
        if (!remote || cancelled) return
        setContent(mergeIntendenciaContent(DEFAULT_INTENDENCIA_CONTENT, remote))
      } catch {
        // Si falla API, se mantiene el contenido por defecto.
      }
    }
    loadContent()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="relative pb-10 sm:pb-14">
      <Container className="max-w-[min(100%,96rem)]!">
        <p className="text-sm font-medium text-sky-700">
          <Link to={ROUTES.home} className="transition-colors hover:text-sky-900">
            ← Volver al inicio
          </Link>
        </p>

        <article className="mt-5 rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
          <header className="relative overflow-hidden rounded-t-3xl">
            <img
              src={content.heroImageUrl}
              alt=""
              className="h-56 w-full object-cover sm:h-64 lg:h-72"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/45 to-slate-900/10" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
                {content.heroEyebrow}
              </p>
              <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Intendencia
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-100 sm:text-base">
                {content.heroSubtitle}
              </p>
            </div>
          </header>

          <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-12 lg:gap-10 lg:p-10">
            <aside className="lg:col-span-4 lg:sticky lg:top-[calc(var(--navbar-h)+1rem)] lg:self-start">
              <RevealOnScroll variant="slow">
                <div className="rounded-2xl border border-[#ddd7ca] bg-[#f8f7f3] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                    Gobierno
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li>
                      <a
                        href="#intendencia"
                        className="flex items-center justify-between rounded-xl border border-[#ddd7ca] bg-white px-3 py-2 text-sm font-semibold text-[#171b22] transition hover:border-sky-200 hover:text-[#0f1319]"
                      >
                        <span>Intendente</span>
                        <span aria-hidden>↘</span>
                      </a>
                    </li>
                    <li>
                      <Link
                        to={ROUTES.areas}
                        className="flex items-center justify-between rounded-xl border border-[#ddd7ca] bg-white px-3 py-2 text-sm font-semibold text-[#171b22] transition hover:border-sky-200 hover:text-[#0f1319]"
                      >
                        <span>Ver todas las áreas</span>
                        <span aria-hidden>→</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </RevealOnScroll>
            </aside>

            <div className="space-y-10 lg:col-span-8">
              <RevealOnScroll variant="newsCardSlow" delayMs={90}>
                <section
                  id="intendencia"
                  className="rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-6"
                >
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    Despacho del Intendente
                  </h2>
                  <div className="mt-5 grid gap-5 sm:grid-cols-[12rem_1fr]">
                    <img
                      src={content.mayorPhotoUrl || content.heroImageUrl}
                      alt={content.mayorName}
                      className="h-56 w-full rounded-2xl object-cover ring-1 ring-slate-200/80 sm:h-full"
                    />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                        Intendente
                      </p>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                        {content.mayorName}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-[#4b505a]">
                        {content.mayorRole}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-[#4b505a] sm:text-base">
                        {content.mayorBio}
                      </p>
                      <div className="mt-5 grid gap-2 text-sm text-[#3e434d] sm:grid-cols-2">
                        <p className="rounded-xl border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2">
                          <span className="font-semibold">Correo:</span> {content.contactEmail}
                        </p>
                        <p className="rounded-xl border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2">
                          <span className="font-semibold">Teléfono:</span> {content.contactPhone}
                        </p>
                        <p className="rounded-xl border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2 sm:col-span-2">
                          <span className="font-semibold">Horario:</span> {content.officeHours}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </RevealOnScroll>
            </div>
          </div>
        </article>
      </Container>
    </section>
  )
}

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
    <section className="relative overflow-hidden bg-linear-to-b from-[#f7f9fc] via-[#fcfcfa] to-white pb-12 sm:pb-16">
      <Container className="max-w-[min(100%,96rem)]!">
        <p className="pt-1 text-sm font-medium text-sky-700">
          <Link to={ROUTES.home} className="transition-colors hover:text-sky-900">
            ← Volver al inicio
          </Link>
        </p>

        <RevealOnScroll variant="slow">
          <header className="mt-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
              {content.heroEyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {content.heroTitle}
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-relaxed text-slate-600 sm:text-base">
              {content.heroSubtitle}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
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
          </header>
        </RevealOnScroll>

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <RevealOnScroll variant="newsCardSlow" delayMs={80} className="lg:col-span-8">
            <section
              id="intendencia"
              className="h-full rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
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
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {content.mayorRole}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
                    {content.mayorBio}
                  </p>
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

import { useMemo } from 'react'
import { Container } from '../ui/Container.jsx'
import { RevealOnScroll } from './RevealOnScroll.jsx'
import {
  DEFAULT_HOME_EMERGENCY_CONTENT,
  HOME_EMERGENCY_DEFAULT_IMAGE,
  getActiveEmergencyNumbers,
  mergeHomeEmergencyContent,
} from '../../data/homeEmergencyContent.js'
import { heroOverlayGradientStyle } from '../../utils/heroOverlay.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import {
  SectionTopWave,
  getSectionImageWaveMaskStyle,
  usesImageWaveEdge,
} from './SectionTopWave.jsx'

function PhoneIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  )
}

function telHref(phone) {
  const digits = String(phone || '').replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : null
}

function EmergencyBackdrop({ imageUrl, overlayOpacity, imageWave = false }) {
  const waveMaskStyle = useMemo(
    () => (imageWave ? getSectionImageWaveMaskStyle() : undefined),
    [imageWave],
  )

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-0 overflow-hidden ${imageWave ? '-top-12' : 'inset-y-0'}`}
      style={waveMaskStyle}
      aria-hidden
    >
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="lazy"
        decoding="async"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={heroOverlayGradientStyle(overlayOpacity, 65)}
      />
    </div>
  )
}

function EmergencySkeleton({ previousTone = 'light' }) {
  const imageWave = usesImageWaveEdge('accent', previousTone)

  return (
    <section
      className={`relative isolate overflow-visible border-b border-white/10 bg-[#171b22] py-14 text-white sm:py-16 ${
        imageWave ? '-mt-12 z-1' : ''
      }`}
    >
      {!imageWave ? <SectionTopWave tone="accent" previousTone={previousTone} /> : null}
      <Container className="relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto h-6 w-36 animate-pulse rounded-full bg-white/10" />
          <div className="mx-auto mt-4 h-10 w-72 animate-pulse rounded-lg bg-white/10" />
          <div className="mx-auto mt-3 h-4 w-full max-w-md animate-pulse rounded bg-white/10" />
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-3xl bg-white/8" />
          ))}
        </div>
      </Container>
    </section>
  )
}

export function HomeEmergencyNumbers({ content, loading = false, previousTone = 'light' }) {
  const merged = useMemo(
    () => mergeHomeEmergencyContent(DEFAULT_HOME_EMERGENCY_CONTENT, content || {}),
    [content],
  )
  const numbers = useMemo(() => getActiveEmergencyNumbers(merged), [merged])
  const imageWave = usesImageWaveEdge('accent', previousTone)

  if (loading) return <EmergencySkeleton previousTone={previousTone} />
  if (numbers.length === 0) return null

  const imageUrl =
    resolveMediaUrl(merged.imageUrl?.trim() || HOME_EMERGENCY_DEFAULT_IMAGE) ||
    HOME_EMERGENCY_DEFAULT_IMAGE

  return (
    <section
      className={`relative isolate overflow-visible border-b border-white/10 bg-[#171b22] py-14 text-white sm:py-16 lg:py-20 ${
        imageWave ? '-mt-12 z-1' : ''
      }`}
      aria-labelledby="titulo-emergencias-inicio"
    >
      {!imageWave ? <SectionTopWave tone="accent" previousTone={previousTone} /> : null}

      <EmergencyBackdrop
        imageUrl={imageUrl}
        overlayOpacity={merged.overlayOpacity}
        imageWave={imageWave}
      />

      <Container className="relative z-10">
        <RevealOnScroll variant="slow">
          <div className="mx-auto max-w-3xl text-center">
            {merged.showEyebrow !== false && merged.eyebrow ? (
              <p className="inline-flex rounded-full border border-white/14 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
                {merged.eyebrow}
              </p>
            ) : null}
            {merged.showTitle !== false && merged.title ? (
              <h2
                id="titulo-emergencias-inicio"
                className="mt-4 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
              >
                {merged.title}
              </h2>
            ) : (
              <h2 id="titulo-emergencias-inicio" className="sr-only">
                Números de emergencia
              </h2>
            )}
            {merged.showSubtitle !== false && merged.subtitle ? (
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-100/95 sm:text-lg">
                {merged.subtitle}
              </p>
            ) : null}
          </div>
        </RevealOnScroll>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {numbers.map((item, index) => {
            const href = telHref(item.phone)
            const CardTag = href ? 'a' : 'article'
            const cardProps = href
              ? { href, 'aria-label': `Llamar a ${item.label}: ${item.phone}` }
              : {}

            return (
              <RevealOnScroll key={item.id || index} variant="slow" delayMs={index * 80} className="h-full">
                <CardTag
                  {...cardProps}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/16 bg-white/10 p-5 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.55)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-sky-200/50 hover:bg-white/14 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 sm:p-6"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/14 bg-[#171b22]/55 text-sky-100 shadow-sm transition group-hover:border-sky-200/40 group-hover:text-white">
                    <PhoneIcon />
                  </span>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-sky-100/90">
                    {item.label || 'Contacto'}
                  </p>
                  <p className="mt-2 font-serif text-3xl font-bold tracking-tight text-white tabular-nums sm:text-4xl">
                    {item.phone || '—'}
                  </p>
                  {item.description ? (
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-100/90">
                      {item.description}
                    </p>
                  ) : (
                    <span className="flex-1" />
                  )}
                  {href ? (
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-100 transition group-hover:text-white">
                      Llamar ahora
                      <span aria-hidden>→</span>
                    </span>
                  ) : null}
                </CardTag>
              </RevealOnScroll>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

import { Container } from '../ui/Container.jsx'
import { RevealOnScroll } from './RevealOnScroll.jsx'

const TONE_CLASS = {
  light: 'border-y border-[#e8e5dd] bg-[#f7f7f5]',
  soft: 'border-y border-[#e8e5dd] bg-[#f7f7f5]',
  accent: 'border-y border-white/10 bg-[#171b22] text-white',
}

const WAVE_CLASS = {
  light: 'text-[#f7f7f5]',
  soft: 'text-[#f7f7f5]',
  accent: 'text-[#171b22]',
}

const EYE_BROW_CLASS = {
  light: 'text-sky-800/90',
  soft: 'text-sky-800/90',
  accent: 'text-sky-200/90',
}

const TITLE_CLASS = {
  light: 'text-[#171b22]',
  soft: 'text-[#171b22]',
  accent: 'text-white',
}

const SUBTITLE_CLASS = {
  light: 'text-[#3e434d]',
  soft: 'text-[#444a55]',
  accent: 'text-slate-200',
}

export function StorySection({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  actions = null,
  tone = 'light',
  className = '',
  contentClassName = '',
}) {
  const isAccent = tone === 'accent'
  return (
    <section id={id} className={`relative isolate overflow-visible py-14 sm:py-16 lg:py-20 ${TONE_CLASS[tone] ?? TONE_CLASS.light} ${className}`.trim()}>
      <svg
        className={`pointer-events-none absolute inset-x-0 -top-12 z-0 h-12 w-full ${WAVE_CLASS[tone] ?? WAVE_CLASS.light}`}
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M0 58L60 52C120 46 240 34 360 42C480 50 600 78 720 74C840 70 960 34 1080 30C1200 26 1320 54 1380 68L1440 82V96H0V58Z"
        />
      </svg>

      <Container className="relative z-10">
        <RevealOnScroll variant="slow">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                isAccent
                  ? 'border-white/14 bg-white/8 text-sky-100'
                  : `border-[#ddd7ca] bg-white/55 ${EYE_BROW_CLASS[tone] ?? EYE_BROW_CLASS.light}`
              }`}>
                {eyebrow}
              </p>
            ) : null}
            <h2 className={`mt-4 max-w-2xl font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${TITLE_CLASS[tone] ?? TITLE_CLASS.light}`}>
              {title}
            </h2>
            {subtitle ? (
              <p className={`mt-4 max-w-2xl text-base leading-relaxed sm:text-lg ${SUBTITLE_CLASS[tone] ?? SUBTITLE_CLASS.light}`}>
                {subtitle}
              </p>
            ) : null}
          </div>
        </RevealOnScroll>

        {actions ? <RevealOnScroll variant="slow" className="mt-6">{actions}</RevealOnScroll> : null}

        <div className={`relative mt-8 sm:mt-10 ${contentClassName}`.trim()}>{children}</div>
      </Container>
    </section>
  )
}

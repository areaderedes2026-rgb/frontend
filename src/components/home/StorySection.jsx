import { Container } from '../ui/Container.jsx'
import { RevealOnScroll } from './RevealOnScroll.jsx'

const TONE_CLASS = {
  light:
    'border-y border-[#e8e5dd] bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.10),transparent_32rem),linear-gradient(180deg,#fbfaf7_0%,#f4f1ea_100%)]',
  soft:
    'border-y border-[#e4dfd4] bg-[radial-gradient(circle_at_80%_0%,rgba(23,27,34,0.10),transparent_30rem),radial-gradient(circle_at_10%_85%,rgba(14,165,233,0.10),transparent_28rem),linear-gradient(180deg,#f1eee8_0%,#fbfaf7_100%)]',
  accent:
    'border-y border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(14,165,233,0.20),transparent_30rem),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.10),transparent_26rem),linear-gradient(180deg,#171b22_0%,#1a1d24_48%,#171b22_100%)] text-white',
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
    <section id={id} className={`relative overflow-hidden py-14 sm:py-16 lg:py-20 ${TONE_CLASS[tone] ?? TONE_CLASS.light} ${className}`.trim()}>
      <div
        className={`pointer-events-none absolute inset-0 opacity-45 ${
          isAccent
            ? 'bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)]'
            : 'bg-[linear-gradient(rgba(23,27,34,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(23,27,34,0.028)_1px,transparent_1px)]'
        } bg-size-[38px_38px]`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -right-24 top-10 h-56 w-56 rounded-full blur-3xl ${
          isAccent ? 'bg-sky-300/12' : 'bg-sky-300/18'
        }`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -left-28 bottom-6 h-64 w-64 rounded-full blur-3xl ${
          isAccent ? 'bg-white/8' : 'bg-[#171b22]/8'
        }`}
        aria-hidden
      />

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

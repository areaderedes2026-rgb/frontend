import { Container } from '../ui/Container.jsx'
import { RevealOnScroll } from './RevealOnScroll.jsx'

const TONE_CLASS = {
  light: 'bg-[#f7f7f5] border-y border-[#e8e5dd]',
  soft: 'bg-linear-to-b from-[#f1eee8] to-[#f8f7f3] border-y border-[#e4dfd4]',
  accent:
    'bg-linear-to-b from-[#171b22] via-[#1a1d24] to-[#171b22] text-white border-y border-white/10',
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
  return (
    <section id={id} className={`py-12 sm:py-16 ${TONE_CLASS[tone] ?? TONE_CLASS.light} ${className}`.trim()}>
      <Container>
        <RevealOnScroll variant="slow">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${EYE_BROW_CLASS[tone] ?? EYE_BROW_CLASS.light}`}>
                {eyebrow}
              </p>
            ) : null}
            <h2 className={`mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl ${TITLE_CLASS[tone] ?? TITLE_CLASS.light}`}>
              {title}
            </h2>
            {subtitle ? (
              <p className={`mt-4 text-base leading-relaxed sm:text-lg ${SUBTITLE_CLASS[tone] ?? SUBTITLE_CLASS.light}`}>
                {subtitle}
              </p>
            ) : null}
          </div>
        </RevealOnScroll>

        {actions ? <RevealOnScroll variant="slow" className="mt-6">{actions}</RevealOnScroll> : null}

        <div className={`mt-8 sm:mt-10 ${contentClassName}`.trim()}>{children}</div>
      </Container>
    </section>
  )
}

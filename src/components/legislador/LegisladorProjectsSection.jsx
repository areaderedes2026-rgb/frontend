import { useCountUp } from '../../hooks/useCountUp.js'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'
import { sortProjectStats } from '../../data/legisladorProjectsContent.js'

function ProjectStatBlock({ stat, delayMs = 0 }) {
  const { ref, value } = useCountUp(stat.count, { duration: 3200 })
  return (
    <RevealOnScroll variant="newsCardSlow" delayMs={delayMs}>
      <div
        ref={ref}
        className="group relative overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#171b22] px-5 py-7 text-center shadow-[0_20px_60px_-40px_rgba(15,23,42,0.55)] transition duration-500 hover:-translate-y-1 hover:border-sky-400/40 hover:shadow-[0_28px_70px_-36px_rgba(14,165,233,0.35)] sm:px-6 sm:py-8"
      >
        <div
          className="pointer-events-none absolute -right-6 -top-8 text-[7rem] font-black leading-none text-white/[0.04] sm:text-[8rem]"
          aria-hidden
        >
          {stat.year}
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(56,189,248,0.18),transparent_70%)]"
          aria-hidden
        />
        <p className="relative text-[11px] font-bold uppercase tracking-[0.22em] text-sky-300">
          {stat.year}
        </p>
        <p
          className="relative mt-3 font-serif text-5xl font-bold tabular-nums tracking-tight text-white sm:text-6xl"
          aria-label={`${stat.count} proyectos en ${stat.year}`}
        >
          {value}
        </p>
        <p className="relative mt-3 text-sm font-medium text-slate-300">
          proyectos presentados
        </p>
      </div>
    </RevealOnScroll>
  )
}

export function LegisladorProjectsSection({ section }) {
  if (!section?.enabled) return null
  const items = sortProjectStats(section.items || [])
  if (!items.length) return null

  return (
    <section
      id="proyectos-presentados"
      className="scroll-mt-[calc(var(--navbar-h,5rem)+1rem)] mt-10 sm:mt-12"
      aria-labelledby="leg-proyectos-heading"
    >
      <RevealOnScroll variant="slow">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-800">
            Trayectoria legislativa
          </p>
          <h2
            id="leg-proyectos-heading"
            className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl"
          >
            {section.title || 'Proyectos presentados'}
          </h2>
          {section.subtitle ? (
            <p className="mt-2 text-sm leading-relaxed text-[#5c6169] sm:text-base">
              {section.subtitle}
            </p>
          ) : null}
        </div>
      </RevealOnScroll>

      <ul className="mt-8 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {items.map((stat, index) => (
          <li key={stat.id} className="min-w-0">
            <ProjectStatBlock stat={stat} delayMs={80 + index * 90} />
          </li>
        ))}
      </ul>
    </section>
  )
}

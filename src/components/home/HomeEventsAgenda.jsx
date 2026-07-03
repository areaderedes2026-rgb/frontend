import { Link } from 'react-router-dom'
import { EventAgendaExperience } from '../events/EventAgendaExperience.jsx'
import { Container } from '../ui/Container.jsx'
import { ROUTES } from '../../utils/constants.js'

function AgendaSkeleton() {
  return (
    <section className="relative isolate overflow-visible border-y border-white/10 bg-[#171b22] py-12 text-white sm:py-14">
      <svg
        className="pointer-events-none absolute inset-x-0 -top-12 z-0 h-12 w-full text-[#171b22]"
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
        <div className="space-y-8">
          <div className="max-w-2xl">
            <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
            <div className="mt-4 h-9 w-72 animate-pulse rounded-3xl bg-white/8" />
          </div>
          <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
            <div className="h-80 animate-pulse rounded-3xl bg-white/8 lg:col-span-4" />
            <div className="h-80 animate-pulse rounded-3xl bg-white/8 lg:col-span-8" />
          </div>
        </div>
      </Container>
    </section>
  )
}

export function HomeEventsAgenda({ events = [], loading = false }) {
  if (loading) return <AgendaSkeleton />
  if (!Array.isArray(events) || events.length === 0) return null

  return (
    <section
      className="relative isolate overflow-visible border-y border-white/10 bg-[#171b22] py-12 text-white sm:py-14"
      aria-labelledby="titulo-agenda-inicio"
    >
      <svg
        className="pointer-events-none absolute inset-x-0 -top-12 z-0 h-12 w-full text-[#171b22]"
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
        <EventAgendaExperience
          events={events}
          loading={false}
          variant="dark"
          headerId="titulo-agenda-inicio"
          headerAction={
            <Link
              to={ROUTES.events}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/14 bg-white/8 px-4 py-2.5 text-sm font-semibold text-sky-100 shadow-sm transition hover:border-sky-200/60 hover:bg-white/12 hover:text-white"
            >
              Ver agenda completa
              <span aria-hidden>→</span>
            </Link>
          }
          showFeatured={false}
          railLimit={8}
        />
      </Container>
    </section>
  )
}

import { Link } from 'react-router-dom'
import { EventAgendaExperience } from '../events/EventAgendaExperience.jsx'
import { Container } from '../ui/Container.jsx'
import { ROUTES } from '../../utils/constants.js'
import { SectionBottomWave, SectionTopWave } from './SectionTopWave.jsx'

const AGENDA_SHELL =
  'relative isolate z-10 overflow-visible border-t border-white/10 bg-[#171b22] py-12 text-white sm:py-14'

function AgendaWaves() {
  return (
    <>
      <SectionTopWave tone="accent" previousTone="light" />
      <SectionBottomWave color="#171b22" />
    </>
  )
}

function AgendaSkeleton() {
  return (
    <section className={AGENDA_SHELL}>
      <AgendaWaves />
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
    <section className={AGENDA_SHELL} aria-labelledby="titulo-agenda-inicio">
      <AgendaWaves />

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

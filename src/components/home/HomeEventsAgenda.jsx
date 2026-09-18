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

export function HomeEventsAgenda({ events = [], loading = false }) {
  const list = Array.isArray(events) ? events : []
  if (!loading && list.length === 0) return null

  return (
    <section className={AGENDA_SHELL} aria-labelledby="titulo-agenda-inicio">
      <AgendaWaves />

      <Container className="relative z-10">
        <EventAgendaExperience
          events={list}
          loading={loading}
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

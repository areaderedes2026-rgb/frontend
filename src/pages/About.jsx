import { PageHeader } from '../components/ui/PageHeader.jsx'
import { Container } from '../components/ui/Container.jsx'
import { APP_NAME } from '../utils/constants.js'

export function About() {
  return (
    <section>
      <Container className="!max-w-3xl">
        <PageHeader
          title="La comuna"
          subtitle="Misión y valores que guían la gestión municipal."
        />
        <div className="mt-8 space-y-4 text-base leading-relaxed text-slate-600 sm:mt-10">
          <p>
            {APP_NAME} trabaja para mejorar la calidad de vida de los vecinos con
            políticas inclusivas, participación ciudadana y uso eficiente de los
            recursos públicos.
          </p>
          <p>
            Esta sección se completará con historia local, autoridades y mapas
            cuando incorpores el contenido institucional definitivo.
          </p>
        </div>
      </Container>
    </section>
  )
}

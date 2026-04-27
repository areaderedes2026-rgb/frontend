import { Link } from 'react-router-dom'
import { Container } from '../components/ui/Container.jsx'

export function NotFound() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center sm:py-24">
      <Container>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Página no encontrada
        </h1>
        <p className="mx-auto mt-4 max-w-md text-slate-600">
          La dirección no existe o fue movida.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-slate-800 hover:shadow-xl active:scale-[0.98]"
        >
          Volver al inicio
        </Link>
      </Container>
    </section>
  )
}

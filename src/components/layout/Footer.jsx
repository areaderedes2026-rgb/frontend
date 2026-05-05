import { Link } from 'react-router-dom'
import { APP_NAME, ROUTES } from '../../utils/constants.js'
import { Container } from '../ui/Container.jsx'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-3">
            <p className="text-lg font-semibold text-slate-900">{APP_NAME}</p>
            <p className="max-w-sm text-sm leading-relaxed text-slate-600">
              Gobierno local al servicio de la comunidad. Información oficial y
              canales de atención al vecino.
            </p>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Enlaces
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/news"
                  className="text-slate-700 transition-colors hover:text-sky-700"
                >
                  Noticias
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-slate-700 transition-colors hover:text-sky-700"
                >
                  Trámites y servicios
                </Link>
              </li>
              <li>
                <Link
                  to="/areas"
                  className="text-slate-700 transition-colors hover:text-sky-700"
                >
                  Áreas municipales
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.ofertaAcademica}
                  className="text-slate-700 transition-colors hover:text-sky-700"
                >
                  Oferta académica
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.atencionCiudadano}
                  className="text-slate-700 transition-colors hover:text-sky-700"
                >
                  Atención al ciudadano
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Legal
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              Los contenidos de este sitio son de carácter informativo. Para
              requisitos legales consultá las resoluciones publicadas en el boletín
              oficial.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              <Link
                to="/admin/login"
                className="transition-colors hover:text-sky-700"
              >
                Área interna
              </Link>
            </p>
          </div>
        </div>
      </Container>
      <div className="border-t border-slate-100 bg-slate-50/80">
        <Container className="flex flex-col gap-1 py-5 text-center text-xs text-slate-500 sm:flex-row sm:justify-between sm:text-left">
          <span>
            © {year} {APP_NAME}
          </span>
          <span className="hidden sm:inline">Trancas, Tucumán</span>
        </Container>
      </div>
    </footer>
  ) 
}

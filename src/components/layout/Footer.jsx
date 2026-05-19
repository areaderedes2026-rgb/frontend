import { Link } from 'react-router-dom'
import { APP_NAME, ROUTES } from '../../utils/constants.js'
import { Container } from '../ui/Container.jsx'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative mt-auto overflow-hidden bg-[#171b22] text-white">
      <div className="absolute inset-x-0 top-0 h-24 bg-slate-50" aria-hidden />
      <svg
        className="relative z-0 -mb-px block h-24 w-full text-[#171b22] sm:h-28 lg:h-32"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M0 52L48 56C96 60 192 68 288 66C384 64 480 52 576 58C672 64 768 88 864 88C960 88 1056 64 1152 56C1248 48 1344 56 1392 60L1440 64V160H0V52Z"
        />
      </svg>

      <Container className="relative z-10 pt-8 pb-8 sm:pt-10 sm:pb-10">
        <div className="grid gap-8 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-3 lg:gap-12">
          <div className="space-y-3">
            <p className="text-lg font-semibold tracking-tight text-white">{APP_NAME}</p>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-white/82 sm:mx-0">
              Gobierno local al servicio de la comunidad. Información oficial y
              canales de atención al vecino.
            </p>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Enlaces
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/news"
                  className="text-white/88 transition-colors hover:text-white"
                >
                  Noticias
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-white/88 transition-colors hover:text-white"
                >
                  Trámites y servicios
                </Link>
              </li>
              <li>
                <Link
                  to="/areas"
                  className="text-white/88 transition-colors hover:text-white"
                >
                  Áreas municipales
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.ofertaAcademica}
                  className="text-white/88 transition-colors hover:text-white"
                >
                  Oferta académica
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.atencionCiudadano}
                  className="text-white/88 transition-colors hover:text-white"
                >
                  Atención al ciudadano
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Legal
            </p>
            <p className="text-sm leading-relaxed text-white/82">
              Los contenidos de este sitio son de carácter informativo. Para
              requisitos legales consultá las resoluciones publicadas en el boletín
              oficial.
            </p>
            <p className="mt-4 text-xs text-white/70">
              <Link
                to="/admin/login"
                className="transition-colors hover:text-white"
              >
                Área interna
              </Link>
            </p>
          </div>
        </div>
      </Container>
      <div className="relative z-10 border-t border-white/10 bg-[#141922]">
        <Container className="flex flex-col gap-1 py-5 text-center text-xs text-white/78 sm:flex-row sm:justify-between sm:text-left">
          <span>
            © {year} {APP_NAME}
          </span>
          <span className="hidden sm:inline">Trancas, Tucumán</span>
        </Container>
      </div>
    </footer>
  ) 
}   
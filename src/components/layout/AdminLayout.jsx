import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { APP_NAME, ROUTES } from '../../utils/constants.js'
import { Container } from '../ui/Container.jsx'
import { Button } from '../ui/Button.jsx'
import { PageTransitionOutlet } from './PageTransitionOutlet.jsx'
import { ScrollToTop } from './ScrollToTop.jsx'
import {
  preloadAdminRoute,
  preloadCommonAdminRoutes,
} from '../../routes/adminRoutePreload.js'

function navClass({ isActive }) {
  return `relative rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 sm:px-4 ${
    isActive
      ? 'bg-white text-sky-800 shadow-sm ring-1 ring-slate-200/80'
      : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
  }`
}

export function AdminLayout() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const sessionLabel = user?.username || user?.name || 'Usuario'
  const settingsActive =
    (pathname === ROUTES.adminSettings || pathname.startsWith(`${ROUTES.adminSettings}/`)) &&
    pathname !== ROUTES.adminSettingsLegisladorEste &&
    pathname !== ROUTES.adminSettingsConcejoDeliberante
  const newsActive =
    pathname === ROUTES.adminNews ||
    pathname.startsWith(`${ROUTES.adminNews}/`)
  const areasActive =
    pathname === ROUTES.adminAreas ||
    pathname.startsWith(`${ROUTES.adminAreas}/`)
  const eventsActive =
    pathname === ROUTES.adminEvents ||
    pathname.startsWith(`${ROUTES.adminEvents}/`)
  const historyActive =
    pathname === ROUTES.adminHistory ||
    pathname.startsWith(`${ROUTES.adminHistory}/`)
  const citizenAttentionActive =
    pathname === ROUTES.adminCitizenAttention ||
    pathname.startsWith(`${ROUTES.adminCitizenAttention}/`)
  const citizenInquiriesActive =
    pathname === ROUTES.adminCitizenInquiries ||
    pathname.startsWith(`${ROUTES.adminCitizenInquiries}/`)
  const ofertaAcademicaActive =
    pathname === ROUTES.adminOfertaAcademica ||
    pathname.startsWith(`${ROUTES.adminOfertaAcademica}/`)

  useEffect(() => {
    const run = () => {
      preloadCommonAdminRoutes()
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(run, { timeout: 1500 })
      return () => window.cancelIdleCallback(id)
    }

    const timer = setTimeout(run, 400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <ScrollToTop />
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 shadow-sm backdrop-blur-md">
        <Container className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
            <NavLink
              to="/admin/dashboard"
              className="group flex min-w-0 items-center gap-3 rounded-xl outline-none ring-sky-500/30 focus-visible:ring-4"
              end
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-sm font-bold text-white shadow-sm ring-1 ring-sky-500/30 transition group-hover:bg-sky-700"
                aria-hidden
              >
                MT
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700">
                  Administración
                </p>
                <p className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                  {APP_NAME}
                </p>
              </div>
            </NavLink>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <a
              href={ROUTES.home}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-sky-200/90 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-100/90 sm:text-sm"
            >
              Portal público
              <span className="ml-1.5 text-[10px] font-bold opacity-70" aria-hidden>
                ↗
              </span>
            </a>
            <span className="max-w-[200px] truncate rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 sm:max-w-xs sm:text-sm">
              {sessionLabel}
            </span>
            <Button type="button" variant="secondary" onClick={logout}>
              Cerrar sesión
            </Button>
          </div>
        </Container>
        <nav
          className="border-t border-slate-100 bg-slate-50/90"
          aria-label="Administración"
        >
          <Container className="flex flex-wrap gap-1 py-2.5 sm:gap-2">
            <NavLink
              to="/admin/dashboard"
              className={navClass}
              end
              onMouseEnter={() => preloadAdminRoute('dashboard')}
              onFocus={() => preloadAdminRoute('dashboard')}
            >
              Inicio
            </NavLink>
            <NavLink
              to={ROUTES.adminNews}
              onMouseEnter={() => preloadAdminRoute('news')}
              onFocus={() => preloadAdminRoute('news')}
              className={({ isActive }) =>
                navClass({ isActive: isActive || newsActive })
              }
            >
              Noticias
            </NavLink>
            <NavLink
              to={ROUTES.adminEvents}
              onMouseEnter={() => preloadAdminRoute('events')}
              onFocus={() => preloadAdminRoute('events')}
              className={({ isActive }) =>
                navClass({ isActive: isActive || eventsActive })
              }
            >
              Eventos
            </NavLink>
            <NavLink
              to={ROUTES.adminAreas}
              onMouseEnter={() => preloadAdminRoute('areas')}
              onFocus={() => preloadAdminRoute('areas')}
              className={({ isActive }) =>
                navClass({ isActive: isActive || areasActive })
              }
            >
              Áreas
            </NavLink>
            <NavLink
              to={ROUTES.adminHistory}
              onMouseEnter={() => preloadAdminRoute('history')}
              onFocus={() => preloadAdminRoute('history')}
              className={({ isActive }) =>
                navClass({ isActive: isActive || historyActive })
              }
            >
              Historia
            </NavLink>
            <NavLink
              to={ROUTES.adminOfertaAcademica}
              onMouseEnter={() => preloadAdminRoute('ofertaAcademica')}
              onFocus={() => preloadAdminRoute('ofertaAcademica')}
              className={({ isActive }) =>
                navClass({ isActive: isActive || ofertaAcademicaActive })
              }
            >
              Oferta académica
            </NavLink>
            <NavLink
              to={ROUTES.adminCitizenAttention}
              onMouseEnter={() => preloadAdminRoute('citizenAttention')}
              onFocus={() => preloadAdminRoute('citizenAttention')}
              className={({ isActive }) =>
                navClass({ isActive: isActive || citizenAttentionActive })
              }
            >
              Atención
            </NavLink>
            <NavLink
              to={ROUTES.adminCitizenInquiries}
              onMouseEnter={() => preloadAdminRoute('citizenInquiries')}
              onFocus={() => preloadAdminRoute('citizenInquiries')}
              className={({ isActive }) =>
                navClass({ isActive: isActive || citizenInquiriesActive })
              }
            >
              Consultas
            </NavLink>
            <NavLink
              to={ROUTES.adminSettings}
              onMouseEnter={() => preloadAdminRoute('settingsLayout')}
              onFocus={() => preloadAdminRoute('settingsLayout')}
              className={({ isActive }) =>
                navClass({ isActive: isActive || settingsActive })
              }
            >
              Configuración
            </NavLink>
          </Container>
        </nav>
      </header>

      <main className="flex-1 py-8 sm:py-10 lg:py-12">
        <Container>
          <PageTransitionOutlet scope="admin" />
        </Container>
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-4">
        <Container className="flex flex-col items-center justify-between gap-2 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <span>Municipalidad de Trancas — panel de gestión</span>
          <NavLink
            to="/"
            className="font-semibold text-sky-700 transition-colors hover:text-sky-900"
          >
            Ir al sitio ciudadano
          </NavLink>
        </Container>
      </footer>
    </div>
  )
}

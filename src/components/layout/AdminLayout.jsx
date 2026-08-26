import { useCallback, useEffect, useId, useState } from 'react'
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

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-open'

function readSidebarOpen() {
  try {
    const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (raw === null) return true
    return raw === '1' || raw === 'true'
  } catch {
    return true
  }
}

function navClass({ isActive }) {
  return `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
    isActive
      ? 'bg-sky-600 text-white shadow-sm'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`
}

function subNavClass({ isActive }) {
  return `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-sky-50 text-sky-800 ring-1 ring-sky-200/80'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`
}

function MenuIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  )
}

function ChevronIcon({ collapsed }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  )
}

function ChevronDownIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function AdminLayout() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const sessionLabel = user?.username || user?.name || 'Usuario'
  const navId = useId()
  const desktopNavId = `${navId}-desktop`
  const mobileNavId = `${navId}-mobile`
  const [sidebarOpen, setSidebarOpen] = useState(readSidebarOpen)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [gobiernoOpen, setGobiernoOpen] = useState(false)
  const [nuestraCiudadOpen, setNuestraCiudadOpen] = useState(false)

  const intendenciaActive =
    pathname === ROUTES.adminIntendencia ||
    pathname.startsWith(`${ROUTES.adminIntendencia}/`)
  const concejoActive =
    pathname === ROUTES.adminConcejoDeliberante ||
    pathname.startsWith(`${ROUTES.adminConcejoDeliberante}/`)
  const legisladorActive =
    pathname === ROUTES.adminLegisladorEste ||
    pathname.startsWith(`${ROUTES.adminLegisladorEste}/`)
  const gobiernoActive = intendenciaActive || concejoActive || legisladorActive

  const settingsActive =
    pathname === ROUTES.adminSettings ||
    (pathname.startsWith(`${ROUTES.adminSettings}/`) &&
      !pathname.startsWith('/admin/settings/intendencia') &&
      !pathname.startsWith('/admin/settings/legislador-este') &&
      !pathname.startsWith('/admin/settings/concejo-deliberante'))
  const newsActive =
    pathname === ROUTES.adminNews || pathname.startsWith(`${ROUTES.adminNews}/`)
  const areasActive =
    pathname === ROUTES.adminAreas || pathname.startsWith(`${ROUTES.adminAreas}/`)
  const eventsActive =
    pathname === ROUTES.adminEvents || pathname.startsWith(`${ROUTES.adminEvents}/`)
  const historyActive =
    pathname === ROUTES.adminHistory || pathname.startsWith(`${ROUTES.adminHistory}/`)
  const tourismActive =
    pathname === ROUTES.adminTourismPlaces ||
    pathname.startsWith(`${ROUTES.adminTourismPlaces}/`)
  const citizenAttentionActive =
    pathname === ROUTES.adminCitizenAttention ||
    pathname.startsWith(`${ROUTES.adminCitizenAttention}/`)
  const citizenInquiriesActive =
    pathname === ROUTES.adminCitizenInquiries ||
    pathname.startsWith(`${ROUTES.adminCitizenInquiries}/`)
  const servicesActive =
    pathname === ROUTES.adminServices || pathname.startsWith(`${ROUTES.adminServices}/`)
  const ofertaAcademicaActive =
    pathname === ROUTES.adminOfertaAcademica ||
    pathname.startsWith(`${ROUTES.adminOfertaAcademica}/`)
  const gastronomicCatalogActive =
    pathname === ROUTES.adminCatalogoGastronomico ||
    pathname.startsWith(`${ROUTES.adminCatalogoGastronomico}/`)
  const fdcActive =
    pathname === ROUTES.adminFdc ||
    pathname.startsWith(`${ROUTES.adminFdc}/`) ||
    pathname === ROUTES.adminFdcSolicitudes ||
    pathname.startsWith(`${ROUTES.adminFdcSolicitudes}/`)
  const nuestraCiudadActive =
    eventsActive ||
    ofertaAcademicaActive ||
    gastronomicCatalogActive ||
    tourismActive ||
    historyActive

  const persistSidebarOpen = useCallback((next) => {
    setSidebarOpen(next)
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [])

  // Abrir submenú Gobierno al estar en una de sus secciones
  useEffect(() => {
    if (gobiernoActive) setGobiernoOpen(true)
  }, [gobiernoActive])

  useEffect(() => {
    if (nuestraCiudadActive) setNuestraCiudadOpen(true)
  }, [nuestraCiudadActive])

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

  // Cerrar drawer móvil al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    function onKey(e) {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  function renderNavItems() {
    if (user?.role === 'area_service_editor') {
      return (
        <NavLink
          to={ROUTES.adminMyAreaServices}
          className={navClass}
          onMouseEnter={() => preloadAdminRoute('myAreaServices')}
          onFocus={() => preloadAdminRoute('myAreaServices')}
          onClick={closeMobile}
        >
          Mis servicios
        </NavLink>
      )
    }

    return (
      <>
        <NavLink
          to="/admin/dashboard"
          className={navClass}
          end
          onMouseEnter={() => preloadAdminRoute('dashboard')}
          onFocus={() => preloadAdminRoute('dashboard')}
          onClick={closeMobile}
        >
          Inicio
        </NavLink>
        <NavLink
          to={ROUTES.adminNews}
          onMouseEnter={() => preloadAdminRoute('news')}
          onFocus={() => preloadAdminRoute('news')}
          onClick={closeMobile}
          className={({ isActive }) => navClass({ isActive: isActive || newsActive })}
        >
          Noticias
        </NavLink>

        <div className="space-y-1">
          <button
            type="button"
            className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 ${
              gobiernoActive
                ? 'bg-sky-50 text-sky-800 ring-1 ring-sky-200/80'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            aria-expanded={gobiernoOpen}
            onClick={() => setGobiernoOpen((v) => !v)}
          >
            <span>Gobierno</span>
            <ChevronDownIcon open={gobiernoOpen} />
          </button>
          {gobiernoOpen ? (
            <div className="ml-2 space-y-0.5 border-l border-slate-200 pl-2">
              <NavLink
                to={ROUTES.adminIntendencia}
                onMouseEnter={() => preloadAdminRoute('settingsIntendencia')}
                onFocus={() => preloadAdminRoute('settingsIntendencia')}
                onClick={closeMobile}
                className={({ isActive }) =>
                  subNavClass({ isActive: isActive || intendenciaActive })
                }
              >
                Intendencia
              </NavLink>
              <NavLink
                to={ROUTES.adminConcejoDeliberante}
                onMouseEnter={() => preloadAdminRoute('settingsConcejoDeliberante')}
                onFocus={() => preloadAdminRoute('settingsConcejoDeliberante')}
                onClick={closeMobile}
                className={({ isActive }) =>
                  subNavClass({ isActive: isActive || concejoActive })
                }
              >
                Concejo deliberante
              </NavLink>
              <NavLink
                to={ROUTES.adminLegisladorEste}
                onMouseEnter={() => preloadAdminRoute('settingsLegisladorEste')}
                onFocus={() => preloadAdminRoute('settingsLegisladorEste')}
                onClick={closeMobile}
                className={({ isActive }) =>
                  subNavClass({ isActive: isActive || legisladorActive })
                }
              >
                Legislador por el Este
              </NavLink>
            </div>
          ) : null}
        </div>

        <NavLink
          to={ROUTES.adminAreas}
          onMouseEnter={() => preloadAdminRoute('areas')}
          onFocus={() => preloadAdminRoute('areas')}
          onClick={closeMobile}
          className={({ isActive }) => navClass({ isActive: isActive || areasActive })}
        >
          Áreas
        </NavLink>
        <NavLink
          to={ROUTES.adminServices}
          onMouseEnter={() => preloadAdminRoute('services')}
          onFocus={() => preloadAdminRoute('services')}
          onClick={closeMobile}
          className={({ isActive }) => navClass({ isActive: isActive || servicesActive })}
        >
          Servicios
        </NavLink>

        <div className="space-y-1">
          <button
            type="button"
            className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 ${
              nuestraCiudadActive
                ? 'bg-sky-50 text-sky-800 ring-1 ring-sky-200/80'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            aria-expanded={nuestraCiudadOpen}
            onClick={() => setNuestraCiudadOpen((v) => !v)}
          >
            <span>Nuestra ciudad</span>
            <ChevronDownIcon open={nuestraCiudadOpen} />
          </button>
          {nuestraCiudadOpen ? (
            <div className="ml-2 space-y-0.5 border-l border-slate-200 pl-2">
              <NavLink
                to={ROUTES.adminEvents}
                onMouseEnter={() => preloadAdminRoute('events')}
                onFocus={() => preloadAdminRoute('events')}
                onClick={closeMobile}
                className={({ isActive }) =>
                  subNavClass({ isActive: isActive || eventsActive })
                }
              >
                Eventos
              </NavLink>
              <NavLink
                to={ROUTES.adminOfertaAcademica}
                onMouseEnter={() => preloadAdminRoute('ofertaAcademica')}
                onFocus={() => preloadAdminRoute('ofertaAcademica')}
                onClick={closeMobile}
                className={({ isActive }) =>
                  subNavClass({ isActive: isActive || ofertaAcademicaActive })
                }
              >
                Oferta académica
              </NavLink>
              <NavLink
                to={ROUTES.adminCatalogoGastronomico}
                onMouseEnter={() => preloadAdminRoute('gastronomicCatalog')}
                onFocus={() => preloadAdminRoute('gastronomicCatalog')}
                onClick={closeMobile}
                className={({ isActive }) =>
                  subNavClass({ isActive: isActive || gastronomicCatalogActive })
                }
              >
                Catálogo gastronómico
              </NavLink>
              <NavLink
                to={ROUTES.adminTourismPlaces}
                onMouseEnter={() => preloadAdminRoute('tourismPlaces')}
                onFocus={() => preloadAdminRoute('tourismPlaces')}
                onClick={closeMobile}
                className={({ isActive }) =>
                  subNavClass({ isActive: isActive || tourismActive })
                }
              >
                Turismo
              </NavLink>
              <NavLink
                to={ROUTES.adminHistory}
                onMouseEnter={() => preloadAdminRoute('history')}
                onFocus={() => preloadAdminRoute('history')}
                onClick={closeMobile}
                className={({ isActive }) =>
                  subNavClass({ isActive: isActive || historyActive })
                }
              >
                Historia
              </NavLink>
            </div>
          ) : null}
        </div>

        <NavLink
          to={ROUTES.adminFdc}
          onMouseEnter={() => preloadAdminRoute('fdc')}
          onFocus={() => preloadAdminRoute('fdc')}
          onClick={closeMobile}
          className={({ isActive }) => navClass({ isActive: isActive || fdcActive })}
        >
          Fiesta Caballo
        </NavLink>
        <NavLink
          to={ROUTES.adminCitizenAttention}
          onMouseEnter={() => preloadAdminRoute('citizenAttention')}
          onFocus={() => preloadAdminRoute('citizenAttention')}
          onClick={closeMobile}
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
          onClick={closeMobile}
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
          onClick={closeMobile}
          className={({ isActive }) => navClass({ isActive: isActive || settingsActive })}
        >
          Configuración
        </NavLink>
      </>
    )
  }

  function renderSidebarBody(navElementId, { showDesktopCollapse }) {
    return (
      <>
        <div className="flex items-center gap-3 border-b border-slate-200/80 px-4 py-4">
          <NavLink
            to="/admin/dashboard"
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl outline-none ring-sky-500/30 focus-visible:ring-4"
            end
            onClick={closeMobile}
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
              <p className="truncate text-sm font-bold tracking-tight text-slate-900">
                {APP_NAME}
              </p>
            </div>
          </NavLink>
          {showDesktopCollapse ? (
            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Ocultar menú"
              title="Ocultar menú"
              onClick={() => persistSidebarOpen(false)}
            >
              <ChevronIcon collapsed={false} />
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Cerrar menú"
              onClick={closeMobile}
            >
              <MenuIcon open />
            </button>
          )}
        </div>

        <nav
          id={navElementId}
          className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
          aria-label="Administración"
        >
          {renderNavItems()}
        </nav>

        <div className="mt-auto space-y-3 border-t border-slate-200/80 px-4 py-4">
          <a
            href={ROUTES.home}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-xl border border-sky-200/90 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-100/90 sm:text-sm"
          >
            Portal público
            <span className="ml-1.5 text-[10px] font-bold opacity-70" aria-hidden>
              ↗
            </span>
          </a>
          <div className="rounded-xl bg-slate-100 px-3 py-2">
            <p className="truncate text-xs font-medium text-slate-700 sm:text-sm">{sessionLabel}</p>
          </div>
          <Button type="button" variant="secondary" className="w-full" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </>
    )
  }

  return (
    <div className="flex min-h-dvh bg-slate-50">
      <ScrollToTop />

      {/*
        Sidebar desktop fija (no sticky): overflow-x:clip en html/body rompe position:sticky.
        Un spacer mantiene el ancho del flujo; el aside real va fixed a la ventana.
      */}
      <div
        className={`hidden shrink-0 transition-[width] duration-300 ease-out lg:block ${
          sidebarOpen ? 'w-[17.5rem]' : 'w-0'
        }`}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden h-dvh max-h-dvh flex-col overflow-hidden border-slate-200/90 bg-white shadow-sm transition-[width,transform] duration-300 ease-out lg:flex ${
          sidebarOpen
            ? 'w-[17.5rem] translate-x-0 border-r'
            : 'w-[17.5rem] -translate-x-full border-0 pointer-events-none'
        }`}
        aria-hidden={!sidebarOpen}
      >
        <div className="flex h-full w-[17.5rem] flex-col">
          {renderSidebarBody(desktopNavId, { showDesktopCollapse: true })}
        </div>
      </aside>

      {/* Overlay + drawer móvil */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          aria-label="Cerrar menú"
          tabIndex={mobileOpen ? 0 : -1}
          onClick={closeMobile}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex h-dvh w-[min(100%,17.5rem)] flex-col border-r border-slate-200/90 bg-white shadow-xl transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {renderSidebarBody(mobileNavId, { showDesktopCollapse: false })}
        </aside>
      </div>

      {/* Contenido: arriba libre (sin barra superior fija) */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Toggle móvil */}
        <button
          type="button"
          className="fixed left-3 top-3 z-30 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 lg:hidden"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
          aria-controls={mobileNavId}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <MenuIcon open={mobileOpen} />
        </button>

        {/* Reabrir sidebar en desktop cuando está oculta */}
        {!sidebarOpen ? (
          <button
            type="button"
            className="fixed left-4 top-4 z-30 hidden h-10 items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 text-sm font-semibold text-slate-700 shadow-md transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 lg:inline-flex"
            aria-label="Mostrar menú"
            aria-expanded={false}
            aria-controls={desktopNavId}
            onClick={() => persistSidebarOpen(true)}
          >
            <MenuIcon open={false} />
            <span>Menú</span>
            <ChevronIcon collapsed />
          </button>
        ) : null}

        <main
          className={`flex-1 pb-6 sm:pb-8 lg:pb-10 ${
            sidebarOpen ? 'pt-16 lg:pt-8' : 'pt-16'
          }`}
        >
          <Container>
            <PageTransitionOutlet scope="admin" />
          </Container>
        </main>

        <footer className="border-t border-slate-200/80 bg-white py-3">
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
    </div>
  )
}

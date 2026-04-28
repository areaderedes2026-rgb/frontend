import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router-dom'
import { Container } from '../ui/Container.jsx'
import { useAreas } from '../../hooks/useAreas.js'
import { preloadPublicRoute } from '../../routes/publicRoutePreload.js'

const startLinks = [
  { to: '/', label: 'Inicio', end: true },
]

const newsLink = { to: '/news', label: 'Noticias' }

const afterAreasLinks = [
  { to: '/services', label: 'Servicios' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/history', label: 'Historia' },
  {
    to: '/atencion-ciudadano',
    label: 'Atención',
    ariaLabel: 'Atención al ciudadano',
  },
]

/** Ítems del menú Áreas en escritorio: "Ver todas" + cada área. Scroll solo si supera este número. */
const DESKTOP_AREAS_MENU_SCROLL_THRESHOLD = 10

function DesktopNavLink({
  to,
  label,
  ariaLabel,
  end,
  onClick,
  onMouseEnter,
  onFocus,
  compact,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      aria-label={ariaLabel}
      className="inline-flex rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161a21]"
    >
      {({ isActive }) => (
        <span
          className={`group relative inline-flex items-center rounded-lg px-3 font-semibold tracking-wide text-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            compact ? 'py-1.5 text-[0.8125rem]' : 'py-2 text-sm'
          }`}
        >
          <span className="relative z-10">{label}</span>
          <span
            className={`absolute left-3 right-3 h-[2px] origin-center rounded-full bg-sky-200 transition-transform duration-300 ease-out ${
              compact ? 'bottom-0.5' : 'bottom-1'
            } ${
              isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}
          />
        </span>
      )}
    </NavLink>
  )
}

function mobileLinkClass({ isActive }) {
  return `relative block shrink-0 rounded-xl px-4 py-3.5 text-base font-semibold tracking-wide transition-colors duration-300 ${
    isActive
      ? 'bg-white/10 text-white'
      : 'text-white/90 hover:bg-white/5 hover:text-white'
  }`
}

function mobileSubLinkClass({ isActive }) {
  return `flex min-h-11 shrink-0 items-center rounded-lg px-3 py-2.5 text-sm font-medium tracking-wide text-white transition-colors duration-200 ${
    isActive
      ? 'bg-white/10 text-white'
      : 'text-white/88 hover:bg-white/5 hover:text-white'
  }`
}

export function Navbar() {
  const { areas } = useAreas()
  const [open, setOpen] = useState(false)
  const [areasOpen, setAreasOpen] = useState(false)
  const [mobileAreasOpen, setMobileAreasOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef(null)
  const dropdownRef = useRef(null)
  const location = useLocation()
  const areasActive = location.pathname.startsWith('/areas')
  const desktopAreasMenuItemCount = 1 + areas.length
  const desktopAreasMenuNeedsScroll =
    desktopAreasMenuItemCount > DESKTOP_AREAS_MENU_SCROLL_THRESHOLD

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') {
        setOpen(false)
        setMobileAreasOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /** Altura real de la barra fija → `--navbar-h` para el padding del `<main>` (sin solapar contenido). */
  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return
    const sync = () => {
      const currentRaw = getComputedStyle(document.documentElement)
        .getPropertyValue('--navbar-h')
        .trim()
      const current = Number.parseFloat(currentRaw) || 0
      const next = Math.max(current, el.offsetHeight)
      document.documentElement.style.setProperty(
        '--navbar-h',
        `${next}px`,
      )
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    window.addEventListener('resize', sync)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', sync)
      document.documentElement.style.removeProperty('--navbar-h')
    }
  }, [])

  useEffect(() => {
    if (!areasOpen) return
    function handlePointerDown(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAreasOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [areasOpen])

  useEffect(() => {
    if (!areasOpen) return
    function handleKey(e) {
      if (e.key === 'Escape') setAreasOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [areasOpen])

  const mobileMenuLayer =
    typeof document !== 'undefined' &&
    createPortal(
      <>
        <div
          className={`fixed inset-0 z-40 bg-[#090b10]/80 backdrop-blur-[2px] transition-opacity duration-300 ease-out md:hidden ${
            open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-hidden={!open}
          onClick={() => setOpen(false)}
        />
        <div
          id="menu-movil"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          aria-hidden={!open}
          className={`fixed inset-y-0 right-0 z-50 flex h-dvh max-h-dvh min-h-0 w-[min(100vw-2rem,20rem)] flex-col overflow-hidden border-l border-white/8 bg-[#1a1d24] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.65)] transition-transform duration-300 ease-out md:hidden ${
            open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
          }`}
        >
          <div className="flex shrink-0 items-center justify-end border-b border-white/8 bg-[#14171d] px-5 py-4 pt-[max(1rem,env(safe-area-inset-top,0px))]">
            <button
              type="button"
              className="rounded-lg p-2 text-white/85 transition-all duration-300 hover:bg-white/10 hover:text-white"
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav
            className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-y-contain bg-[#1a1d24] px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] [-webkit-overflow-scrolling:touch]"
            aria-label="Principal móvil"
          >
            {startLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={mobileLinkClass}
                end={link.end}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            <div className="shrink-0 border-t border-white/6 pt-2">
              <NavLink
                to={newsLink.to}
                className={mobileLinkClass}
                end={newsLink.end}
                onClick={() => {
                  setOpen(false)
                  setMobileAreasOpen(false)
                }}
              >
                {newsLink.label}
              </NavLink>
            </div>

            <div className="shrink-0 border-t border-white/6 pt-3">
              <button
                type="button"
                className={`flex min-h-12 w-full shrink-0 items-center justify-between rounded-xl px-4 py-3 text-left text-base font-semibold tracking-wide text-white transition-colors duration-300 hover:bg-white/5 active:bg-white/10 ${
                  areasActive || mobileAreasOpen ? 'bg-white/6' : 'text-white/90'
                }`}
                aria-expanded={mobileAreasOpen}
                onClick={() => setMobileAreasOpen((v) => !v)}
              >
                Áreas
                <svg
                  className={`h-5 w-5 shrink-0 transition-transform duration-300 ease-out ${
                    mobileAreasOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  mobileAreasOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="mt-3 space-y-1.5 border-l border-white/10 pl-3.5">
                    <li className="shrink-0">
                      <NavLink
                        to="/areas"
                        className={mobileSubLinkClass}
                        end
                        onClick={() => {
                          setOpen(false)
                          setMobileAreasOpen(false)
                        }}
                      >
                        Ver todas
                      </NavLink>
                    </li>
                    {areas.map((area) => (
                      <li key={area.slug} className="shrink-0">
                        <NavLink
                          to={`/areas/${area.slug}`}
                          className={mobileSubLinkClass}
                          onClick={() => {
                            setOpen(false)
                            setMobileAreasOpen(false)
                          }}
                        >
                          {area.title}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-white/6 pt-2">
              {afterAreasLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={mobileLinkClass}
                  end={link.end}
                  aria-label={link.ariaLabel}
                  onClick={() => setOpen(false)}
                >
                  {link.ariaLabel ?? link.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </>,
      document.body,
    )

  return (
    <>
    <header
      ref={headerRef}
      className={`fixed left-0 right-0 top-0 z-50 m-0 w-full font-sans transition-[padding,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        scrolled
          ? 'bg-transparent py-2 pt-3'
          : 'border-b border-white/6 bg-[#171b22]/96 py-3.5 shadow-none backdrop-blur-md md:bg-[#171b22]/94'
      }`}
    >
      <Container className="relative z-2">
        <div
          className={`mx-auto flex w-full items-center justify-between gap-3 border transition-[min-height,border-color,background-color,box-shadow,backdrop-filter,border-radius,max-width,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            scrolled
              ? 'min-h-12.5 max-w-[min(100%,74rem)] rounded-full border-white/14 bg-[#141922]/78 px-3 shadow-[0_14px_44px_-20px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl backdrop-saturate-150 sm:px-4 md:px-5'
              : 'min-h-13 max-w-full rounded-none border-transparent bg-transparent px-0 shadow-none backdrop-blur-0 sm:px-0 md:px-0'
          }`}
        >
        <NavLink
          to="/"
          className="group inline-flex shrink-0 items-center outline-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02] active:scale-[0.98]"
          end
        >
          <img
            src="/favicon.png?v=2"
            alt="Escudo Municipalidad de Trancas"
            className={`rounded-full border border-white/25 object-cover transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              scrolled ? 'h-8 w-8 sm:h-9 sm:w-9' : 'h-9 w-9 sm:h-10 sm:w-10'
            }`}
            loading="eager"
            decoding="async"
          />
        </NavLink>

        <nav
          className="hidden items-center gap-0.5 md:flex"
          aria-label="Principal"
        >
          {startLinks.map((link) => (
            <DesktopNavLink
              key={link.to}
              to={link.to}
              label={link.label}
              end={link.end}
              compact={scrolled}
            />
          ))}

          <DesktopNavLink
            to={newsLink.to}
            label={newsLink.label}
            end={newsLink.end}
            onMouseEnter={() => preloadPublicRoute('newsList')}
            onFocus={() => preloadPublicRoute('newsList')}
            compact={scrolled}
          />

          <div className="relative px-0.5" ref={dropdownRef}>
            <button
              type="button"
              className={`group relative inline-flex items-center gap-1.5 rounded-lg px-3 font-semibold tracking-wide text-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                scrolled ? 'py-1.5 text-[0.8125rem]' : 'py-2 text-sm'
              }`}
              aria-expanded={areasOpen}
              aria-haspopup="true"
              aria-controls="menu-areas-escritorio"
              id="boton-menu-areas"
              onClick={() => setAreasOpen((v) => !v)}
            >
              <span className="relative">Áreas</span>
              <svg
                className={`relative h-4 w-4 transition-transform duration-300 ease-out ${
                  areasOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
              <span
                className={`absolute left-3 right-3 h-[2px] origin-center rounded-full bg-sky-200 transition-transform duration-300 ease-out ${
                  scrolled ? 'bottom-0.5' : 'bottom-1'
                } ${
                  areasActive || areasOpen ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </button>

            <div
              id="menu-areas-escritorio"
              role="menu"
              aria-labelledby="boton-menu-areas"
              className={`absolute left-0 top-full z-50 mt-1.5 w-[min(15rem,calc(100vw-1.25rem))] origin-top overflow-hidden rounded-lg border border-white/8 bg-[#1a1d24]/98 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 ease-out ${
                areasOpen
                  ? 'pointer-events-auto translate-y-0 opacity-100'
                  : 'pointer-events-none -translate-y-1 opacity-0'
              }`}
            >
              <ul
                className={`py-1 ${
                  desktopAreasMenuNeedsScroll
                    ? 'max-h-[min(22rem,55dvh)] overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]'
                    : ''
                }`}
              >
                <li>
                  <NavLink
                    to="/areas"
                    role="menuitem"
                    className={({ isActive }) =>
                      `block px-3 py-1.5 text-sm font-semibold tracking-wide transition-colors duration-200 ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-white/90 hover:bg-white/5 hover:text-white'
                      }`
                    }
                    end
                    onMouseEnter={() => preloadPublicRoute('areasIndex')}
                    onFocus={() => preloadPublicRoute('areasIndex')}
                    onClick={() => setAreasOpen(false)}
                  >
                    Ver todas
                  </NavLink>
                </li>
                <li
                  className="mx-2 my-0.5 h-px bg-white/8"
                  aria-hidden
                />
                {areas.map((area) => (
                  <li key={area.slug}>
                    <NavLink
                      to={`/areas/${area.slug}`}
                      role="menuitem"
                      className={({ isActive }) =>
                        `block px-3 py-1.5 text-sm font-semibold tracking-wide transition-colors duration-200 ${
                          isActive
                            ? 'bg-white/10 text-white'
                            : 'text-white/90 hover:bg-white/5 hover:text-white'
                        }`
                      }
                      onMouseEnter={() => preloadPublicRoute('areaDetail')}
                      onFocus={() => preloadPublicRoute('areaDetail')}
                      onClick={() => setAreasOpen(false)}
                    >
                      {area.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {afterAreasLinks.map((link) => (
            <DesktopNavLink
              key={link.to}
              to={link.to}
              label={link.label}
              ariaLabel={link.ariaLabel}
              end={link.end}
              onMouseEnter={() => {
                if (link.to === '/history') preloadPublicRoute('history')
                if (link.to === '/eventos') preloadPublicRoute('events')
              }}
              onFocus={() => {
                if (link.to === '/history') preloadPublicRoute('history')
                if (link.to === '/eventos') preloadPublicRoute('events')
              }}
              compact={scrolled}
            />
          ))}
        </nav>

        <button
          type="button"
          className={`group inline-flex items-center justify-center rounded-xl border-0 bg-transparent text-white transition-[transform,background-color] duration-300 ease-out hover:scale-[1.06] hover:bg-white/[0.07] active:scale-[0.94] active:bg-white/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161a21] md:hidden ${
            scrolled ? 'h-10 w-10' : 'h-11 w-11'
          }`}
          aria-expanded={open}
          aria-controls="menu-movil"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? 'Cerrar' : 'Menú'}</span>
          {open ? (
            <svg
              className="h-6 w-6 rotate-90 transition-transform duration-300 ease-out group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 transition-transform duration-300 ease-out group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </div>
      </Container>
    </header>
    {mobileMenuLayer}
    </>
  )
}

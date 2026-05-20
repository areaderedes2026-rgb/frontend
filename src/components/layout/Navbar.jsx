import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Container } from '../ui/Container.jsx'
import { preloadPublicRoute } from '../../routes/publicRoutePreload.js'
import { useSiteSearch } from '../../hooks/useSiteSearch.js'
import { SearchOpenButton, SiteSearchPanel } from './SiteSearchPanel.jsx'

const startLinks = [
  { to: '/', label: 'Inicio', end: true },
]

const newsLink = { to: '/news', label: 'Noticias' }

const areasLink = { to: '/areas', label: 'Áreas', preload: 'areasIndex', end: true }

const servicesLink = { to: '/services', label: 'Servicios' }

const ourCityLinks = [
  { to: '/eventos', label: 'Eventos', preload: 'events' },
  {
    to: '/gobierno/oferta-academica',
    label: 'Oferta académica',
    preload: 'governmentOfertaAcademica',
    end: true,
  },
  { to: '/history', label: 'Historia', preload: 'history' },
]

const attentionLink = {
  to: '/atencion-ciudadano',
  label: 'Atención',
  ariaLabel: 'Atención al ciudadano',
}

const governmentLinks = [
  { to: '/gobierno/intendencia', label: 'Intendencia', preload: 'governmentIntendencia', end: true },
  {
    to: '/gobierno/concejo-deliberante',
    label: 'Concejo Deliberante',
    preload: 'governmentConcejoDeliberante',
    end: true,
  },
  {
    to: '/gobierno/legislador-este',
    label: 'Legislador por el Este',
    preload: 'governmentLegisladorEste',
    end: true,
  },
]

function isDropdownLinkActive(pathname, links) {
  return links.some((item) =>
    item.end
      ? pathname === item.to
      : pathname === item.to || pathname.startsWith(`${item.to}/`),
  )
}

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
  const [open, setOpen] = useState(false)
  const [governmentOpen, setGovernmentOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [mobileGovernmentOpen, setMobileGovernmentOpen] = useState(false)
  const [mobileCityOpen, setMobileCityOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const headerRef = useRef(null)
  const governmentDropdownRef = useRef(null)
  const cityDropdownRef = useRef(null)
  const desktopSearchRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    items: searchItems,
    loading: searchLoading,
    reset: resetSearch,
  } = useSiteSearch()
  const governmentActive = isDropdownLinkActive(location.pathname, governmentLinks)
  const cityActive = isDropdownLinkActive(location.pathname, ourCityLinks)

  const closeDesktopDropdowns = useCallback(() => {
    setGovernmentOpen(false)
    setCityOpen(false)
  }, [])

  const forceCloseSearch = useCallback(() => {
    setDesktopSearchOpen(false)
    setMobileSearchOpen(false)
    resetSearch()
  }, [resetSearch])

  const closeAllSearch = useCallback(() => {
    forceCloseSearch()
  }, [forceCloseSearch])

  const openSearchPalette = useCallback(() => {
    closeDesktopDropdowns()
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
      setDesktopSearchOpen(true)
    } else {
      setOpen(false)
      setMobileGovernmentOpen(false)
      setMobileCityOpen(false)
      setMobileSearchOpen(true)
    }
  }, [closeDesktopDropdowns])

  const handleSelectSearchResult = useCallback(
    (item) => {
      navigate(item.path)
      closeAllSearch()
    },
    [navigate, closeAllSearch],
  )

  useEffect(() => {
    document.body.style.overflow = open || mobileSearchOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, mobileSearchOpen])

  useEffect(() => {
    const id = window.setTimeout(() => {
      forceCloseSearch()
    }, 0)
    return () => window.clearTimeout(id)
  }, [location.pathname, forceCloseSearch])

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        openSearchPalette()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openSearchPalette])

  useEffect(() => {
    if (!desktopSearchOpen) return
    function handlePointerDown(e) {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) {
        closeAllSearch()
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [desktopSearchOpen, closeAllSearch])

  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return
      if (desktopSearchOpen || mobileSearchOpen) {
        e.preventDefault()
        closeAllSearch()
        return
      }
      if (!open) return
      setOpen(false)
      setMobileGovernmentOpen(false)
      setMobileCityOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, desktopSearchOpen, mobileSearchOpen, closeAllSearch])

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
      // Reflejamos siempre el alto real del header. Evitamos `Math.max` con un
      // valor previo: en mobile la transición scrolled/no-scrolled cambia el
      // alto, y mantener el máximo histórico generaba un padding-top excesivo
      // en `<main>` (espacio en blanco al ingresar a una sección hasta hacer
      // refresh).
      document.documentElement.style.setProperty(
        '--navbar-h',
        `${el.offsetHeight}px`,
      )
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
      document.documentElement.style.removeProperty('--navbar-h')
    }
  }, [])

  useEffect(() => {
    if (!governmentOpen) return
    function handlePointerDown(e) {
      if (governmentDropdownRef.current && !governmentDropdownRef.current.contains(e.target)) {
        setGovernmentOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [governmentOpen])

  useEffect(() => {
    if (!cityOpen) return
    function handlePointerDown(e) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setCityOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [cityOpen])

  useEffect(() => {
    if (!governmentOpen) return
    function handleKey(e) {
      if (e.key === 'Escape') setGovernmentOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [governmentOpen])

  useEffect(() => {
    if (!cityOpen) return
    function handleKey(e) {
      if (e.key === 'Escape') setCityOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [cityOpen])

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
                  setMobileGovernmentOpen(false)
                  setMobileCityOpen(false)
                }}
              >
                {newsLink.label}
              </NavLink>
            </div>

            <div className="shrink-0 border-t border-white/6 pt-3">
              <button
                type="button"
                className={`flex min-h-12 w-full shrink-0 items-center justify-between rounded-xl px-4 py-3 text-left text-base font-semibold tracking-wide text-white transition-colors duration-300 hover:bg-white/5 active:bg-white/10 ${
                  governmentActive || mobileGovernmentOpen ? 'bg-white/6' : 'text-white/90'
                }`}
                aria-expanded={mobileGovernmentOpen}
                onClick={() => setMobileGovernmentOpen((v) => !v)}
              >
                Gobierno
                <svg
                  className={`h-5 w-5 shrink-0 transition-transform duration-300 ease-out ${
                    mobileGovernmentOpen ? 'rotate-180' : ''
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
                  mobileGovernmentOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="mt-3 space-y-1.5 border-l border-white/10 pl-3.5">
                    {governmentLinks.map((item) => (
                      <li key={item.to} className="shrink-0">
                        <NavLink
                          to={item.to}
                          className={mobileSubLinkClass}
                          end={Boolean(item.end)}
                          onMouseEnter={() => preloadPublicRoute(item.preload)}
                          onFocus={() => preloadPublicRoute(item.preload)}
                          onClick={() => {
                            setOpen(false)
                            setMobileGovernmentOpen(false)
                          }}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-white/6 pt-2">
              <NavLink
                to={areasLink.to}
                className={mobileLinkClass}
                end={areasLink.end}
                onMouseEnter={() => preloadPublicRoute(areasLink.preload)}
                onFocus={() => preloadPublicRoute(areasLink.preload)}
                onClick={() => {
                  setOpen(false)
                  setMobileGovernmentOpen(false)
                  setMobileCityOpen(false)
                }}
              >
                {areasLink.label}
              </NavLink>
            </div>

            <div className="shrink-0 border-t border-white/6 pt-2">
              <NavLink
                to={servicesLink.to}
                className={mobileLinkClass}
                onClick={() => {
                  setOpen(false)
                  setMobileGovernmentOpen(false)
                  setMobileCityOpen(false)
                }}
              >
                {servicesLink.label}
              </NavLink>
            </div>

            <div className="shrink-0 border-t border-white/6 pt-3">
              <button
                type="button"
                className={`flex min-h-12 w-full shrink-0 items-center justify-between rounded-xl px-4 py-3 text-left text-base font-semibold tracking-wide text-white transition-colors duration-300 hover:bg-white/5 active:bg-white/10 ${
                  cityActive || mobileCityOpen ? 'bg-white/6' : 'text-white/90'
                }`}
                aria-expanded={mobileCityOpen}
                onClick={() => setMobileCityOpen((v) => !v)}
              >
                Nuestra Ciudad
                <svg
                  className={`h-5 w-5 shrink-0 transition-transform duration-300 ease-out ${
                    mobileCityOpen ? 'rotate-180' : ''
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
                  mobileCityOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="mt-3 space-y-1.5 border-l border-white/10 pl-3.5">
                    {ourCityLinks.map((item) => (
                      <li key={item.to} className="shrink-0">
                        <NavLink
                          to={item.to}
                          className={mobileSubLinkClass}
                          end={Boolean(item.end)}
                          onMouseEnter={() => preloadPublicRoute(item.preload)}
                          onFocus={() => preloadPublicRoute(item.preload)}
                          onClick={() => {
                            setOpen(false)
                            setMobileCityOpen(false)
                            setMobileGovernmentOpen(false)
                          }}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-white/6 pt-2">
              <NavLink
                to={attentionLink.to}
                className={mobileLinkClass}
                aria-label={attentionLink.ariaLabel}
                onClick={() => setOpen(false)}
              >
                {attentionLink.ariaLabel ?? attentionLink.label}
              </NavLink>
            </div>
          </nav>
        </div>
      </>,
      document.body,
    )

  const mobileSearchLayer =
    typeof document !== 'undefined' &&
    mobileSearchOpen &&
    createPortal(
      <div
        className="fixed inset-0 z-[60] flex flex-col md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Buscar en el sitio"
      >
        <button
          type="button"
          className="absolute inset-0 bg-[#05060a]/78 backdrop-blur-[5px] motion-safe:[animation:site-search-backdrop-fade_0.65s_ease-out_both]"
          aria-label="Cerrar búsqueda"
          onClick={closeAllSearch}
        />
        <div className="relative z-10 mx-3 mt-[max(0.75rem,env(safe-area-inset-top,0px))] flex max-h-[min(92dvh,40rem)] min-h-0 flex-1 flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.11] bg-linear-to-b from-[#1c2029] to-[#14171d] shadow-[0_32px_88px_-32px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.05)] motion-safe:[animation:site-search-mobile-sheet_0.92s_cubic-bezier(0.16,1,0.3,1)_both]">
          <div className="site-search-scrollbar min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
            <SiteSearchPanel
              variant="mobile"
              query={searchQuery}
              setQuery={setSearchQuery}
              items={searchItems}
              loading={searchLoading}
              onSelect={handleSelectSearchResult}
              onClose={closeAllSearch}
              autoFocus
              compact={scrolled}
            />
          </div>
        </div>
      </div>,
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
          className={`mx-auto flex w-full items-center justify-between gap-3 border transition-[min-height,border-color,background-color,box-shadow,backdrop-filter,border-radius,max-width,padding] duration-[880ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-300 ${
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

        <div
          ref={desktopSearchRef}
          className="relative hidden min-h-0 min-w-0 flex-1 overflow-visible md:flex md:items-stretch md:justify-end"
        >
          {/* Enlaces: capa absoluta + solo opacidad/transform (sin max-width) para que el texto largo no se comprima */}
          <div
            className={`absolute inset-y-0 left-0 right-12 z-0 flex items-center justify-end gap-0.5 overflow-visible transition-[opacity,transform] motion-reduce:!duration-150 ${
              desktopSearchOpen
                ? 'pointer-events-none translate-x-2 opacity-0 duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
                : 'translate-x-0 opacity-100 duration-[240ms] ease-out'
            }`}
            aria-hidden={desktopSearchOpen || undefined}
          >
            <nav className="flex min-w-0 items-center justify-end gap-0.5" aria-label="Principal">
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

              <div className="relative px-0.5" ref={governmentDropdownRef}>
                <button
                  type="button"
                  className={`group relative inline-flex items-center gap-1.5 rounded-lg px-3 font-semibold tracking-wide text-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    scrolled ? 'py-1.5 text-[0.8125rem]' : 'py-2 text-sm'
                  }`}
                  aria-expanded={governmentOpen}
                  aria-haspopup="true"
                  aria-controls="menu-gobierno-escritorio"
                  id="boton-menu-gobierno"
                  onClick={() => {
                    setCityOpen(false)
                    setGovernmentOpen((v) => !v)
                  }}
                >
                  <span className="relative">Gobierno</span>
                  <svg
                    className={`relative h-4 w-4 transition-transform duration-300 ease-out ${
                      governmentOpen ? 'rotate-180' : ''
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
                  <span
                    className={`absolute left-3 right-3 h-[2px] origin-center rounded-full bg-sky-200 transition-transform duration-300 ease-out ${
                      scrolled ? 'bottom-0.5' : 'bottom-1'
                    } ${
                      governmentActive || governmentOpen ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </button>

                <div
                  id="menu-gobierno-escritorio"
                  role="menu"
                  aria-labelledby="boton-menu-gobierno"
                  className={`absolute left-0 top-full z-[60] mt-1.5 w-[min(17.5rem,calc(100vw-1.25rem))] origin-top overflow-hidden rounded-lg border border-white/8 bg-[#1a1d24]/98 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 ease-out ${
                    governmentOpen
                      ? 'pointer-events-auto translate-y-0 opacity-100'
                      : 'pointer-events-none -translate-y-1 opacity-0'
                  }`}
                >
                  <ul className="py-1">
                    {governmentLinks.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          role="menuitem"
                          className={({ isActive }) =>
                            `block px-3 py-1.5 text-sm font-semibold tracking-wide transition-colors duration-200 ${
                              isActive
                                ? 'bg-white/10 text-white'
                                : 'text-white/90 hover:bg-white/5 hover:text-white'
                            }`
                          }
                          end={Boolean(item.end)}
                          onMouseEnter={() => preloadPublicRoute(item.preload)}
                          onFocus={() => preloadPublicRoute(item.preload)}
                          onClick={() => setGovernmentOpen(false)}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <DesktopNavLink
                to={areasLink.to}
                label={areasLink.label}
                end={areasLink.end}
                onMouseEnter={() => preloadPublicRoute(areasLink.preload)}
                onFocus={() => preloadPublicRoute(areasLink.preload)}
                compact={scrolled}
              />

              <DesktopNavLink
                to={servicesLink.to}
                label={servicesLink.label}
                compact={scrolled}
              />

              <div className="relative px-0.5" ref={cityDropdownRef}>
                <button
                  type="button"
                  className={`group relative inline-flex items-center gap-1.5 rounded-lg px-3 font-semibold tracking-wide text-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    scrolled ? 'py-1.5 text-[0.8125rem]' : 'py-2 text-sm'
                  }`}
                  aria-expanded={cityOpen}
                  aria-haspopup="true"
                  aria-controls="menu-nuestra-ciudad-escritorio"
                  id="boton-menu-nuestra-ciudad"
                  onClick={() => {
                    setGovernmentOpen(false)
                    setCityOpen((v) => !v)
                  }}
                >
                  <span className="relative">Nuestra Ciudad</span>
                  <svg
                    className={`relative h-4 w-4 transition-transform duration-300 ease-out ${
                      cityOpen ? 'rotate-180' : ''
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
                  <span
                    className={`absolute left-3 right-3 h-[2px] origin-center rounded-full bg-sky-200 transition-transform duration-300 ease-out ${
                      scrolled ? 'bottom-0.5' : 'bottom-1'
                    } ${
                      cityActive || cityOpen ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </button>

                <div
                  id="menu-nuestra-ciudad-escritorio"
                  role="menu"
                  aria-labelledby="boton-menu-nuestra-ciudad"
                  className={`absolute left-0 top-full z-[60] mt-1.5 w-[min(16rem,calc(100vw-1.25rem))] origin-top overflow-hidden rounded-lg border border-white/8 bg-[#1a1d24]/98 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 ease-out ${
                    cityOpen
                      ? 'pointer-events-auto translate-y-0 opacity-100'
                      : 'pointer-events-none -translate-y-1 opacity-0'
                  }`}
                >
                  <ul className="py-1">
                    {ourCityLinks.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          role="menuitem"
                          className={({ isActive }) =>
                            `block px-3 py-1.5 text-sm font-semibold tracking-wide transition-colors duration-200 ${
                              isActive
                                ? 'bg-white/10 text-white'
                                : 'text-white/90 hover:bg-white/5 hover:text-white'
                            }`
                          }
                          end={Boolean(item.end)}
                          onMouseEnter={() => preloadPublicRoute(item.preload)}
                          onFocus={() => preloadPublicRoute(item.preload)}
                          onClick={() => setCityOpen(false)}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <DesktopNavLink
                to={attentionLink.to}
                label={attentionLink.label}
                ariaLabel={attentionLink.ariaLabel}
                compact={scrolled}
              />
            </nav>
          </div>

          {!desktopSearchOpen ? (
            <div className="relative z-10 ml-auto flex shrink-0 items-center">
              <SearchOpenButton
                scrolled={scrolled}
                onClick={() => {
                  closeDesktopDropdowns()
                  setDesktopSearchOpen(true)
                }}
              />
            </div>
          ) : (
            <div className="relative z-10 ml-auto flex min-w-0 shrink-0 items-center justify-end motion-safe:[animation:site-search-panel-in_0.48s_cubic-bezier(0.32,0.72,0,1)_both]">
              <div className="w-[min(24rem,calc(100vw-8.5rem))] max-w-full min-w-0 sm:w-[min(27rem,calc(100vw-9rem))]">
                <SiteSearchPanel
                  variant="desktop"
                  query={searchQuery}
                  setQuery={setSearchQuery}
                  items={searchItems}
                  loading={searchLoading}
                  onSelect={handleSelectSearchResult}
                  onClose={closeAllSearch}
                  autoFocus
                  compact={scrolled}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5 md:hidden">
          <SearchOpenButton
            className="md:hidden"
            scrolled={scrolled}
            onClick={() => {
              setOpen(false)
              setMobileGovernmentOpen(false)
              setMobileCityOpen(false)
              setMobileSearchOpen(true)
            }}
          />
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
      </div>
      </Container>
    </header>
    {mobileMenuLayer}
    {mobileSearchLayer}
    </>
  )
}

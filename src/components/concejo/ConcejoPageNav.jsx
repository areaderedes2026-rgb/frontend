import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../utils/constants.js'

function getScrollOffset() {
  const root = document.documentElement
  const navH = parseFloat(
    getComputedStyle(root).getPropertyValue('--navbar-h') || '5rem',
  )
  const subnavH = parseFloat(
    getComputedStyle(root).getPropertyValue('--concejo-subnav-h') || '3.25rem',
  )
  return (Number.isFinite(navH) ? navH : 80) + (Number.isFinite(subnavH) ? subnavH : 52) + 12
}

export function ConcejoPageNav({ title = 'Concejo Deliberante', sections = [] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')
  const navRef = useRef(null)
  const linkRefs = useRef({})

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - getScrollOffset()
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    setActiveId(id)
  }, [])

  useEffect(() => {
    const ids = sections.map((s) => s.id).filter(Boolean)
    if (!ids.length) return undefined

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((node) => node instanceof HTMLElement)

    if (!elements.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        root: null,
        rootMargin: '-18% 0px -62% 0px',
        threshold: [0, 0.12, 0.35],
      },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [sections])

  useEffect(() => {
    const link = linkRefs.current[activeId]
    const nav = navRef.current
    if (!link || !nav) return
    const linkLeft = link.offsetLeft
    const linkWidth = link.offsetWidth
    const navWidth = nav.clientWidth
    const scrollLeft = linkLeft - navWidth / 2 + linkWidth / 2
    nav.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' })
  }, [activeId])

  if (!sections.length) return null

  return (
    <header className="mb-6 sm:mb-8">
      <p className="text-sm">
        <Link
          to={ROUTES.home}
          className="inline-flex items-center gap-1 font-medium text-[#5c6169] transition hover:text-[#171b22]"
        >
          <span aria-hidden>←</span> Volver al inicio
        </Link>
      </p>

      <div className="mt-4 flex flex-col gap-4 sm:mt-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-800">
            Gobierno municipal
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl lg:text-[2.125rem]">
            {title}
          </h1>
        </div>
      </div>

      <div
        className="sticky z-30 mt-5 border-y border-[#e8e4dc] bg-[#f7f7f5]/92 backdrop-blur-md supports-[backdrop-filter]:bg-[#f7f7f5]/80"
        style={{
          top: 'var(--navbar-h, 5rem)',
          height: 'var(--concejo-subnav-h, 3.25rem)',
        }}
      >
        <nav
          ref={navRef}
          className="-mx-1 flex h-full items-center gap-1 overflow-x-auto px-1 scrollbar-none"
          aria-label="Secciones del Concejo Deliberante"
        >
          {sections.map((item) => {
            const isActive = activeId === item.id
            return (
              <a
                key={item.id}
                ref={(node) => {
                  if (node) linkRefs.current[item.id] = node
                }}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(item.id)
                }}
                className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                  isActive
                    ? 'bg-[#171b22] text-white shadow-sm'
                    : 'text-[#5c6169] hover:bg-white hover:text-[#171b22] hover:shadow-sm'
                }`}
                aria-current={isActive ? 'location' : undefined}
              >
                {item.label}
              </a>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

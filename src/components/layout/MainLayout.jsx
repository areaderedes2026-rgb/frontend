import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from './Navbar.jsx'
import { Footer } from './Footer.jsx'
import { FloatingSocialButtons } from './FloatingSocialButtons.jsx'
import { PageTransitionOutlet } from './PageTransitionOutlet.jsx'
import { ScrollToTop } from './ScrollToTop.jsx'
import { preloadCommonPublicRoutes } from '../../routes/publicRoutePreload.js'
import { SeoManager } from '../seo/SeoManager.jsx'

export function MainLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/' || pathname === ''

  useEffect(() => {
    const run = () => {
      preloadCommonPublicRoutes()
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(run, { timeout: 1800 })
      return () => window.cancelIdleCallback(id)
    }

    const timer = setTimeout(run, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <ScrollToTop />
      <SeoManager />
      <Navbar />
      <main
        id="contenido-principal"
        className={
          isHome
            ? 'min-w-0 flex-1 pb-12 pt-0 sm:pb-16'
            : 'min-w-0 flex-1 pb-12 pt-[calc(var(--navbar-h,5rem)+1.5rem)] sm:pb-16 sm:pt-[calc(var(--navbar-h,5rem)+2rem)]'
        }
      >
        <PageTransitionOutlet />
      </main>
      <FloatingSocialButtons />
      <Footer />
    </div>
  )
}

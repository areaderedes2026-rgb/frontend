import { useLocation } from 'react-router-dom'
import { Navbar } from './Navbar.jsx'
import { Footer } from './Footer.jsx'
import { FloatingSocialButtons } from './FloatingSocialButtons.jsx'
import { PageTransitionOutlet } from './PageTransitionOutlet.jsx'

export function MainLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/' || pathname === ''

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
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

import { Outlet } from 'react-router-dom'

/**
 * Render directo del `<Outlet />`.
 * Se mantiene como componente único para poder reintroducir transiciones luego,
 * pero priorizando estabilidad de navegación en producción.
 */
export function PageTransitionOutlet({ className = '' }) {
  return (
    <div className={`relative min-w-0 w-full ${className}`.trim()}>
      <Outlet />
    </div>
  )
}

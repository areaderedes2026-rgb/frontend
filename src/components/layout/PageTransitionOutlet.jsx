import { useReducedMotion, m as M } from 'motion/react'
import { Outlet, useLocation } from 'react-router-dom'

const easeOut = [0.22, 1, 0.36, 1]

const SETTINGS_ROUTE_PREFIX = '/admin/settings'

/**
 * En admin, las subrutas de Configuración comparten layout; una sola clave evita
 * re-animar todo el bloque al pasar de «Resumen» a «Categorías».
 */
function transitionPathKey(pathname, scope) {
  if (
    scope === 'admin' &&
    (pathname === SETTINGS_ROUTE_PREFIX || pathname.startsWith(`${SETTINGS_ROUTE_PREFIX}/`))
  ) {
    return SETTINGS_ROUTE_PREFIX
  }
  return pathname
}

/**
 * Salida animada del contenido de rutas (`<Outlet />`) al cambiar de URL.
 *
 * @param {'public'|'admin'} [props.scope] — `admin` agrupa la zona de configuración.
 */
export function PageTransitionOutlet({ className = '', scope = 'public' }) {
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const pathKey = transitionPathKey(location.pathname, scope)

  const duration = reduceMotion ? 0 : 0.26
  const transition = { duration, ease: easeOut }

  const variants = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -4 },
      }

  return (
    <div className={`relative min-w-0 w-full ${className}`.trim()}>
      <M.div
        key={pathKey}
        className="min-w-0 w-full"
        variants={variants}
        initial="initial"
        animate="animate"
        transition={transition}
      >
        <Outlet />
      </M.div>
    </div>
  )
}

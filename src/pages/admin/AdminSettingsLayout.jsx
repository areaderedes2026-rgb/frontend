import { NavLink, Outlet } from 'react-router-dom'
import { ROUTES } from '../../utils/constants.js'
import { useAuth } from '../../hooks/useAuth.js'

function subNavClass({ isActive }) {
  return `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-white text-sky-800 shadow-sm ring-1 ring-slate-200/80'
      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
  }`
}

export function AdminSettingsLayout() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <div className="mx-auto w-full max-w-5xl">
      <nav
        className="admin-fade-up mb-8 flex flex-wrap gap-1 border-b border-slate-200/90 pb-3"
        aria-label="Configuración"
      >
        <NavLink to={ROUTES.adminSettings} end className={subNavClass}>
          Resumen
        </NavLink>
        <NavLink to={ROUTES.adminSettingsCategories} className={subNavClass}>
          Categorías
        </NavLink>
        <NavLink to={ROUTES.adminSettingsHomeMap} className={subNavClass}>
          Mapa Inicio
        </NavLink>
        {isAdmin ? (
          <NavLink to={ROUTES.adminUsers} className={subNavClass}>
            Usuarios
          </NavLink>
        ) : null}
      </nav>
      <Outlet />
    </div>
  )
}

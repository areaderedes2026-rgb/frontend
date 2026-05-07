import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { preloadAdminRoute } from '../../routes/adminRoutePreload.js'
import { ROUTES } from '../../utils/constants.js'

export function AdminSettingsHome() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <AdminPageShell
      showBackLink={false}
      eyebrow="Administración"
      title="Configuración"
      subtitle="Gestioná módulos globales del sitio: categorías de noticias y usuarios del panel."
      maxWidthClass="max-w-5xl"
      variant="plain"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to={ROUTES.adminSettingsCategories}
          className="group admin-fade-up rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-md"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
            Noticias
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Categorías</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Creá, ordená y editá las categorías que aparecen en el portal y al publicar
            noticias.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-800 group-hover:text-sky-950">
            Abrir módulo <span aria-hidden>→</span>
          </span>
        </Link>
        <Link
          to={ROUTES.adminSettingsHomeMap}
          className="group admin-fade-up rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-md"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
            Inicio
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Mapa interactivo</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Definí centro, zoom y puntos clave del mapa de Trancas en la portada.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-800 group-hover:text-sky-950">
            Abrir módulo <span aria-hidden>→</span>
          </span>
        </Link>
        <Link
          to={ROUTES.adminSettingsIntendencia}
          className="group admin-fade-up rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-md"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
            Gobierno
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Intendencia</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Editá la ficha institucional del intendente: imagen, biografía, contacto y
            horario.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-800 group-hover:text-sky-950">
            Abrir módulo <span aria-hidden>→</span>
          </span>
        </Link>
        <Link
          to={ROUTES.adminSettingsLegisladorEste}
          onMouseEnter={() => preloadAdminRoute('settingsLegisladorEste')}
          onFocus={() => preloadAdminRoute('settingsLegisladorEste')}
          className="group admin-fade-up rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-md"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
            Gobierno
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            Legislador por el Este
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Editá la ficha institucional del legislador por el Este: imagen, biografía,
            contacto y horario.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-800 group-hover:text-sky-950">
            Abrir módulo <span aria-hidden>→</span>
          </span>
        </Link>
        <Link
          to={ROUTES.adminSettingsOfertaAcademica}
          onMouseEnter={() => preloadAdminRoute('settingsOfertaAcademica')}
          onFocus={() => preloadAdminRoute('settingsOfertaAcademica')}
          className="group admin-fade-up rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-md"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
            Gobierno
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Oferta académica</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Gestioná portada, textos, categorías, fichas de cursos y llamados a la acción de la
            página pública.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-800 group-hover:text-sky-950">
            Abrir módulo <span aria-hidden>→</span>
          </span>
        </Link>
        {isAdmin ? (
          <Link
            to={ROUTES.adminUsers}
            className="group admin-fade-up rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-md"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
              Acceso
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Usuarios</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Administrá altas, edición de roles y estado de las cuentas del panel.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-800 group-hover:text-sky-950">
              Abrir módulo <span aria-hidden>→</span>
            </span>
          </Link>
        ) : null}
      </div>
    </AdminPageShell>
  )
}

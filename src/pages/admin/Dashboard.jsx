import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { useNewsList } from '../../hooks/useNewsList.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'

export function Dashboard() {
  const { items, loading, error } = useNewsList()

  return (
    <AdminPageShell
      showBackLink={false}
      eyebrow="Panel principal"
      title="Inicio"
      subtitle="Resumen del panel. Las noticias se gestionan desde la sección Noticias."
      maxWidthClass="max-w-5xl"
      variant="plain"
    >
      {loading ? (
        <div className="admin-fade-up grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
            >
              <div className="h-3 w-20 rounded bg-slate-100" />
              <div className="mt-4 h-8 w-16 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div
          className="admin-fade-up rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 shadow-sm"
          role="alert"
        >
          {error}
        </div>
      ) : (
        <>
          <div className="admin-fade-up grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Noticias publicadas
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
                {items.length}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Total en el sistema. Gestioná el listado en Noticias.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Conexión
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {isApiConfigured() ? 'API activa' : 'Conexión no disponible'}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {isApiConfigured()
                  ? 'Creá, editá y eliminá noticias en el backend.'
                  : 'No se pudo conectar con el backend en este entorno.'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-linear-to-br from-sky-50/80 to-white p-5 shadow-sm ring-1 ring-sky-100/80 sm:p-6 lg:col-span-1">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-sky-800">
                Noticias
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Gestionar contenido</p>
              <p className="mt-2 text-sm text-slate-600">
                Tabla, altas, edición y bajas de noticias del portal.
              </p>
              <Link
                to={ROUTES.adminNews}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-800 transition hover:text-sky-950"
              >
                Ir a noticias <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          <div className="admin-fade-up-delayed mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to={ROUTES.adminNews}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-md sm:p-6"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                Contenido
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Noticias</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Listado completo, nueva noticia y edición.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 group-hover:text-sky-900">
                Abrir sección <span aria-hidden>→</span>
              </span>
            </Link>
            <a
              href={ROUTES.news}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Vista previa
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Noticias públicas</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Abrí la sección de noticias en una pestaña nueva.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-800 group-hover:text-sky-800">
                Abrir en pestaña nueva <span aria-hidden>↗</span>
              </span>
            </a>
            <Link
              to={ROUTES.adminCitizenAttention}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-md sm:p-6"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                Gestión ciudadana
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Atención (contenido público)</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Hero, canales, preguntas frecuentes y formulario web en el portal.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 group-hover:text-sky-900">
                Abrir sección <span aria-hidden>→</span>
              </span>
            </Link>
            <Link
              to={ROUTES.adminCitizenInquiries}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-md sm:p-6"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                Gestión ciudadana
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Consultas ciudadanas</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Bandeja de mensajes enviados desde la web y seguimiento por estado.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 group-hover:text-sky-900">
                Abrir sección <span aria-hidden>→</span>
              </span>
            </Link>
          </div>
        </>
      )}
    </AdminPageShell>
  )
}

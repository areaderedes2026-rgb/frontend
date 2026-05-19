import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { fetchMyAreaServicePermissions } from '../../services/areaProfilesService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'

export function AdminMyAreaServices() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isApiConfigured()) {
      return
    }
    let cancelled = false
    fetchMyAreaServicePermissions()
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'No se pudieron cargar tus servicios.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AdminPageShell
      eyebrow="Acceso limitado"
      title="Mis servicios asignados"
      subtitle="Desde acá podés editar únicamente los servicios que te asignó un administrador."
      showBackLink={false}
      maxWidthClass="max-w-4xl"
      variant="plain"
    >
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Cargando servicios...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          {error}
        </div>
      ) : items.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <article
              key={`${item.area?.slug}:${item.service?.id}`}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
                {item.area?.title || 'Área'}
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {item.service?.title || 'Servicio asignado'}
              </h2>
              {item.service?.description ? (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                  {item.service.description}
                </p>
              ) : null}
              <Link
                to={`/admin/area-services/${item.area?.slug}/${item.service?.id}`}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-500/20"
              >
                Editar servicio
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          No tenés servicios asignados. Pedile a un administrador que revise tus permisos.
        </div>
      )}
    </AdminPageShell>
  )
}

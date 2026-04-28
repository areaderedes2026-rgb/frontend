import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { useNewsList } from '../../hooks/useNewsList.js'
import { deleteNews } from '../../services/newsService.js'
import { formatDate } from '../../utils/formatDate.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'
import { inputClass, labelClass } from '../../components/ui/formStyles.js'

const PAGE_SIZE = 20

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function startOfDayMs(isoDateStr) {
  if (!isoDateStr || !String(isoDateStr).trim()) return null
  const d = new Date(`${isoDateStr.trim()}T00:00:00`)
  const t = d.getTime()
  return Number.isNaN(t) ? null : t
}

function endOfDayMs(isoDateStr) {
  if (!isoDateStr || !String(isoDateStr).trim()) return null
  const d = new Date(`${isoDateStr.trim()}T23:59:59.999`)
  const t = d.getTime()
  return Number.isNaN(t) ? null : t
}

/** Miniatura de portada: solo imagen si existe; celda vacía minimalista si no. */
function AdminNewsRowThumb({ imageUrl }) {
  const resolved = imageUrl ? resolveMediaUrl(imageUrl) : ''
  const src = resolved && resolved.trim() ? resolved : null
  if (!src) {
    return (
      <div
        className="h-11 w-11 shrink-0 rounded-lg bg-slate-50 ring-1 ring-inset ring-slate-200/80"
        aria-hidden
      />
    )
  }
  return (
    <img
      src={src}
      alt=""
      className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-inset ring-slate-200/80"
      loading="lazy"
      decoding="async"
    />
  )
}

function paginationModel(page, totalPages) {
  if (totalPages <= 1) return { items: [{ type: 'page', n: 1 }], totalPages: 1 }
  if (totalPages <= 7) {
    return {
      totalPages,
      items: Array.from({ length: totalPages }, (_, i) => ({ type: 'page', n: i + 1 })),
    }
  }
  const set = new Set([1, totalPages, page, page - 1, page + 1].filter((n) => n >= 1 && n <= totalPages))
  const sorted = [...set].sort((a, b) => a - b)
  const out = []
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push({ type: 'gap' })
    out.push({ type: 'page', n: sorted[i] })
  }
  return { items: out, totalPages }
}

export function AdminNews() {
  const { items, loading, error, refetch } = useNewsList()
  const location = useLocation()
  const navigate = useNavigate()
  const [flash, setFlash] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const msg = location.state?.flash
    if (typeof msg === 'string' && msg.trim()) {
      setFlash(msg.trim())
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state?.flash, navigate])

  useEffect(() => {
    setPage(1)
  }, [search, categoryFilter, dateFrom, dateTo])

  const categoryOptions = useMemo(() => {
    const set = new Set(items.map((n) => n.category || 'General'))
    return ['Todas', ...[...set].sort((a, b) => a.localeCompare(b))]
  }, [items])

  useEffect(() => {
    if (!categoryOptions.includes(categoryFilter)) {
      setCategoryFilter('Todas')
    }
  }, [categoryOptions, categoryFilter])

  const filtered = useMemo(() => {
    let list = [...items]
    const q = normalize(search.trim())
    if (q) {
      list = list.filter((n) =>
        normalize(`${n.title} ${n.summary || ''} ${n.body || ''}`).includes(q),
      )
    }
    if (categoryFilter !== 'Todas') {
      list = list.filter((n) => (n.category || 'General') === categoryFilter)
    }
    const fromMs = startOfDayMs(dateFrom)
    const toMs = endOfDayMs(dateTo)
    list = list.filter((n) => {
      const t = new Date(n.publishedAt).getTime()
      if (Number.isNaN(t)) return false
      if (fromMs != null && t < fromMs) return false
      if (toMs != null && t > toMs) return false
      return true
    })
    list.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    return list
  }, [items, search, categoryFilter, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages))
  }, [totalPages])

  const safePage = Math.min(Math.max(1, page), totalPages)
  const rangeStart = (safePage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(rangeStart, rangeStart + PAGE_SIZE)
  const rangeEnd = filtered.length === 0 ? 0 : Math.min(rangeStart + pageItems.length, filtered.length)
  const pagModel = paginationModel(safePage, totalPages)

  const filtersActive =
    search.trim() !== '' ||
    categoryFilter !== 'Todas' ||
    dateFrom.trim() !== '' ||
    dateTo.trim() !== ''

  function clearFilters() {
    setSearch('')
    setCategoryFilter('Todas')
    setDateFrom('')
    setDateTo('')
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleteError('')
    setDeletingId(deleteTarget.id)
    try {
      await deleteNews(deleteTarget.id)
      await refetch()
      setDeleteTarget(null)
    } catch (e) {
      setDeleteError(e.message || 'No se pudo eliminar la noticia.')
    } finally {
      setDeletingId(null)
    }
  }

  const deleteLoading =
    deleteTarget != null && deletingId != null && deletingId === deleteTarget.id

  function socialCompact(n) {
    const s = n?.stats?.shares || {}
    const entries = [
      ['Fb', Number(s.facebook || 0)],
      ['Wa', Number(s.whatsapp || 0)],
      ['Ig', Number(s.instagram || 0)],
      ['Native', Number(s.native || 0)],
      ['Link', Number(s.copyLink || 0)],
    ].filter(([, v]) => v > 0)
    if (!entries.length) return 'Sin compartidas'
    return entries.map(([k, v]) => `${k}:${v}`).join(' · ')
  }

  function actorText(user, fallback = 'Sistema') {
    if (!user) return fallback
    return user.fullName || user.username || fallback
  }

  return (
    <>
      <ConfirmDialog
        open={deleteTarget != null}
        onClose={() => {
          if (!deleteLoading) setDeleteTarget(null)
        }}
        title="¿Eliminar esta noticia?"
        description={
          deleteTarget ? (
            <>
              Vas a eliminar{' '}
              <span className="font-semibold text-slate-800">
                «{deleteTarget.title}»
              </span>
              . Se borrará la noticia en el servidor, las filas de galería en la base de
              datos y las imágenes alojadas en Cloudinary cuando correspondan. Esta acción
              no se puede deshacer.
            </>
          ) : null
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        variant="danger"
      />

      <AdminPageShell
        showBackLink={false}
        eyebrow="Contenido"
        title="Noticias"
        subtitle={
          isApiConfigured()
            ? 'Gestioná las noticias que ven los vecinos en el portal público. Los cambios se guardan en el servidor.'
            : 'No se detectó conexión con el backend para administrar noticias.'
        }
        maxWidthClass="max-w-6xl"
        variant="plain"
        actions={
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Link
              to={ROUTES.adminNewsStats}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 px-5 py-2.5 text-sm font-semibold text-violet-800 shadow-sm transition hover:border-violet-300 hover:bg-violet-100"
            >
              Estadísticas
            </Link>
            <Link
              to={ROUTES.adminNewsCreate}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800"
            >
              Nueva noticia
            </Link>
          </div>
        }
      >
        {flash ? (
          <div
            className="flex flex-col gap-3 rounded-2xl border border-emerald-200/90 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between"
            role="status"
          >
            <p className="font-medium">{flash}</p>
            <button
              type="button"
              onClick={() => setFlash('')}
              className="shrink-0 text-xs font-semibold text-emerald-800 underline-offset-2 hover:underline"
            >
              Cerrar
            </button>
          </div>
        ) : null}

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
            <div className="admin-fade-up-delayed col-span-full animate-pulse rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="mt-3 h-4 w-5/6 rounded bg-slate-100" />
            </div>
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
            <div className="admin-fade-up grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  {filtersActive ? 'Resultados del filtro' : 'Noticias publicadas'}
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
                  {filtered.length}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {filtersActive
                    ? `De un total de ${items.length} en el sistema.`
                    : 'Total en el listado (orden por fecha).'}
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
            </div>

            <div className="admin-fade-up-delayed">
              <div className="mt-8 flex flex-col gap-2 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                    Listado
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Buscá, filtrá por categoría o fechas. {PAGE_SIZE} noticias por página.
                  </p>
                </div>
              </div>

              {items.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
                  <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
                    <label className={`${labelClass} lg:col-span-4`}>
                      Buscar
                      <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Título, resumen o cuerpo…"
                        className={inputClass}
                        autoComplete="off"
                      />
                    </label>
                    <label className={`${labelClass} lg:col-span-3`}>
                      Categoría
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="news-select-minimal"
                      >
                        {categoryOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={`${labelClass} lg:col-span-2`}>
                      Desde
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className={inputClass}
                      />
                    </label>
                    <label className={`${labelClass} lg:col-span-2`}>
                      Hasta
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className={inputClass}
                      />
                    </label>
                    <div className="flex items-end lg:col-span-1">
                      {filtersActive ? (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                        >
                          Limpiar
                        </button>
                      ) : (
                        <span className="hidden text-xs text-slate-400 lg:block lg:pb-2">
                          —
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {deleteError ? (
                <p
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {deleteError}
                </p>
              ) : null}

              {items.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
                  <p className="text-base font-medium text-slate-800">
                    Todavía no hay noticias cargadas.
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                    Creá la primera para que aparezca en el portal y en este panel.
                  </p>
                  <Link
                    to={ROUTES.adminNewsCreate}
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800"
                  >
                    Nueva noticia
                  </Link>
                </div>
              ) : filtered.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-amber-200/90 bg-amber-50/50 px-6 py-12 text-center">
                  <p className="text-base font-medium text-slate-800">
                    No hay noticias que coincidan con los filtros.
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                    Probá otra búsqueda o limpiá los filtros para ver todo el listado.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-sky-200 hover:bg-sky-50"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:block">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-wide text-slate-500">
                          <th className="w-14 px-3 py-3.5 sm:px-4" scope="col">
                            <span className="sr-only">Portada</span>
                          </th>
                          <th className="min-w-0 px-2 py-3.5 sm:px-3">Título</th>
                          <th className="hidden w-36 px-3 py-3.5 sm:table-cell sm:px-4">
                            Categoría
                          </th>
                          <th className="w-36 whitespace-nowrap px-3 py-3.5 sm:px-4">
                            Fecha
                          </th>
                            <th className="w-24 whitespace-nowrap px-3 py-3.5 sm:px-4">
                              Vistas
                            </th>
                            <th className="w-56 px-3 py-3.5 sm:px-4">Compartidas</th>
                            <th className="w-44 px-3 py-3.5 sm:px-4">Auditoría</th>
                          <th className="w-48 px-3 py-3.5 text-right sm:px-4">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageItems.map((n) => (
                          <tr
                            key={n.id}
                            className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/90"
                          >
                            <td className="px-3 py-3 align-middle sm:px-4">
                              <AdminNewsRowThumb imageUrl={n.imageUrl} />
                            </td>
                            <td className="min-w-0 px-2 py-3 align-middle sm:px-3">
                              <Link
                                to={ROUTES.adminNewsEdit(n.id)}
                                className="font-semibold text-slate-900 transition hover:text-sky-800"
                              >
                                {n.title}
                              </Link>
                            </td>
                            <td className="hidden align-middle px-3 py-3 sm:table-cell sm:px-4">
                              <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-900 ring-1 ring-sky-100">
                                {n.category || 'General'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 align-middle tabular-nums text-slate-600 sm:px-4">
                              {formatDate(n.publishedAt)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 align-middle text-sm tabular-nums text-slate-700 sm:px-4">
                              {Number(n?.stats?.views || 0)}
                            </td>
                            <td className="px-3 py-3 align-middle text-xs text-slate-600 sm:px-4">
                              <span className="font-semibold text-slate-800">
                                {Number(n?.stats?.shares?.total || 0)}
                              </span>{' '}
                              total · {socialCompact(n)}
                            </td>
                            <td className="px-3 py-3 align-middle text-xs text-slate-600 sm:px-4">
                              <p>Publicó: {actorText(n.createdByUser, 'Sin dato')}</p>
                              <p>Editó: {actorText(n.updatedByUser, 'Sin ediciones')}</p>
                            </td>
                            <td className="px-3 py-3 text-right align-middle sm:px-4">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <Link
                                  to={ROUTES.adminNewsEdit(n.id)}
                                  className="rounded-lg px-2 py-1 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 hover:text-sky-900"
                                >
                                  Editar
                                </Link>
                                <Button
                                  type="button"
                                  variant="danger"
                                  className="px-2.5! py-1! text-xs!"
                                  disabled={deletingId === n.id}
                                  onClick={() =>
                                    setDeleteTarget({
                                      id: n.id,
                                      title: n.title?.trim() || 'Sin título',
                                    })
                                  }
                                >
                                  {deletingId === n.id ? '…' : 'Eliminar'}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <ul className="mt-6 space-y-3 lg:hidden">
                    {pageItems.map((n) => (
                      <li
                        key={n.id}
                        className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                      >
                        <div className="shrink-0 pt-0.5">
                          <AdminNewsRowThumb imageUrl={n.imageUrl} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={ROUTES.adminNewsEdit(n.id)}
                            className="text-base font-semibold text-slate-900 hover:text-sky-800"
                          >
                            {n.title}
                          </Link>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-sky-900 ring-1 ring-sky-100">
                              {n.category || 'General'}
                            </span>
                            <span className="text-xs tabular-nums text-slate-500">
                              {formatDate(n.publishedAt)}
                            </span>
                            <span className="text-xs tabular-nums text-slate-500">
                              {Number(n?.stats?.views || 0)} vistas
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-slate-600">
                            Compartidas: {Number(n?.stats?.shares?.total || 0)} ({socialCompact(n)})
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            Publicó: {actorText(n.createdByUser, 'Sin dato')} · Editó:{' '}
                            {actorText(n.updatedByUser, 'Sin ediciones')}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                              to={ROUTES.adminNewsEdit(n.id)}
                              className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-sky-200 hover:bg-sky-50/50 hover:text-sky-900 sm:flex-none"
                            >
                              Editar
                            </Link>
                            <Button
                              type="button"
                              variant="danger"
                              className="flex-1 px-2.5! py-2! text-xs! sm:flex-none"
                              disabled={deletingId === n.id}
                              onClick={() =>
                                setDeleteTarget({
                                  id: n.id,
                                  title: n.title?.trim() || 'Sin título',
                                })
                              }
                            >
                              {deletingId === n.id ? 'Eliminando…' : 'Eliminar'}
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <nav
                    className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    aria-label="Paginación del listado"
                  >
                    <p className="text-center text-sm leading-relaxed text-slate-600 sm:text-left">
                      Mostrando{' '}
                      <span className="font-semibold tabular-nums text-slate-900">
                        {rangeStart + 1}
                      </span>
                      –
                      <span className="font-semibold tabular-nums text-slate-900">
                        {rangeEnd}
                      </span>{' '}
                      de{' '}
                      <span className="font-semibold tabular-nums text-slate-900">
                        {filtered.length}
                      </span>
                      {totalPages > 1 ? (
                        <>
                          <span className="text-slate-400" aria-hidden>
                            {' '}
                            ·{' '}
                          </span>
                          <span className="tabular-nums text-slate-600">
                            página {safePage} de {totalPages}
                          </span>
                        </>
                      ) : null}
                    </p>
                    {totalPages > 1 ? (
                      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                        <Button
                          type="button"
                          variant="secondary"
                          className="min-h-10 px-3! py-2! text-sm!"
                          disabled={safePage <= 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          Anterior
                        </Button>
                        <div className="hidden items-center gap-1 sm:flex">
                          {pagModel.items.map((entry, idx) =>
                            entry.type === 'gap' ? (
                              <span
                                key={`gap-${idx}`}
                                className="px-1 text-slate-400"
                                aria-hidden
                              >
                                …
                              </span>
                            ) : (
                              <button
                                key={entry.n}
                                type="button"
                                onClick={() => setPage(entry.n)}
                                className={`min-h-10 min-w-10 rounded-lg text-sm font-semibold transition ${
                                  entry.n === safePage
                                    ? 'bg-sky-700 text-white shadow-sm'
                                    : 'text-slate-700 hover:bg-white hover:ring-1 hover:ring-slate-200'
                                }`}
                              >
                                {entry.n}
                              </button>
                            ),
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          className="min-h-10 px-3! py-2! text-sm!"
                          disabled={safePage >= totalPages}
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                          Siguiente
                        </Button>
                      </div>
                    ) : null}
                  </nav>

                </>
              )}
            </div>
          </>
        )}
      </AdminPageShell>
    </>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { HeroImageModal } from '../../components/admin/HeroImageModal.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import { useNewsList } from '../../hooks/useNewsList.js'
import { deleteNews } from '../../services/newsService.js'
import {
  fetchSitePageBanner,
  updateSitePageBanner,
} from '../../services/sitePageBannerService.js'
import { formatDate } from '../../utils/formatDate.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'
import { inputClass, labelClass } from '../../components/ui/formStyles.js'

const PAGE_SIZE = 20

const ACTION_BTN_BASE =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition sm:w-auto'
const ACTION_BTN_NEUTRAL = `${ACTION_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const ACTION_BTN_ACCENT = `${ACTION_BTN_BASE} border border-violet-200 bg-violet-50 text-violet-800 hover:border-violet-300 hover:bg-violet-100`
const ACTION_BTN_PRIMARY = `${ACTION_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`

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

function AdminNewsRowThumb({ imageUrl, size = 'md' }) {
  const resolved = imageUrl ? resolveMediaUrl(imageUrl) : ''
  const src = resolved && resolved.trim() ? resolved : null
  const dim = size === 'sm' ? 'h-10 w-10' : 'h-11 w-11'
  if (!src) {
    return (
      <div
        className={`${dim} shrink-0 rounded-lg bg-slate-50 ring-1 ring-inset ring-slate-200/80`}
        aria-hidden
      />
    )
  }
  return (
    <img
      src={src}
      alt=""
      className={`${dim} shrink-0 rounded-lg object-cover ring-1 ring-inset ring-slate-200/80`}
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
  const [bannerOpen, setBannerOpen] = useState(false)
  const [bannerSaving, setBannerSaving] = useState(false)
  const [bannerImageUrl, setBannerImageUrl] = useState('')
  const [bannerUpdatedAt, setBannerUpdatedAt] = useState(null)

  const loadBannerFromServer = useCallback(async () => {
    const content = await fetchSitePageBanner('news')
    setBannerImageUrl(String(content?.heroImageUrl || ''))
    setBannerUpdatedAt(content?.updatedAt || null)
  }, [])

  const persistBanner = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      const saved = await updateSitePageBanner('news', {
        heroImageUrl: bannerImageUrl.trim(),
        expectedUpdatedAt: bannerUpdatedAt,
        forceOverwrite,
      })
      setBannerImageUrl(String(saved?.heroImageUrl || ''))
      setBannerUpdatedAt(saved?.updatedAt || null)
      setBannerOpen(false)
      setFlash('Se actualizó la portada de Noticias.')
    },
    [bannerImageUrl, bannerUpdatedAt],
  )

  const { conflictDialog: bannerConflictDialog, handleConflict: handleBannerConflict } =
    useContentEditorConcurrencyConflict({
      reloadFromServer: loadBannerFromServer,
      persistContent: persistBanner,
      entityLabel: 'la portada de Noticias',
      onReloadSuccess: () => setFlash('Se cargó la última versión de la portada.'),
      onReloadError: (e) => setFlash(e.message || 'No se pudo recargar la portada.'),
      onForceSaveError: (e) => setFlash(e.message || 'No se pudo guardar la portada de Noticias.'),
    })

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
    let cancelled = false
    if (!isApiConfigured()) return () => {}
    fetchSitePageBanner('news')
      .then((content) => {
        if (cancelled) return
        setBannerImageUrl(String(content?.heroImageUrl || ''))
        setBannerUpdatedAt(content?.updatedAt || null)
      })
      .catch(() => {
        if (!cancelled) {
          setBannerImageUrl('')
          setBannerUpdatedAt(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

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

  async function handleSaveBanner() {
    if (!isApiConfigured()) {
      setFlash('No hay conexión disponible con el backend.')
      return
    }
    setBannerSaving(true)
    try {
      await persistBanner()
    } catch (e) {
      if (handleBannerConflict(e)) return
      setFlash(e.message || 'No se pudo guardar la portada de Noticias.')
    } finally {
      setBannerSaving(false)
    }
  }

  const deleteLoading =
    deleteTarget != null && deletingId != null && deletingId === deleteTarget.id

  return (
    <>
      {bannerConflictDialog}
      <HeroImageModal
        open={bannerOpen}
        title="Portada de Noticias"
        value={bannerImageUrl}
        onChange={setBannerImageUrl}
        onClose={() => setBannerOpen(false)}
        onSave={handleSaveBanner}
        saving={bannerSaving}
        disabled={!isApiConfigured()}
      />
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
        eyebrow=""
        maxWidthClass="max-w-none"
        variant="plain"
        actions={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={() => setBannerOpen(true)}
              className={ACTION_BTN_NEUTRAL}
            >
              Cambiar portada
            </button>
            <Link to={ROUTES.adminNewsStats} className={ACTION_BTN_ACCENT}>
              Estadísticas
            </Link>
            <Link to={ROUTES.adminNewsCreate} className={ACTION_BTN_PRIMARY}>
              + Nueva noticia
            </Link>
          </div>
        }
      >
        <h1 className="sr-only">Noticias</h1>

        {!isApiConfigured() ? (
          <div
            className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="status"
          >
            No se detectó conexión con el backend para administrar noticias.
          </div>
        ) : null}

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
          <div className="admin-fade-up rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-12">
              <div className="h-10 animate-pulse rounded-xl bg-slate-100 sm:col-span-5" />
              <div className="h-10 animate-pulse rounded-xl bg-slate-100 sm:col-span-3" />
              <div className="h-10 animate-pulse rounded-xl bg-slate-100 sm:col-span-2" />
              <div className="h-10 animate-pulse rounded-xl bg-slate-100 sm:col-span-2" />
            </div>
            <div className="mt-5 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
              ))}
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
          <div className="admin-fade-up space-y-5">
            {items.length > 0 ? (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
                  <label className={`${labelClass} sm:col-span-5`}>
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
                  <label className={`${labelClass} sm:col-span-3`}>
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
                  <label className={`${labelClass} sm:col-span-2`}>
                    Desde
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Hasta
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <p className="tabular-nums">
                    {filtersActive ? (
                      <>
                        <span className="font-semibold text-slate-900">
                          {filtered.length}
                        </span>{' '}
                        de{' '}
                        <span className="font-semibold text-slate-900">
                          {items.length}
                        </span>{' '}
                        noticias coinciden con los filtros.
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-slate-900">
                          {items.length}
                        </span>{' '}
                        noticias publicadas en total.
                      </>
                    )}
                  </p>
                  {filtersActive ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Limpiar filtros
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {deleteError ? (
              <p
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                {deleteError}
              </p>
            ) : null}

            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
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
              <div className="rounded-2xl border border-dashed border-amber-200/90 bg-amber-50/50 px-6 py-12 text-center">
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
                <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <th className="w-14 px-4 py-3.5" scope="col">
                          <span className="sr-only">Portada</span>
                        </th>
                        <th className="min-w-0 px-3 py-3.5">Título</th>
                        <th className="w-40 px-4 py-3.5">Categoría</th>
                        <th className="w-36 whitespace-nowrap px-4 py-3.5">Fecha</th>
                        <th className="w-24 whitespace-nowrap px-4 py-3.5 text-right">
                          Vistas
                        </th>
                        <th className="w-44 px-4 py-3.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((n) => (
                        <tr
                          key={n.id}
                          className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/90"
                        >
                          <td className="px-4 py-3 align-middle">
                            <AdminNewsRowThumb imageUrl={n.imageUrl} />
                          </td>
                          <td className="min-w-0 px-3 py-3 align-middle">
                            <Link
                              to={ROUTES.adminNewsEdit(n.id)}
                              className="line-clamp-2 font-semibold text-slate-900 transition hover:text-sky-800"
                            >
                              {n.title}
                            </Link>
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-900 ring-1 ring-sky-100">
                              {n.category || 'General'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 align-middle tabular-nums text-slate-600">
                            {formatDate(n.publishedAt)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 align-middle text-right tabular-nums text-slate-700">
                            {Number(n?.stats?.views || 0)}
                          </td>
                          <td className="px-4 py-3 text-right align-middle">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={ROUTES.adminNewsEdit(n.id)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900"
                              >
                                Editar
                              </Link>
                              <Button
                                type="button"
                                variant="danger"
                                className="px-3! py-1.5! text-xs!"
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

                <ul className="space-y-3 lg:hidden">
                  {pageItems.map((n) => (
                    <li
                      key={n.id}
                      className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                    >
                      <div className="shrink-0 pt-0.5">
                        <AdminNewsRowThumb imageUrl={n.imageUrl} size="sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={ROUTES.adminNewsEdit(n.id)}
                          className="line-clamp-2 text-base font-semibold text-slate-900 hover:text-sky-800"
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
                            className="flex-1 px-3! py-2! text-xs! sm:flex-none"
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
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
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
        )}
      </AdminPageShell>
    </>
  )
}

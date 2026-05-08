import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { useNewsList } from '../../hooks/useNewsList.js'
import { fetchNewsStatsOverview } from '../../services/newsService.js'
import { ROUTES } from '../../utils/constants.js'
import { formatDate } from '../../utils/formatDate.js'

const ACTION_BTN_BASE =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
const ACTION_BTN_BACK = `${ACTION_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const ACTION_BTN_NEUTRAL = `${ACTION_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const ACTION_BTN_PRIMARY = `${ACTION_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`

function Spinner({ tone = 'sky', size = 'sm' }) {
  const dim = size === 'sm' ? 'h-4 w-4 border-2' : 'h-5 w-5 border-2'
  const color =
    tone === 'white'
      ? 'border-white/40 border-t-white'
      : 'border-slate-300 border-t-sky-700'
  return (
    <span
      className={`inline-block animate-spin rounded-full ${color} ${dim}`}
      aria-hidden
    />
  )
}

const TONE_STYLES = {
  sky: {
    card: 'border-sky-100 bg-gradient-to-br from-white to-sky-50',
    label: 'text-sky-700',
    value: 'text-sky-950',
    icon: 'bg-sky-100 text-sky-700',
  },
  emerald: {
    card: 'border-emerald-100 bg-gradient-to-br from-white to-emerald-50',
    label: 'text-emerald-700',
    value: 'text-emerald-950',
    icon: 'bg-emerald-100 text-emerald-700',
  },
  violet: {
    card: 'border-violet-100 bg-gradient-to-br from-white to-violet-50',
    label: 'text-violet-700',
    value: 'text-violet-950',
    icon: 'bg-violet-100 text-violet-700',
  },
  amber: {
    card: 'border-amber-100 bg-gradient-to-br from-white to-amber-50',
    label: 'text-amber-800',
    value: 'text-amber-950',
    icon: 'bg-amber-100 text-amber-800',
  },
}

function StatCard({ label, value, hint, tone = 'sky', icon }) {
  const t = TONE_STYLES[tone] || TONE_STYLES.sky
  return (
    <article
      className={`flex items-start justify-between gap-3 rounded-2xl border p-5 shadow-sm ${t.card}`}
    >
      <div className="min-w-0">
        <p
          className={`text-[11px] font-bold uppercase tracking-[0.16em] ${t.label}`}
        >
          {label}
        </p>
        <p className={`mt-2 text-3xl font-black tabular-nums tracking-tight ${t.value}`}>
          {value}
        </p>
        {hint ? (
          <p className="mt-1.5 text-xs text-slate-600">{hint}</p>
        ) : null}
      </div>
      {icon ? (
        <span
          aria-hidden
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-base ${t.icon}`}
        >
          {icon}
        </span>
      ) : null}
    </article>
  )
}

function HorizontalBars({ title, hint, data, maxValue, colorClass, emptyLabel }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-3">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700">
          {title}
        </h3>
        {hint ? (
          <span className="text-xs text-slate-500">{hint}</span>
        ) : null}
      </div>
      {data.length === 0 || maxValue === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-xs text-slate-500">
          {emptyLabel || 'Aún no hay datos suficientes.'}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {data.map((row) => {
            const pct =
              maxValue > 0
                ? Math.max(4, Math.round((row.value / maxValue) * 100))
                : 0
            return (
              <li key={row.key}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="line-clamp-1 text-sm font-medium text-slate-700">
                    {row.label}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-slate-900">
                    {row.value}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${colorClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </article>
  )
}

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-slate-200/80 bg-slate-100/70"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-2xl border border-slate-200/80 bg-slate-100/70"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl border border-slate-200/80 bg-slate-100/70" />
    </div>
  )
}

export function AdminNewsStats() {
  const { items, loading: loadingNews, error: newsError, refetch: refetchNews } =
    useNewsList()
  const [overview, setOverview] = useState(null)
  const [loadingOverview, setLoadingOverview] = useState(true)
  const [overviewError, setOverviewError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState(null)
  const [rankingMode, setRankingMode] = useState('views')
  const dismissToast = useCallback(() => setToast(null), [])

  const loadOverview = useCallback(async () => {
    setOverviewError('')
    try {
      const data = await fetchNewsStatsOverview()
      setOverview(data)
    } catch (e) {
      setOverviewError(e.message || 'No se pudieron cargar las estadísticas.')
      throw e
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoadingOverview(true)
    fetchNewsStatsOverview()
      .then((data) => {
        if (!cancelled) setOverview(data)
      })
      .catch((e) => {
        if (!cancelled)
          setOverviewError(e.message || 'No se pudieron cargar las estadísticas.')
      })
      .finally(() => {
        if (!cancelled) setLoadingOverview(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    setToast({ type: 'success', message: 'Actualizando estadísticas…' })
    try {
      await Promise.all([loadOverview(), refetchNews()])
      setToast({ type: 'success', message: 'Estadísticas actualizadas.' })
    } catch (e) {
      setToast({
        type: 'error',
        message: e?.message || 'No se pudieron actualizar las estadísticas.',
      })
    } finally {
      setRefreshing(false)
    }
  }

  const totals = overview?.totals || {}
  const totalViews = Number(totals.total_views || 0)
  const totalShares = Number(totals.total_shares || 0)
  const totalNewsCount = Number(totals.total_news || items.length || 0)
  const shareRate = totalViews > 0 ? Math.round((totalShares / totalViews) * 100) : 0
  const avgViews = totalNewsCount > 0 ? Math.round(totalViews / totalNewsCount) : 0

  const socialData = useMemo(
    () =>
      [
        { key: 'facebook', label: 'Facebook', value: Number(totals.total_facebook || 0) },
        { key: 'whatsapp', label: 'WhatsApp', value: Number(totals.total_whatsapp || 0) },
        { key: 'instagram', label: 'Instagram', value: Number(totals.total_instagram || 0) },
        { key: 'native', label: 'Compartir nativo', value: Number(totals.total_native || 0) },
        { key: 'copy_link', label: 'Copiar enlace', value: Number(totals.total_copy_link || 0) },
      ].sort((a, b) => b.value - a.value),
    [totals],
  )

  const topViews = useMemo(
    () =>
      (overview?.topViews || []).slice(0, 5).map((row) => ({
        key: `views-${row.id}`,
        label: row.title,
        value: Number(row.views_count || 0),
      })),
    [overview],
  )
  const topShares = useMemo(
    () =>
      (overview?.topShares || []).slice(0, 5).map((row) => ({
        key: `shares-${row.id}`,
        label: row.title,
        value: Number(row.shares_count || 0),
      })),
    [overview],
  )

  const ranking = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      if (rankingMode === 'shares') {
        return Number(b?.stats?.shares?.total || 0) - Number(a?.stats?.shares?.total || 0)
      }
      return Number(b?.stats?.views || 0) - Number(a?.stats?.views || 0)
    })
    return sorted.slice(0, 10)
  }, [items, rankingMode])

  const isInitialLoading = loadingOverview || loadingNews
  const hasFatalError = !isInitialLoading && (overviewError || newsError)
  const errorMessage = overviewError || newsError

  const topSocial = socialData[0]
  const topSocialLabel =
    topSocial && topSocial.value > 0 ? `${topSocial.label}: ${topSocial.value}` : 'Aún sin compartidas'

  return (
    <>
      {toast ? (
        <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} />
      ) : null}

      <AdminPageShell
        showBackLink={false}
        eyebrow=""
        variant="plain"
        maxWidthClass="max-w-none"
        actions={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link to={ROUTES.adminNews} className={ACTION_BTN_BACK}>
              <span aria-hidden className="text-base leading-none">
                ←
              </span>
              Volver a noticias
            </Link>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing || isInitialLoading}
                className={ACTION_BTN_NEUTRAL}
              >
                {refreshing ? (
                  <>
                    <Spinner />
                    Actualizando…
                  </>
                ) : (
                  <>
                    <span aria-hidden>↻</span>
                    Actualizar
                  </>
                )}
              </button>
              <Link to={ROUTES.adminNewsCreate} className={ACTION_BTN_PRIMARY}>
                + Nueva noticia
              </Link>
            </div>
          </div>
        }
      >
        <h1 className="sr-only">Estadísticas de noticias</h1>

        {isInitialLoading ? (
          <StatsSkeleton />
        ) : hasFatalError ? (
          <div
            className="admin-fade-up rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 shadow-sm"
            role="alert"
          >
            <p className="font-semibold">No se pudieron cargar las estadísticas.</p>
            <p className="mt-1 text-red-700/90">{errorMessage}</p>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50 disabled:opacity-60"
            >
              {refreshing ? <Spinner /> : <span aria-hidden>↻</span>}
              Reintentar
            </button>
          </div>
        ) : (
          <div className="admin-fade-up space-y-6">
            <section
              aria-label="Resumen general"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              <StatCard
                label="Visualizaciones"
                value={totalViews.toLocaleString('es-AR')}
                hint={
                  totalNewsCount > 0
                    ? `En ${totalNewsCount} noticia${totalNewsCount === 1 ? '' : 's'}`
                    : 'Sin noticias publicadas'
                }
                tone="sky"
                icon="👁"
              />
              <StatCard
                label="Compartidas"
                value={totalShares.toLocaleString('es-AR')}
                hint={topSocialLabel}
                tone="emerald"
                icon="↗"
              />
              <StatCard
                label="Tasa de compartida"
                value={`${shareRate}%`}
                hint={
                  totalViews > 0
                    ? 'Compartidas / vistas'
                    : 'Necesitás vistas para calcular'
                }
                tone="violet"
                icon="%"
              />
              <StatCard
                label="Promedio de vistas"
                value={avgViews.toLocaleString('es-AR')}
                hint="Por noticia publicada"
                tone="amber"
                icon="≈"
              />
            </section>

            <section
              aria-label="Distribución y tops"
              className="grid gap-4 lg:grid-cols-3"
            >
              <HorizontalBars
                title="Compartidas por red social"
                hint="Total acumulado"
                data={socialData}
                maxValue={Math.max(...socialData.map((r) => r.value), 0)}
                colorClass="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500"
                emptyLabel="Aún no hay compartidas registradas."
              />
              <HorizontalBars
                title="Top 5 más vistas"
                hint="Por visualizaciones"
                data={topViews}
                maxValue={Math.max(...topViews.map((r) => r.value), 0)}
                colorClass="bg-gradient-to-r from-sky-500 to-blue-600"
                emptyLabel="Aún no hay noticias con vistas."
              />
              <HorizontalBars
                title="Top 5 más compartidas"
                hint="Por compartidas"
                data={topShares}
                maxValue={Math.max(...topShares.map((r) => r.value), 0)}
                colorClass="bg-gradient-to-r from-emerald-500 to-teal-600"
                emptyLabel="Aún no hay noticias compartidas."
              />
            </section>

            <section
              aria-label="Ranking detallado"
              className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-slate-900">
                    Ranking detallado por noticia
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Top 10 según el criterio elegido.
                  </p>
                </div>
                <div
                  role="tablist"
                  aria-label="Ordenar ranking"
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50/80 p-1"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={rankingMode === 'views'}
                    onClick={() => setRankingMode('views')}
                    className={`min-h-9 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      rankingMode === 'views'
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Por vistas
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={rankingMode === 'shares'}
                    onClick={() => setRankingMode('shares')}
                    className={`min-h-9 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      rankingMode === 'shares'
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Por compartidas
                  </button>
                </div>
              </div>

              {ranking.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-base font-medium text-slate-800">
                    Aún no hay noticias con datos suficientes.
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                    Cuando se registren visualizaciones o compartidas, aparecerán acá.
                  </p>
                  <Link
                    to={ROUTES.adminNewsCreate}
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800"
                  >
                    Nueva noticia
                  </Link>
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50/90 text-xs font-bold uppercase tracking-wide text-slate-500">
                          <th className="w-10 px-3 py-3.5 sm:px-4">#</th>
                          <th className="min-w-0 px-3 py-3.5 sm:px-4">Noticia</th>
                          <th className="w-28 whitespace-nowrap px-4 py-3.5 text-right">
                            Vistas
                          </th>
                          <th className="w-32 whitespace-nowrap px-4 py-3.5 text-right">
                            Compartidas
                          </th>
                          <th className="w-40 whitespace-nowrap px-4 py-3.5">
                            Última lectura
                          </th>
                          <th className="w-44 whitespace-nowrap px-4 py-3.5">
                            Última compartida
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {ranking.map((n, idx) => (
                          <tr
                            key={n.id}
                            className="border-t border-slate-100 transition-colors hover:bg-slate-50/80"
                          >
                            <td className="px-3 py-3 align-middle text-sm font-bold tabular-nums text-slate-500 sm:px-4">
                              {idx + 1}
                            </td>
                            <td className="min-w-0 px-3 py-3 align-middle sm:px-4">
                              <Link
                                to={ROUTES.adminNewsEdit(n.id)}
                                className="line-clamp-2 font-semibold text-slate-900 transition hover:text-sky-800"
                              >
                                {n.title}
                              </Link>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {n.category || 'General'} · {formatDate(n.publishedAt)}
                              </p>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right align-middle tabular-nums text-slate-800">
                              {Number(n?.stats?.views || 0).toLocaleString('es-AR')}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right align-middle tabular-nums text-slate-800">
                              {Number(n?.stats?.shares?.total || 0).toLocaleString('es-AR')}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 align-middle text-slate-600">
                              {n?.stats?.lastViewedAt
                                ? formatDate(n.stats.lastViewedAt)
                                : '—'}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 align-middle text-slate-600">
                              {n?.stats?.lastSharedAt
                                ? formatDate(n.stats.lastSharedAt)
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <ul className="divide-y divide-slate-100 lg:hidden">
                    {ranking.map((n, idx) => (
                      <li key={n.id} className="px-4 py-4 sm:px-5">
                        <div className="flex items-start gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold tabular-nums text-slate-600">
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <Link
                              to={ROUTES.adminNewsEdit(n.id)}
                              className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-sky-800"
                            >
                              {n.title}
                            </Link>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {n.category || 'General'} · {formatDate(n.publishedAt)}
                            </p>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                              <div className="rounded-lg bg-sky-50 px-2.5 py-1.5 text-sky-900 ring-1 ring-sky-100">
                                <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                                  Vistas
                                </p>
                                <p className="text-sm font-semibold tabular-nums">
                                  {Number(n?.stats?.views || 0).toLocaleString('es-AR')}
                                </p>
                              </div>
                              <div className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-emerald-900 ring-1 ring-emerald-100">
                                <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                                  Compartidas
                                </p>
                                <p className="text-sm font-semibold tabular-nums">
                                  {Number(n?.stats?.shares?.total || 0).toLocaleString(
                                    'es-AR',
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>
        )}
      </AdminPageShell>
    </>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { useNewsList } from '../../hooks/useNewsList.js'
import { fetchNewsStatsOverview } from '../../services/newsService.js'
import { ROUTES } from '../../utils/constants.js'
import { formatDate } from '../../utils/formatDate.js'

function StatCard({ label, value, tone = 'sky' }) {
  const tones = {
    sky: 'from-sky-50 to-blue-50 border-sky-200 text-sky-900',
    emerald: 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-900',
    violet: 'from-violet-50 to-fuchsia-50 border-violet-200 text-violet-900',
    amber: 'from-amber-50 to-orange-50 border-amber-200 text-amber-900',
  }
  return (
    <article
      className={`rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${tones[tone] || tones.sky}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-black tabular-nums tracking-tight">{value}</p>
    </article>
  )
}

function HorizontalBars({ title, data, maxValue, colorClass }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">{title}</h3>
      <ul className="mt-4 space-y-3">
        {data.map((row) => {
          const pct = maxValue > 0 ? Math.max(4, Math.round((row.value / maxValue) * 100)) : 0
          return (
            <li key={row.key}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium text-slate-700">{row.label}</span>
                <span className="text-sm font-semibold tabular-nums text-slate-900">{row.value}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </article>
  )
}

export function AdminNewsStats() {
  const { items, loading: loadingNews, error: newsError } = useNewsList()
  const [overview, setOverview] = useState(null)
  const [loadingOverview, setLoadingOverview] = useState(true)
  const [overviewError, setOverviewError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchNewsStatsOverview()
      .then((data) => {
        if (!cancelled) setOverview(data)
      })
      .catch((e) => {
        if (!cancelled) setOverviewError(e.message || 'No se pudieron cargar las estadísticas.')
      })
      .finally(() => {
        if (!cancelled) setLoadingOverview(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const totals = overview?.totals || {}
  const totalViews = Number(totals.total_views || 0)
  const totalShares = Number(totals.total_shares || 0)
  const totalNews = Number(totals.total_news || 0)
  const shareRate = totalViews > 0 ? Math.round((totalShares / totalViews) * 100) : 0
  const avgViews = totalNews > 0 ? Math.round(totalViews / totalNews) : 0

  const socialData = [
    { key: 'facebook', label: 'Facebook', value: Number(totals.total_facebook || 0) },
    { key: 'whatsapp', label: 'WhatsApp', value: Number(totals.total_whatsapp || 0) },
    { key: 'instagram', label: 'Instagram', value: Number(totals.total_instagram || 0) },
    { key: 'native', label: 'Compartir', value: Number(totals.total_native || 0) },
    { key: 'copy_link', label: 'Copiar enlace', value: Number(totals.total_copy_link || 0) },
  ].sort((a, b) => b.value - a.value)

  const topViews = (overview?.topViews || []).slice(0, 5).map((row) => ({
    key: `views-${row.id}`,
    label: row.title,
    value: Number(row.views_count || 0),
  }))
  const topShares = (overview?.topShares || []).slice(0, 5).map((row) => ({
    key: `shares-${row.id}`,
    label: row.title,
    value: Number(row.shares_count || 0),
  }))

  const bestViewed = [...items]
    .sort((a, b) => Number(b?.stats?.views || 0) - Number(a?.stats?.views || 0))
    .slice(0, 10)

  return (
    <AdminPageShell
      backTo={ROUTES.adminNews}
      backLabel="Volver a noticias"
      eyebrow="Contenido"
      title="Estadísticas de noticias"
      subtitle="Analítica de rendimiento por visualizaciones y compartidas, con foco en el comportamiento por red social."
      maxWidthClass="max-w-7xl"
      variant="plain"
      actions={
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Link
            to={ROUTES.adminNews}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
          >
            Ir al listado
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
      {loadingOverview || loadingNews ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : overviewError || newsError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {overviewError || newsError}
        </p>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Visualizaciones totales" value={totalViews} tone="sky" />
            <StatCard label="Compartidas totales" value={totalShares} tone="emerald" />
            <StatCard label="Ratio compartidas/vistas" value={`${shareRate}%`} tone="violet" />
            <StatCard label="Promedio vistas/noticia" value={avgViews} tone="amber" />
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <HorizontalBars
                title="Compartidas por red social"
                data={socialData}
                maxValue={Math.max(...socialData.map((r) => r.value), 0)}
                colorClass="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500"
              />
            </div>
            <div className="lg:col-span-1">
              <HorizontalBars
                title="Top 5 más vistas"
                data={topViews}
                maxValue={Math.max(...topViews.map((r) => r.value), 0)}
                colorClass="bg-gradient-to-r from-sky-500 to-blue-600"
              />
            </div>
            <div className="lg:col-span-1">
              <HorizontalBars
                title="Top 5 más compartidas"
                data={topShares}
                maxValue={Math.max(...topShares.map((r) => r.value), 0)}
                colorClass="bg-gradient-to-r from-emerald-500 to-teal-600"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 sm:px-5">
              <h3 className="text-base font-semibold text-slate-900">
                Ranking detallado por noticia
              </h3>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Top 10 por visualizaciones
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 sm:px-5">Noticia</th>
                    <th className="px-4 py-3 sm:px-5">Vistas</th>
                    <th className="px-4 py-3 sm:px-5">Compartidas</th>
                    <th className="px-4 py-3 sm:px-5">Última lectura</th>
                    <th className="px-4 py-3 sm:px-5">Última compartida</th>
                  </tr>
                </thead>
                <tbody>
                  {bestViewed.map((n) => (
                    <tr key={n.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-800 sm:px-5">{n.title}</td>
                      <td className="px-4 py-3 tabular-nums text-slate-700 sm:px-5">
                        {Number(n?.stats?.views || 0)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-700 sm:px-5">
                        {Number(n?.stats?.shares?.total || 0)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 sm:px-5">
                        {n?.stats?.lastViewedAt ? formatDate(n.stats.lastViewedAt) : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 sm:px-5">
                        {n?.stats?.lastSharedAt ? formatDate(n.stats.lastSharedAt) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AdminPageShell>
  )
}

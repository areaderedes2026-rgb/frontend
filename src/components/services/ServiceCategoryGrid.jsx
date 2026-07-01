import { Link } from 'react-router-dom'
import {
  countServicesInCategory,
  normalizeServiceCategories,
} from '../../data/serviceCategoriesContent.js'
import { ROUTES } from '../../utils/constants.js'
import { ServiceCategoryIconBadge } from './ServiceCategoryIcons.jsx'

function CategoryTile({ category, count, previewMode = false, to, className: extraClass = '' }) {
  const inner = (
    <>
      <ServiceCategoryIconBadge icon={category.icon} />
      <p className="mt-4 text-center text-sm font-bold leading-snug text-[#171b22] sm:text-[15px]">
        {category.name}
      </p>
      {count > 0 ? (
        <p className="mt-1 text-center text-[11px] font-semibold uppercase tracking-wide text-sky-700">
          {count} trámite{count === 1 ? '' : 's'}
        </p>
      ) : (
        <p className="mt-1 text-center text-[11px] font-medium text-slate-400">Sin trámites</p>
      )}
    </>
  )

  const className =
    `group flex h-full min-h-[168px] flex-col items-center justify-center rounded-2xl border border-[#e8e4dc] bg-white p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_18px_40px_-24px_rgba(14,116,144,0.35)] focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/45 sm:min-h-[180px] sm:p-5 ${extraClass}`.trim()

  if (previewMode) {
    return (
      <div className={className} aria-label={category.name}>
        {inner}
      </div>
    )
  }

  return (
    <Link
      to={to}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`Ver trámites de ${category.name}`}
    >
      {inner}
    </Link>
  )
}

export function ServiceCategoryGrid({
  categories = [],
  services = [],
  eyebrow = 'Categorías',
  title = 'Elegí un área para ver sus trámites',
  previewMode = false,
  className = '',
  onEditCategory,
  onDeleteCategory,
  saving = false,
}) {
  const list = normalizeServiceCategories(categories).filter((c) => c.enabled !== false)
  const adminMode = Boolean(onEditCategory)

  if (!list.length) {
    return (
      <div className={`rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-6 text-center text-sm text-[#4b505a] ${className}`.trim()}>
        Todavía no hay categorías publicadas.
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-800">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
          {title}
        </h2>
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
        {list.map((category, index) => {
          const count = countServicesInCategory(services, category, list)
          const to = ROUTES.serviceCategory(category.slug)
          return (
            <li key={category.id} className="relative h-full">
              {adminMode ? (
                <div className="absolute right-1.5 top-1.5 z-10 flex gap-1">
                  <button
                    type="button"
                    title={`Editar ${category.name}`}
                    disabled={saving}
                    onClick={() => onEditCategory(category, index)}
                    className="rounded-md border border-slate-200 bg-white/95 p-1 text-sky-800 shadow-sm hover:bg-sky-50 disabled:opacity-60"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487 18.549 2.799a2.121 2.121 0 1 1 3 3L19.862 7.487m-3-3L6.34 14.99a4.5 4.5 0 0 0-1.113 1.81L4.5 19.5l2.7-.727a4.5 4.5 0 0 0 1.81-1.113l10.49-10.49m-3-3L19.5 7.5" />
                    </svg>
                  </button>
                  {onDeleteCategory ? (
                    <button
                      type="button"
                      title={`Quitar ${category.name}`}
                      disabled={saving}
                      onClick={() => onDeleteCategory(category, index)}
                      className="rounded-md border border-red-200 bg-white/95 p-1 text-red-700 shadow-sm hover:bg-red-50 disabled:opacity-60"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  ) : null}
                </div>
              ) : null}
              <CategoryTile
                category={category}
                count={count}
                previewMode={previewMode || adminMode}
                to={to}
                className={adminMode ? 'pt-8' : ''}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

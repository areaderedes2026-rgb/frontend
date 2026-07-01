import { useMemo, useState } from 'react'
import {
  SERVICE_CATEGORY_ICON_OPTIONS,
  findServiceCategoryIconOption,
} from '../../data/serviceCategoriesContent.js'
import {
  ServiceCategoryIconBadge,
  ServiceCategoryIconGlyph,
} from '../services/ServiceCategoryIcons.jsx'
import { inputClass } from '../ui/formStyles.js'

/**
 * Selector compacto de íconos para categorías de servicios (admin).
 */
export function ServiceCategoryIconPicker({ value = 'default', onChange, disabled = false }) {
  const [query, setQuery] = useState('')
  const selected = findServiceCategoryIconOption(value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SERVICE_CATEGORY_ICON_OPTIONS
    return SERVICE_CATEGORY_ICON_OPTIONS.filter(
      (option) =>
        option.label.toLowerCase().includes(q) || option.value.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5">
        <ServiceCategoryIconBadge icon={selected.value} className="h-11 w-11 shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Ícono seleccionado
          </p>
          <p className="truncate text-sm font-semibold text-slate-900">{selected.label}</p>
        </div>
      </div>

      <label className="block">
        <span className="sr-only">Buscar ícono</span>
        <input
          type="search"
          className={`${inputClass} py-2 text-sm`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          placeholder="Buscar ícono…"
        />
      </label>

      <div className="rounded-xl border border-slate-200 bg-white p-2">
        {filtered.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-slate-500">
            No hay íconos que coincidan con «{query}».
          </p>
        ) : (
          <div
            className="grid max-h-36 grid-cols-7 gap-1 overflow-y-auto overscroll-contain sm:grid-cols-8 sm:max-h-40"
            role="listbox"
            aria-label="Elegir ícono de categoría"
          >
            {filtered.map((option) => {
              const isSelected = selected.value === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  title={option.label}
                  disabled={disabled}
                  onClick={() => onChange?.(option.value)}
                  className={`flex h-9 w-full items-center justify-center rounded-lg border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 ${
                    isSelected
                      ? 'border-sky-400 bg-sky-700 text-white shadow-sm'
                      : 'border-transparent bg-slate-50 text-sky-900 hover:border-sky-200 hover:bg-sky-50'
                  }`}
                >
                  <ServiceCategoryIconGlyph name={option.value} className="h-5 w-5" />
                </button>
              )
            })}
          </div>
        )}
        <p className="mt-2 px-1 text-[11px] text-slate-500">
          {filtered.length} ícono{filtered.length === 1 ? '' : 's'}
          {query.trim() ? ' encontrados' : ' disponibles'}. Pasá el cursor para ver el nombre.
        </p>
      </div>
    </div>
  )
}

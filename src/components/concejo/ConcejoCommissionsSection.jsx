import { useCallback, useId, useState } from 'react'
import {
  buildCoordinatingPresidentsList,
  sortCommissions,
} from '../../data/concejoCommissionsContent.js'

function ChevronIcon({ open }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-sky-800 transition-transform duration-300 ${
        open ? 'rotate-180' : ''
      }`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function RoleRow({ label, holder, highlight = false }) {
  const name = holder?.name?.trim()
  const role = holder?.role?.trim()

  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <span
        className={`shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] ${
          highlight ? 'text-amber-900/90' : 'text-[#6b7280]'
        }`}
      >
        {label}
      </span>
      <div className="min-w-0 sm:text-right">
        {name ? (
          <>
            <p className="text-sm font-semibold leading-snug text-[#171b22]">{name}</p>
            {role ? <p className="text-xs text-[#5c6169]">{role}</p> : null}
          </>
        ) : (
          <p className="text-sm italic text-[#9ca3af]">Sin asignar</p>
        )}
      </div>
    </div>
  )
}

function CommissionMembersBody({ commission }) {
  if (commission.kind === 'coordinating') {
    return (
      <div className="max-w-md">
        <RoleRow label="Presidente/a" holder={commission.presidente} highlight />
      </div>
    )
  }

  return (
    <ul className="divide-y divide-[#ece8df]">
      <li className="py-3 first:pt-0">
        <RoleRow label="Presidente/a" holder={commission.presidente} highlight />
      </li>
      <li className="py-3">
        <RoleRow label="Vocal 1°" holder={commission.vocal1} />
      </li>
      <li className="py-3 last:pb-0">
        <RoleRow label="Vocal 2°" holder={commission.vocal2} />
      </li>
    </ul>
  )
}

function ExpandableCommissionCard({
  commission,
  index,
  isOpen,
  onToggle,
  badge,
  className = '',
}) {
  const panelId = useId()
  const displayNumber = commission.number || String(index + 1)
  const title = commission.name || 'Comisión'
  const isCoordinating = commission.kind === 'coordinating'

  return (
    <article
      className={`flex w-full flex-col overflow-hidden rounded-2xl border bg-[#fcfcfa] shadow-sm transition-[border-color,box-shadow] duration-300 ${
        isOpen
          ? 'border-sky-200/90 shadow-[0_12px_40px_-28px_rgba(14,116,144,0.22)]'
          : 'border-[#ddd7ca] hover:border-[#d4cec0] hover:shadow-md'
      } ${className}`}
    >
      <button
        type="button"
        className="flex w-full shrink-0 flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <div className="flex flex-col gap-3 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span
              className={`inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-xl px-2 text-sm font-bold tabular-nums transition-colors ${
                isOpen ? 'bg-sky-800 text-white' : 'bg-sky-100 text-sky-900'
              }`}
            >
              {displayNumber}
            </span>
            <div className="min-w-0 flex-1">
              {badge ? (
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-800">
                  {badge}
                </p>
              ) : null}
              <h3
                className={`font-serif text-lg font-bold leading-snug tracking-tight text-[#171b22] sm:text-xl ${
                  badge ? 'mt-0.5' : ''
                }`}
              >
                {title}
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-[#ece8df] pt-3">
            <span className="text-xs font-semibold text-[#6b7280]">
              {isOpen ? 'Ocultar integrantes' : 'Ver integrantes'}
            </span>
            <ChevronIcon open={isOpen} />
          </div>
        </div>
      </button>

      <div
        id={panelId}
        role="region"
        aria-label={`Integrantes: ${title}`}
        hidden={!isOpen}
        className={
          isOpen
            ? 'border-t border-[#e8e4dc] px-5 pb-5 pt-4 sm:px-6 sm:pb-6'
            : undefined
        }
      >
        {isOpen ? <CommissionMembersBody commission={commission} /> : null}
      </div>
    </article>
  )
}

function CoordinatingPresidentsList({ linkedPresidents }) {
  if (!linkedPresidents.length) {
    return (
      <p className="rounded-xl border border-dashed border-[#ddd7ca] bg-[#f8f7f3] px-4 py-5 text-center text-sm text-[#5c6169]">
        Cargá los presidentes en las comisiones 1 a 7 para verlos aquí.
      </p>
    )
  }

  const pending = linkedPresidents.filter((row) => !row.presidentName)
  const withPresident = linkedPresidents.length - pending.length

  return (
    <div>
      <p className="text-xs font-semibold text-[#5c6169]">
        Presidentes de las comisiones de trabajo del cuerpo legislativo.
      </p>
      <ul className="mt-3 divide-y divide-[#ece8df] rounded-xl border border-[#e8e4dc] bg-[#f8f7f3]/60">
        {linkedPresidents.map((row) => (
          <li
            key={row.commissionId || `link-${row.number}`}
            className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold tabular-nums text-sky-800">
                Comisión {row.number}
              </p>
              <p className="truncate text-sm font-medium text-[#171b22]">
                {row.commissionName}
              </p>
            </div>
            <div className="min-w-0 sm:max-w-[55%] sm:text-right">
              {row.presidentName ? (
                <>
                  <p className="text-sm font-semibold text-[#171b22]">{row.presidentName}</p>
                  {row.presidentRole ? (
                    <p className="text-xs text-[#5c6169]">{row.presidentRole}</p>
                  ) : null}
                </>
              ) : (
                <p className="text-sm italic text-[#9ca3af]">Sin asignar</p>
              )}
            </div>
          </li>
        ))}
      </ul>
      {pending.length > 0 && withPresident > 0 ? (
        <p className="mt-2 text-xs text-[#6b7280]">
          {pending.length}{' '}
          {pending.length === 1 ? 'comisión sin presidente asignado' : 'comisiones sin presidente asignado'}.
        </p>
      ) : null}
    </div>
  )
}

function CoordinatingCommissionBlock({ commission, isOpen, onToggle, linkedPresidents }) {
  const panelId = useId()
  const title = commission.name || 'Comisión coordinadora'

  return (
    <article
      className={`flex w-full flex-col overflow-hidden rounded-2xl border bg-[#fcfcfa] shadow-sm transition-[border-color,box-shadow] duration-300 ${
        isOpen
          ? 'border-sky-200/90 shadow-[0_12px_40px_-28px_rgba(14,116,144,0.22)]'
          : 'border-[#ddd7ca] hover:border-[#d4cec0] hover:shadow-md'
      }`}
    >
      <button
        type="button"
        className="flex w-full shrink-0 flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-xl px-2 text-sm font-bold tabular-nums transition-colors ${
                isOpen ? 'bg-sky-800 text-white' : 'bg-sky-100 text-sky-900'
              }`}
            >
              {commission.number || '8'}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-800">
                Comisión coordinadora
              </p>
              <h3 className="mt-0.5 font-serif text-lg font-bold leading-snug tracking-tight text-[#171b22] sm:text-xl">
                {title}
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-[#ece8df] pt-3 sm:border-t-0 sm:pt-0">
            <span className="text-xs font-semibold text-[#6b7280]">
              {isOpen ? 'Ocultar detalle' : 'Ver detalle'}
            </span>
            <ChevronIcon open={isOpen} />
          </div>
        </div>
      </button>

      <div
        id={panelId}
        role="region"
        aria-label={`Detalle: ${title}`}
        hidden={!isOpen}
        className={
          isOpen
            ? 'space-y-6 border-t border-[#e8e4dc] px-5 pb-5 pt-4 sm:px-6 sm:pb-6'
            : undefined
        }
      >
        {isOpen ? (
          <>
            <CommissionMembersBody commission={commission} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-800">
                Presidentes por comisión
              </p>
              <CoordinatingPresidentsList linkedPresidents={linkedPresidents} />
            </div>
          </>
        ) : null}
      </div>
    </article>
  )
}

export function ConcejoCommissionsSection({ commissions }) {
  if (!commissions?.enabled) return null
  const items = sortCommissions(commissions.items || [])
  if (!items.length) return null

  const standard = items.filter((c) => c.kind !== 'coordinating')
  const coordinating = items.filter((c) => c.kind === 'coordinating')
  const linkedPresidents = buildCoordinatingPresidentsList(items)

  const [expandedIds, setExpandedIds] = useState(() => new Set())

  const toggle = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <section
      id="comisiones-trabajo"
      className="scroll-mt-[calc(var(--navbar-h,5rem)+var(--concejo-subnav-h,3.25rem)+1rem)] mt-8 rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-6 lg:p-8"
      aria-labelledby="comisiones-trabajo-heading"
    >
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-800">
          Organización interna
        </p>
        <h2
          id="comisiones-trabajo-heading"
          className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl"
        >
          {commissions.title || 'Comisiones de Trabajo'}
        </h2>
        {commissions.subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-[#5c6169] sm:text-base">
            {commissions.subtitle}
          </p>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-[#5c6169] sm:text-base">
            Tocá cada comisión para ver presidente y vocales.
          </p>
        )}
      </div>

      {standard.length > 0 ? (
        <ul className="mt-8 grid list-none grid-cols-1 items-start gap-4 p-0 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-5">
          {standard.map((commission, index) => (
            <li key={commission.id} className="min-w-0 self-start">
              <ExpandableCommissionCard
                commission={commission}
                index={index}
                isOpen={expandedIds.has(commission.id)}
                onToggle={() => toggle(commission.id)}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {coordinating.length > 0 ? (
        <div className={`space-y-4 ${standard.length > 0 ? 'mt-5 lg:mt-6' : 'mt-8'}`}>
          {coordinating.map((commission) => (
            <CoordinatingCommissionBlock
              key={commission.id}
              commission={commission}
              isOpen={expandedIds.has(commission.id)}
              onToggle={() => toggle(commission.id)}
              linkedPresidents={linkedPresidents}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

import {
  buildCoordinatingPresidentsList,
  sortCommissions,
} from '../../data/concejoCommissionsContent.js'

function RoleSlot({ label, holder, accent = 'sky' }) {
  const name = holder?.name?.trim()
  const role = holder?.role?.trim()
  const accentBorder =
    accent === 'amber'
      ? 'border-amber-200/90 bg-amber-50/50'
      : 'border-sky-200/90 bg-sky-50/40'
  const accentLabel = accent === 'amber' ? 'text-amber-900' : 'text-sky-800'

  return (
    <div
      className={`flex h-full flex-col rounded-xl border px-4 py-3.5 ${accentBorder}`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.16em] ${accentLabel}`}
      >
        {label}
      </p>
      {name ? (
        <>
          <p className="mt-2 text-sm font-bold leading-snug text-[#171b22] sm:text-base">
            {name}
          </p>
          {role ? (
            <p className="mt-0.5 text-xs font-medium text-[#5c6169]">{role}</p>
          ) : null}
        </>
      ) : (
        <p className="mt-2 text-sm italic text-[#9ca3af]">Sin asignar</p>
      )}
    </div>
  )
}

function StandardCommissionCard({ commission }) {
  const displayNumber = commission.number || '—'
  return (
    <article className="overflow-hidden rounded-2xl border border-[#ddd7ca] bg-white shadow-[0_8px_32px_-24px_rgba(15,23,42,0.18)]">
      <div className="border-b border-[#e8e4dc] bg-linear-to-r from-[#f8f7f3] to-white px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-sky-800 px-2 text-sm font-bold tabular-nums text-white">
            {displayNumber}
          </span>
          <h3 className="font-serif text-lg font-bold tracking-tight text-[#171b22] sm:text-xl">
            {commission.name}
          </h3>
        </div>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-5">
        <RoleSlot label="Presidente/a" holder={commission.presidente} accent="amber" />
        <RoleSlot label="Vocal 1°" holder={commission.vocal1} />
        <RoleSlot label="Vocal 2°" holder={commission.vocal2} />
      </div>
    </article>
  )
}

function CoordinatingCommissionCard({ commission, linkedPresidents }) {
  const displayNumber = commission.number || '8'
  const withPresident = linkedPresidents.filter((row) => row.presidentName)
  const pending = linkedPresidents.filter((row) => !row.presidentName)

  return (
    <article className="overflow-hidden rounded-2xl border-2 border-sky-200/80 bg-[#fcfcfa] shadow-[0_12px_40px_-28px_rgba(14,116,144,0.25)]">
      <div className="border-b border-sky-100 bg-linear-to-r from-sky-50/90 via-[#fcfcfa] to-[#fcfcfa] px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-sky-900 px-2 text-sm font-bold tabular-nums text-white">
            {displayNumber}
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-800">
              Comisión coordinadora
            </p>
            <h3 className="font-serif text-lg font-bold tracking-tight text-[#171b22] sm:text-xl">
              {commission.name}
            </h3>
          </div>
        </div>
      </div>
      <div className="space-y-5 p-4 sm:p-5">
        <div className="max-w-md">
          <RoleSlot label="Presidente/a de la comisión" holder={commission.presidente} accent="amber" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-800">
            Presidentes de cada comisión
          </p>
          <p className="mt-1 text-sm text-[#5c6169]">
            Integración de las presidencias de las comisiones de trabajo del cuerpo
            legislativo.
          </p>
          {linkedPresidents.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-[#ddd7ca] bg-[#faf9f6] px-4 py-6 text-center text-sm text-[#5c6169]">
              Cargá los presidentes en las comisiones 1 a 7 para verlos aquí.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#e8e4dc] overflow-hidden rounded-xl border border-[#ddd7ca] bg-white">
              {linkedPresidents.map((row) => (
                <li
                  key={row.commissionId || `link-${row.number}`}
                  className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold tabular-nums text-sky-800">
                      Comisión {row.number}
                    </p>
                    <p className="truncate text-sm font-semibold text-[#171b22]">
                      {row.commissionName}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    {row.presidentName ? (
                      <>
                        <p className="text-sm font-bold text-[#171b22]">
                          {row.presidentName}
                        </p>
                        {row.presidentRole ? (
                          <p className="text-xs text-[#5c6169]">{row.presidentRole}</p>
                        ) : null}
                      </>
                    ) : (
                      <p className="text-sm italic text-[#9ca3af]">Presidente sin asignar</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {pending.length > 0 && withPresident.length > 0 ? (
            <p className="mt-3 text-xs text-[#6b7280]">
              {pending.length}{' '}
              {pending.length === 1 ? 'comisión pendiente' : 'comisiones pendientes'} de
              asignar presidente.
            </p>
          ) : null}
        </div>
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
        ) : null}
      </div>

      <div className="mt-8 space-y-4 lg:space-y-5">
        {standard.map((commission) => (
          <StandardCommissionCard key={commission.id} commission={commission} />
        ))}
        {coordinating.map((commission) => (
          <CoordinatingCommissionCard
            key={commission.id}
            commission={commission}
            linkedPresidents={linkedPresidents}
          />
        ))}
      </div>
    </section>
  )
}

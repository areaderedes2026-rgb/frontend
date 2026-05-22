function InfoCard({ label, value, href, icon }) {
  const inner = (
    <>
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-800/10 text-sky-800"
          aria-hidden
        >
          {icon}
        </span>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-800/90">
          {label}
        </p>
      </div>
      <p className="mt-3 text-sm font-semibold leading-relaxed text-[#171b22] sm:text-base">
        {value}
      </p>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className="group flex h-full flex-col rounded-2xl border border-[#ddd7ca] bg-white p-5 shadow-[0_8px_28px_-22px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-md"
      >
        {inner}
        <span className="mt-3 text-xs font-semibold text-sky-700 opacity-0 transition group-hover:opacity-100">
          Enviar correo →
        </span>
      </a>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#ddd7ca] bg-white p-5 shadow-[0_8px_28px_-22px_rgba(15,23,42,0.16)]">
      {inner}
    </div>
  )
}

function MailIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>
  )
}

export function ConcejoContactInfoSection({ content }) {
  const title =
    String(content?.contactSectionTitle || '').trim() || 'Contacto e información del Concejo'
  const subtitle = String(content?.contactSectionSubtitle || '').trim()
  const email = String(content?.contactEmail || '').trim()
  const commissionsDays = String(content?.commissionsSchedule || '').trim()
  const sessionsDays = String(content?.sessionsSchedule || '').trim()
  const sessionsLocation = String(content?.sessionsLocation || '').trim()
  const sessionsNote = String(content?.sessionsNote || '').trim()
  const phone = String(content?.contactPhone || '').trim()
  const address = String(content?.contactAddress || '').trim()
  const hours = String(content?.contactHours || '').trim()

  const hasPrimary = email || commissionsDays || sessionsDays
  const hasExtra = phone || address || hours || sessionsLocation || sessionsNote

  if (!hasPrimary && !hasExtra) return null

  const sessionsValue = [sessionsDays, sessionsLocation].filter(Boolean).join(' · ')

  return (
    <section
      id="contacto-concejo"
      className="mt-8 scroll-mt-28 overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm"
      aria-labelledby="contacto-concejo-heading"
    >
      <div className="border-b border-[#e8e4dc] bg-linear-to-r from-[#171b22] via-[#1e2430] to-[#171b22] px-5 py-6 sm:px-7 sm:py-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-300/95">
          Atención institucional
        </p>
        <h2
          id="contacto-concejo-heading"
          className="mt-2 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {subtitle}
          </p>
        ) : (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Correo oficial, calendario de comisiones y sesiones ordinarias del cuerpo legislativo.
          </p>
        )}
      </div>

      <div className="p-5 sm:p-7 lg:p-8">
        {hasPrimary ? (
          <div className="grid gap-4 md:grid-cols-3">
            {email ? (
              <InfoCard
                label="Correo del Concejo"
                value={email}
                href={`mailto:${email}`}
                icon={<MailIcon />}
              />
            ) : null}
            {commissionsDays ? (
              <InfoCard
                label="Días de comisión"
                value={commissionsDays}
                icon={<CalendarIcon />}
              />
            ) : null}
            {sessionsDays || sessionsLocation ? (
              <InfoCard
                label="Sesiones ordinarias"
                value={sessionsValue || sessionsDays}
                icon={<CalendarIcon />}
              />
            ) : null}
          </div>
        ) : null}

        {sessionsNote ? (
          <p className="mt-5 rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3.5 text-sm leading-relaxed text-sky-950">
            {sessionsNote}
          </p>
        ) : null}

        {hasExtra ? (
          <ul className="mt-5 grid gap-3 border-t border-[#e8e4dc] pt-5 sm:grid-cols-3">
            {phone ? (
              <li className="text-sm">
                <span className="font-bold text-[#171b22]">Teléfono: </span>
                <a className="text-sky-800 hover:text-sky-950" href={`tel:${phone.replace(/\s/g, '')}`}>
                  {phone}
                </a>
              </li>
            ) : null}
            {address ? (
              <li className="text-sm text-[#4b505a]">
                <span className="font-bold text-[#171b22]">Dirección: </span>
                {address}
              </li>
            ) : null}
            {hours ? (
              <li className="text-sm text-[#4b505a]">
                <span className="font-bold text-[#171b22]">Horario: </span>
                {hours}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

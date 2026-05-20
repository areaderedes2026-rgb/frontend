import {
  getServiceContactItemHref,
  getServiceContactTypeLabel,
  isServiceContactSectionVisible,
  normalizeServiceContactSection,
} from '../../utils/serviceContacts.js'

function ContactIcon({ type }) {
  const common = 'h-4 w-4 shrink-0'
  if (type === 'email') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16v10H4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
      </svg>
    )
  }
  if (type === 'whatsapp') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.989-1.414A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
      </svg>
    )
  }
  if (type === 'link') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" />
      </svg>
    )
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function ContactItemRow({ item }) {
  const href = getServiceContactItemHref(item)
  const label = String(item.label || '').trim() || getServiceContactTypeLabel(item.type)
  const value = String(item.value || '').trim()
  const note = String(item.note || '').trim()
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-800">
        <ContactIcon type={item.type} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-sky-800">
          {label}
        </span>
        {value ? (
          <span className="mt-1 block text-sm font-semibold text-[#171b22] sm:text-[15px]">{value}</span>
        ) : null}
        {note ? <span className="mt-1 block text-xs leading-relaxed text-[#4b505a]">{note}</span> : null}
      </span>
      {href ? (
        <span className="shrink-0 text-sm font-semibold text-sky-700 opacity-80 transition group-hover:opacity-100">
          →
        </span>
      ) : null}
    </>
  )

  const className =
    'group flex items-start gap-3 rounded-2xl border border-[#ddd7ca] bg-white px-4 py-3.5 transition hover:border-sky-200/90 hover:bg-sky-50/30'

  if (href) {
    const external = item.type === 'link' || item.type === 'whatsapp'
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {content}
        </a>
      )
    }
    return (
      <a href={href} className={className}>
        {content}
      </a>
    )
  }

  return <div className={className}>{content}</div>
}

export function ServiceContactSection({ contactSection, className = '' }) {
  const section = normalizeServiceContactSection(contactSection)
  if (!isServiceContactSectionVisible(section)) return null

  return (
    <section className={className}>
      <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-sky-800">{section.title}</h3>
      <ul className="mt-4 space-y-3">
        {section.items.map((item, idx) => (
          <li key={item.id || `contact-${idx}`}>
            <ContactItemRow item={item} />
          </li>
        ))}
      </ul>
    </section>
  )
}

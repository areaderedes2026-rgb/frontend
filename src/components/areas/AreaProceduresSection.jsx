import { useState } from 'react'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'

function IconDoc({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
    </svg>
  )
}

function contactHrefPhone(value) {
  const digits = String(value || '').replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : ''
}

function contactHrefEmail(value) {
  const email = String(value || '').trim()
  return email && email.includes('@') ? `mailto:${email}` : ''
}

function ProcedureCard({ item, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const name = String(item.name || '').trim() || 'Trámite'
  const description = String(item.description || '').trim()
  const steps = Array.isArray(item.steps) ? item.steps.filter(Boolean) : []
  const linkUrl = String(item.linkUrl || '').trim()
  const linkLabel = String(item.linkLabel || '').trim() || 'Ver trámite en línea'
  const phone = String(item.contactPhone || '').trim()
  const email = String(item.contactEmail || '').trim()
  const contactNote = String(item.contactNote || '').trim()
  const phoneHref = contactHrefPhone(phone)
  const emailHref = contactHrefEmail(email)
  const hasContact = Boolean(phone || email || contactNote)
  const hasExtras = Boolean(description || steps.length || linkUrl || hasContact)

  return (
    <article className="overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm transition hover:border-sky-200/80">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-4 text-left sm:px-5"
        aria-expanded={open}
      >
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-800">
          <IconDoc />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-bold tracking-tight text-[#171b22] sm:text-lg">
            {name}
          </span>
          {description && !open ? (
            <span className="mt-1 line-clamp-2 block text-sm text-[#4b505a]">{description}</span>
          ) : null}
        </span>
        <span
          className={`mt-2 shrink-0 text-slate-400 transition ${open ? 'rotate-90' : ''}`}
          aria-hidden
        >
          ▸
        </span>
      </button>

      {open && hasExtras ? (
        <div className="border-t border-[#e8e4dc] px-4 pb-5 pt-4 sm:px-5">
          {description ? (
            <p className="text-sm leading-relaxed text-[#4b505a] sm:text-[15px]">{description}</p>
          ) : null}

          {steps.length ? (
            <div className={description ? 'mt-5' : ''}>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-800">
                Pasos a seguir
              </p>
              <ol className="mt-3 space-y-2.5">
                {steps.map((step, idx) => (
                  <li
                    key={`${item.id}-step-${idx}`}
                    className="flex gap-3 rounded-xl border border-[#e8e4dc] bg-[#f8f7f3] px-3 py-2.5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="min-w-0 flex-1 text-sm leading-relaxed text-[#2f3440]">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {hasContact || linkUrl ? (
            <div
              className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center ${
                description || steps.length ? 'mt-5' : ''
              }`}
            >
              {hasContact ? (
                <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-xl border border-[#e8e4dc] bg-white px-3 py-3 sm:min-w-[12rem]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-800">
                    Contacto
                  </p>
                  {phone ? (
                    phoneHref ? (
                      <a
                        href={phoneHref}
                        className="text-sm font-semibold text-sky-800 hover:text-sky-950"
                      >
                        {phone}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-[#171b22]">{phone}</p>
                    )
                  ) : null}
                  {email ? (
                    emailHref ? (
                      <a
                        href={emailHref}
                        className="break-all text-sm font-semibold text-sky-800 hover:text-sky-950"
                      >
                        {email}
                      </a>
                    ) : (
                      <p className="break-all text-sm font-semibold text-[#171b22]">{email}</p>
                    )
                  ) : null}
                  {contactNote ? (
                    <p className="text-xs text-[#4b505a]">{contactNote}</p>
                  ) : null}
                </div>
              ) : null}
              {linkUrl ? (
                <a
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#2a313b] bg-[#171b22] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222831]"
                >
                  {linkLabel}
                  <span className="ml-1.5" aria-hidden>
                    ↗
                  </span>
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

export function AreaProceduresSection({ proceduresSection }) {
  const section = proceduresSection || {}
  const { title, intro, eyebrow = 'Gestión municipal', items = [] } = section
  if (!items.length) return null

  const heading = String(title || '').trim() || 'Trámites del área'

  return (
    <RevealOnScroll variant="slow">
      <section
        id="tramites-area"
        className="scroll-mt-[calc(var(--navbar-h,5rem)+1rem)]"
        aria-labelledby="tramites-area-title"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-800">{eyebrow}</p>
        <h2
          id="tramites-area-title"
          className="mt-2 text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl"
        >
          {heading}
        </h2>
        {intro ? (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#4b505a] sm:text-base">
            {intro}
          </p>
        ) : null}

        <div className="mt-6 space-y-4">
          {items.map((item, idx) => (
            <ProcedureCard key={item.id || `tram-${idx}`} item={item} defaultOpen={idx === 0} />
          ))}
        </div>
      </section>
    </RevealOnScroll>
  )
}

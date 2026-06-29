import { Link } from 'react-router-dom'
import { Modal } from '../ui/Modal.jsx'
import { ROUTES } from '../../utils/constants.js'

export function ServiceBadge({ children }) {
  return (
    <span className="inline-flex rounded-full border border-[#d8d5cd] bg-[#f8f7f3] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#3e434d]">
      {children}
    </span>
  )
}

function DetailSection({ title, children, empty = false }) {
  if (empty) return null
  return (
    <section className="rounded-2xl border border-[#e8e4dc] bg-[#f8f7f3]/60 p-4 sm:p-5">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-800">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function BulletList({ items }) {
  if (!items.length) return null
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-[#3e434d]">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-700" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function isExternalUrl(href) {
  return String(href || '').startsWith('http')
}

/**
 * Tarjeta uniforme del directorio de servicios (altura igual en grilla).
 */
export function MunicipalServiceCard({ service, onVerMas, className = '' }) {
  const summary = String(service?.summary || '').trim()
  const eta = String(service?.eta || '').trim()

  return (
    <article
      className={`group flex h-full min-h-[280px] flex-col rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm ring-1 ring-[#1a1d24]/5 transition duration-300 hover:-translate-y-1 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/10 ${className}`.trim()}
    >
      <div className="flex flex-wrap gap-2">
        {service?.category ? <ServiceBadge>{service.category}</ServiceBadge> : null}
        {service?.mode ? <ServiceBadge>{service.mode}</ServiceBadge> : null}
      </div>
      <h3 className="mt-3 text-lg font-bold tracking-tight text-[#171b22]">{service?.title}</h3>
      {summary ? (
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[#4b505a]">{summary}</p>
      ) : (
        <div className="flex-1" />
      )}
      {eta ? (
        <div className="mt-4 rounded-lg border border-sky-100 bg-sky-50/70 px-3 py-2 text-xs font-semibold text-sky-900">
          Tiempo estimado: {eta}
        </div>
      ) : null}
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={() => onVerMas?.(service)}
          className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-[#2a313b] bg-[#171b22] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222831] focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/45"
        >
          Ver más
          <span aria-hidden>→</span>
        </button>
      </div>
    </article>
  )
}

/**
 * Modal con el detalle completo del trámite.
 */
export function MunicipalServiceDetailModal({ open, service, onClose }) {
  if (!service) return null

  const description = String(service.description || service.summary || '').trim()
  const requirements = Array.isArray(service.requirements)
    ? service.requirements.map((x) => String(x || '').trim()).filter(Boolean)
    : []
  const docs = Array.isArray(service.docs)
    ? service.docs.map((x) => String(x || '').trim()).filter(Boolean)
    : []
  const linkUrl = String(service.linkUrl || service.linkHref || '').trim()
  const linkLabel = String(service.linkLabel || '').trim() || 'Más información'
  const eta = String(service.eta || '').trim()

  return (
    <Modal open={open} onClose={onClose} size="xlarge" title={service.title || 'Detalle del trámite'}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {service.category ? <ServiceBadge>{service.category}</ServiceBadge> : null}
          {service.mode ? <ServiceBadge>{service.mode}</ServiceBadge> : null}
        </div>

        {eta ? (
          <div className="rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm font-semibold text-sky-900">
            Tiempo estimado: {eta}
          </div>
        ) : null}

        <DetailSection title="Descripción" empty={!description}>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[#3e434d] sm:text-[15px]">
            {description}
          </p>
        </DetailSection>

        <DetailSection title="Requisitos" empty={!requirements.length}>
          <BulletList items={requirements} />
        </DetailSection>

        <DetailSection title="Documentación requerida" empty={!docs.length}>
          <BulletList items={docs} />
        </DetailSection>

        {linkUrl ? (
          <div className="flex flex-wrap gap-3">
            <a
              href={linkUrl}
              target={isExternalUrl(linkUrl) ? '_blank' : undefined}
              rel={isExternalUrl(linkUrl) ? 'noopener noreferrer' : undefined}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800"
            >
              {linkLabel}
              {isExternalUrl(linkUrl) ? (
                <span aria-hidden className="text-white/90">
                  ↗
                </span>
              ) : null}
            </a>
          </div>
        ) : null}

        <div className="rounded-2xl border border-[#ddd7ca] bg-white px-4 py-4 sm:px-5">
          <p className="text-sm leading-relaxed text-[#4b505a]">
            Si tenés alguna duda, consultanos a través de nuestro{' '}
            <Link
              to={ROUTES.atencionCiudadano}
              onClick={onClose}
              className="font-semibold text-sky-800 underline decoration-sky-300/80 underline-offset-2 transition hover:text-sky-950"
            >
              formulario web
            </Link>
            .
          </p>
        </div>
      </div>
    </Modal>
  )
}

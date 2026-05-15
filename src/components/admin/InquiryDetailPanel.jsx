import {
  DEFAULT_INQUIRY_WHATSAPP_TEMPLATE,
  normalizePhoneForWhatsapp,
} from '../../utils/inquiryWhatsapp.js'

const STATUS_META = {
  sin_resolver: {
    label: 'Sin resolver',
    card: 'border-amber-200 bg-amber-50 text-amber-800',
    dot: 'bg-amber-500',
    ring: 'ring-amber-200',
    accent: 'border-amber-400',
    hint: 'Revisá el mensaje. Cuando la tomes, marcala como leída para continuar el seguimiento.',
  },
  leida: {
    label: 'Leída',
    card: 'border-sky-200 bg-sky-50 text-sky-800',
    dot: 'bg-sky-500',
    ring: 'ring-sky-200',
    accent: 'border-sky-400',
    hint: 'En seguimiento. Podés responder al vecino y cerrarla como resuelta cuando corresponda.',
  },
  resuelta: {
    label: 'Resuelta',
    card: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-200',
    accent: 'border-emerald-400',
    hint: 'Consulta cerrada. Reabrila si el vecino necesita nuevo contacto.',
  },
}

const FLOW_STEPS = [
  { key: 'sin_resolver', label: 'Pendiente' },
  { key: 'leida', label: 'Leída' },
  { key: 'resuelta', label: 'Resuelta' },
]

const BTN_COMPACT =
  'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm'
const BTN_NEUTRAL = `${BTN_COMPACT} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const BTN_SKY = `${BTN_COMPACT} border border-sky-200 bg-sky-600 text-white hover:bg-sky-700`
const BTN_EMERALD = `${BTN_COMPACT} border border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700`
const BTN_AMBER = `${BTN_COMPACT} border border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300 hover:bg-amber-100`
const BTN_WHATSAPP = `${BTN_COMPACT} border border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-300 hover:bg-emerald-100/90`

function formatDateTime(value) {
  if (!value) return 'Sin fecha'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

function InquiryStatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.sin_resolver
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.card}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.label}
    </span>
  )
}

function StatusStepper({ currentStatus }) {
  const currentIndex = FLOW_STEPS.findIndex((s) => s.key === currentStatus)
  const activeIndex = currentIndex >= 0 ? currentIndex : 0

  return (
    <ol className="flex items-center gap-1 sm:gap-2" aria-label="Progreso de la consulta">
      {FLOW_STEPS.map((step, index) => {
        const done = index < activeIndex
        const active = index === activeIndex
        return (
          <li key={step.key} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
            {index > 0 ? (
              <span
                className={`hidden h-px flex-1 sm:block ${done || active ? 'bg-sky-300' : 'bg-slate-200'}`}
                aria-hidden
              />
            ) : null}
            <span
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-center sm:px-2 ${
                active ? 'bg-white/90 ring-2 ring-sky-200' : ''
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold sm:h-7 sm:w-7 sm:text-xs ${
                  done
                    ? 'bg-sky-600 text-white'
                    : active
                      ? 'bg-sky-100 text-sky-800 ring-2 ring-sky-500'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {done ? '✓' : index + 1}
              </span>
              <span
                className={`truncate text-[10px] font-semibold sm:text-xs ${
                  active ? 'text-sky-900' : done ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/** Qué acciones de estado mostrar según el estado actual. */
export function getInquiryStatusActions(status) {
  switch (status) {
    case 'sin_resolver':
      return { markLeida: true, markSinResolver: false, markResuelta: false }
    case 'leida':
      return { markLeida: false, markSinResolver: true, markResuelta: true }
    case 'resuelta':
      return { markLeida: true, markSinResolver: true, markResuelta: false }
    default:
      return { markLeida: true, markSinResolver: false, markResuelta: false }
  }
}

function WhatsAppGlyph({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function InquiryDetailPanel({
  inquiry,
  busy = false,
  onChangeStatus,
  onDownloadPdf,
  onWhatsApp,
  onDelete,
}) {
  const meta = STATUS_META[inquiry.status] || STATUS_META.sin_resolver
  const actions = getInquiryStatusActions(inquiry.status)
  const canWhatsApp = Boolean(normalizePhoneForWhatsapp(inquiry.phone))
  const hasStatusActions =
    actions.markLeida || actions.markSinResolver || actions.markResuelta

  return (
    <div className="space-y-5">
      <section
        className={`rounded-2xl border border-slate-200/90 bg-linear-to-br from-slate-50 to-white p-4 sm:p-5 ring-1 ${meta.ring}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Estado actual
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <InquiryStatusPill status={inquiry.status} />
              <span className="text-xs text-slate-500">
                Actualizado {formatDateTime(inquiry.updatedAt)}
              </span>
            </div>
          </div>
          <StatusStepper currentStatus={inquiry.status} />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{meta.hint}</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-xl border border-slate-200/80 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Vecino</p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {inquiry.firstName} {inquiry.lastName}
          </p>
          <p className="mt-1 text-sm text-slate-600">DNI {inquiry.dni}</p>
        </article>
        <article className="rounded-xl border border-slate-200/80 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Contacto</p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {inquiry.phone || 'Sin teléfono'}
          </p>
          <p className="mt-1 truncate text-sm text-slate-600">
            {inquiry.email || 'Sin correo'}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200/80 bg-white p-4 sm:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Tema</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{inquiry.topic || '—'}</p>
          <p className="mt-2 text-xs text-slate-500">
            Recibida {formatDateTime(inquiry.createdAt)}
          </p>
        </article>
      </section>

      <article className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Mensaje</p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
          {inquiry.message}
        </p>
      </article>

      {hasStatusActions ? (
        <section
          className={`rounded-xl border border-slate-200/80 border-l-4 bg-white p-4 shadow-sm sm:p-5 ${meta.accent}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Seguimiento
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.markLeida ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => onChangeStatus('leida')}
                className={inquiry.status === 'resuelta' ? BTN_NEUTRAL : BTN_SKY}
              >
                {inquiry.status === 'resuelta' ? 'Reabrir (leída)' : 'Marcar como leída'}
              </button>
            ) : null}
            {actions.markResuelta ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => onChangeStatus('resuelta')}
                className={BTN_EMERALD}
              >
                Marcar como resuelta
              </button>
            ) : null}
            {actions.markSinResolver ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => onChangeStatus('sin_resolver')}
                className={BTN_AMBER}
              >
                Volver a pendiente
              </button>
            ) : null}
          </div>
          {busy ? (
            <p className="mt-2 text-xs text-slate-500">Actualizando estado…</p>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Comunicación y archivo
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !canWhatsApp}
            onClick={onWhatsApp}
            className={BTN_WHATSAPP}
            title={
              canWhatsApp
                ? 'Abrir WhatsApp con mensaje predefinido'
                : 'No hay teléfono válido'
            }
          >
            <WhatsAppGlyph />
            WhatsApp
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDownloadPdf}
            className={BTN_NEUTRAL}
          >
            Descargar PDF
          </button>
        </div>
        {!canWhatsApp ? (
          <p className="mt-2 text-xs text-amber-700">
            WhatsApp no disponible: el teléfono del vecino no es válido.
          </p>
        ) : null}
      </section>

      <section className="flex justify-end border-t border-slate-100 pt-4">
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          className="text-sm font-semibold text-red-600 underline-offset-2 transition hover:text-red-800 hover:underline disabled:opacity-50"
        >
          Eliminar consulta
        </button>
      </section>
    </div>
  )
}

export { InquiryStatusPill, STATUS_META, DEFAULT_INQUIRY_WHATSAPP_TEMPLATE }
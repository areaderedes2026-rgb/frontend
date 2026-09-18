import { useId, useMemo, useState } from 'react'
import {
  countPlainWords,
  FDC_FAQ_INQUIRY_MAX_WORDS,
  FDC_FAQ_INQUIRY_MIN_WORDS,
} from '../../data/fdcContent.js'
import { createFdcFaqInquiry } from '../../services/fdcService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { formErrorClass, inputClass, textareaClass } from '../ui/formStyles.js'

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  topic: '',
  message: '',
  acceptPrivacy: false,
}

const fieldClass = `${inputClass} min-h-12 text-base sm:min-h-11 sm:text-sm`
const selectClass = `${fieldClass} appearance-none bg-[length:1rem] bg-[right_0.85rem_center] bg-no-repeat pr-10`
const selectChevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234b505a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")"

function labelTone(dark) {
  return dark ? 'text-white/90' : 'text-[#3e434d]'
}

export function FdcFaqInquiryForm({ faq, dark = false }) {
  const formId = useId()
  const [form, setForm] = useState(EMPTY_FORM)
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')
  const [successId, setSuccessId] = useState(null)

  const topics = useMemo(() => {
    const list = Array.isArray(faq?.inquiryTopics) ? faq.inquiryTopics : []
    return list.filter((item) => String(item?.label || '').trim())
  }, [faq?.inquiryTopics])

  const wordCount = countPlainWords(form.message)
  const wordsLeft = FDC_FAQ_INQUIRY_MAX_WORDS - wordCount

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFormError('')
    setSuccessId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setSuccessId(null)

    const fullName = form.fullName.trim()
    const phone = form.phone.trim()
    const topic = form.topic.trim()
    const message = form.message.trim()
    const nameParts = fullName.split(/\s+/).filter(Boolean)

    if (nameParts.length < 2 || fullName.length < 5) {
      setFormError('Ingresá tu nombre completo (nombre y apellido).')
      return
    }
    if (phone.length < 6) {
      setFormError('Ingresá un celular válido para responderte por WhatsApp.')
      return
    }
    if (!topic) {
      setFormError('Elegí el motivo de tu consulta.')
      return
    }
    if (wordCount < FDC_FAQ_INQUIRY_MIN_WORDS) {
      setFormError(`Escribí al menos ${FDC_FAQ_INQUIRY_MIN_WORDS} palabras.`)
      return
    }
    if (wordCount > FDC_FAQ_INQUIRY_MAX_WORDS) {
      setFormError(`La consulta puede tener como máximo ${FDC_FAQ_INQUIRY_MAX_WORDS} palabras.`)
      return
    }
    if (!form.acceptPrivacy) {
      setFormError('Tenés que aceptar el uso de tus datos para gestionar la consulta.')
      return
    }
    if (!isApiConfigured()) {
      setFormError('El formulario no está disponible en este momento. Intentá más tarde.')
      return
    }

    setSending(true)
    try {
      const inquiry = await createFdcFaqInquiry({ fullName, phone, topic, message })
      setForm(EMPTY_FORM)
      setSuccessId(inquiry?.id || true)
    } catch (err) {
      setFormError(err.message || 'No se pudo enviar la consulta. Intentá de nuevo.')
    } finally {
      setSending(false)
    }
  }

  const cardClass = dark
    ? 'rounded-3xl border border-white/14 bg-white/[0.06] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur sm:p-6'
    : 'rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.18)] sm:p-6'

  const titleClass = dark
    ? 'font-serif text-2xl font-bold tracking-tight text-white'
    : 'font-serif text-2xl font-bold tracking-tight text-[#171b22]'

  const introClass = dark ? 'mt-2 text-sm leading-relaxed text-white/75' : 'mt-2 text-sm leading-relaxed text-[#4b505a]'
  const hintClass = dark ? 'text-xs text-white/50' : 'text-xs text-slate-500'
  const checkboxClass = dark
    ? 'flex cursor-pointer gap-3 rounded-xl border border-white/14 bg-white/[0.04] p-4 text-sm leading-snug text-white/80'
    : 'flex cursor-pointer gap-3 rounded-xl border border-[#ddd7ca] bg-[#f8f7f3] p-4 text-sm leading-snug text-[#3e434d]'
  const submitClass = dark
    ? 'inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#d4b483] px-5 text-sm font-bold uppercase tracking-[0.12em] text-[#171b22] transition hover:bg-[#e0c49a] disabled:cursor-not-allowed disabled:opacity-60'
    : 'inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-sky-800 px-5 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <div id="consulta-fdc" className={`${cardClass} scroll-mt-[calc(var(--navbar-h,5rem)+4.5rem)]`}>
      <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${dark ? 'text-[#d4b483]' : 'text-sky-800'}`}>
        Consulta rápida
      </p>
      <h3 className={`mt-2 ${titleClass}`}>{faq?.inquiryTitle || '¿No encontraste tu respuesta?'}</h3>
      <p className={introClass}>
        {faq?.inquiryIntro ||
          'Dejanos tu consulta y te respondemos por WhatsApp. El mensaje debe ser breve, de hasta 50 palabras.'}
      </p>

      {successId ? (
        <p
          className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          Recibimos tu consulta{typeof successId === 'number' ? ` N° ${successId}` : ''}. Te vamos a
          responder por WhatsApp al celular que indicaste.
        </p>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <p className={formErrorClass} role="alert">
            {formError}
          </p>
        ) : null}

        <label className={`flex min-w-0 flex-col gap-1.5 text-sm font-medium ${labelTone(dark)}`} htmlFor={`${formId}-nombre`}>
          Nombre completo *
          <input
            id={`${formId}-nombre`}
            className={fieldClass}
            value={form.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            autoComplete="name"
            disabled={sending}
            placeholder="Nombre y apellido"
          />
        </label>

        <label className={`flex min-w-0 flex-col gap-1.5 text-sm font-medium ${labelTone(dark)}`} htmlFor={`${formId}-tel`}>
          Celular (WhatsApp) *
          <input
            id={`${formId}-tel`}
            type="tel"
            className={fieldClass}
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            autoComplete="tel"
            inputMode="tel"
            disabled={sending}
            placeholder="Ej. 381 555 1234"
          />
        </label>

        <label className={`flex min-w-0 flex-col gap-1.5 text-sm font-medium ${labelTone(dark)}`} htmlFor={`${formId}-motivo`}>
          Motivo *
          <select
            id={`${formId}-motivo`}
            className={selectClass}
            style={{ backgroundImage: selectChevron }}
            value={form.topic}
            onChange={(e) => updateField('topic', e.target.value)}
            disabled={sending}
          >
            <option value="">Elegí un motivo…</option>
            {topics.map((item) => (
              <option key={item.id || item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className={`flex min-w-0 flex-col gap-1.5 text-sm font-medium ${labelTone(dark)}`} htmlFor={`${formId}-mensaje`}>
          Tu consulta *
          <textarea
            id={`${formId}-mensaje`}
            className={`${textareaClass} min-h-28`}
            rows={4}
            value={form.message}
            onChange={(e) => updateField('message', e.target.value)}
            disabled={sending}
            placeholder="Contanos en pocas palabras qué necesitás saber."
          />
          <span className={hintClass}>
            {wordCount} / {FDC_FAQ_INQUIRY_MAX_WORDS} palabras
            {wordsLeft < 0 ? ' · te pasaste del límite' : wordCount > 0 ? ` · quedan ${wordsLeft}` : ''}
          </span>
        </label>

        <label className={checkboxClass}>
          <input
            type="checkbox"
            checked={form.acceptPrivacy}
            onChange={(e) => updateField('acceptPrivacy', e.target.checked)}
            disabled={sending}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span>
            Acepto que mis datos se usen para responder esta consulta por WhatsApp, conforme a la
            normativa municipal vigente.
          </span>
        </label>

        <button type="submit" className={submitClass} disabled={sending}>
          {sending ? 'Enviando…' : 'Enviar consulta'}
        </button>
      </form>
    </div>
  )
}

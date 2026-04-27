import { useCallback, useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { CitizenPageFloats } from '../components/atencion/CitizenPageFloats.jsx'
import { RevealOnScroll } from '../components/home/RevealOnScroll.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Container } from '../components/ui/Container.jsx'
import { Toast } from '../components/ui/Toast.jsx'
import { formErrorClass, inputClass, labelClass, textareaClass } from '../components/ui/formStyles.js'
import {
  DEFAULT_CITIZEN_ATTENTION_CONTENT,
  mergeCitizenAttentionContent,
} from '../data/citizenAttentionContent.js'
import { createCitizenInquiry, fetchCitizenAttentionContent } from '../services/citizenAttentionService.js'
import { isApiConfigured } from '../utils/apiConfig.js'
import { ROUTES } from '../utils/constants.js'

function ChannelIcon({ name, className = 'h-6 w-6' }) {
  const common = { className, fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.65, stroke: 'currentColor' }
  switch (name) {
    case 'building':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      )
    case 'phone':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
        </svg>
      )
    case 'mail':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 5.314 5.893 3.293L21.75 12M7.217 10.093 2.25 7.188m5.393 4.313L2.25 15.75" />
        </svg>
      )
  }
}

function FaqAccordion({ faq, tips }) {
  const [openId, setOpenId] = useState(faq[0]?.id ?? null)
  const safeOpenId = faq.some((item) => item.id === openId) ? openId : (faq[0]?.id ?? null)

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-5">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-sky-800">Preguntas frecuentes</h2>
        <p className="mt-2 font-serif text-2xl font-bold text-[#171b22]">Antes de escribirnos</p>
        <p className="mt-3 text-sm leading-relaxed text-[#4b505a]">
          Acá resolvemos las dudas más comunes. Si tu caso es particular, el formulario nos ayuda a
          canalizarlo mejor.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-[#4b505a]">
          {tips.map((tip, i) => (
            <li key={`tip-${i}`} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
              {tip}
            </li>
          ))}
        </ul>
      </div>
      <div className="lg:col-span-7">
        <div className="divide-y divide-[#ddd7ca] rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
          {faq.map((item) => {
            const open = safeOpenId === item.id
            return (
              <div key={item.id} className="px-1">
                <button
                  type="button"
                  id={`faq-btn-${item.id}`}
                  aria-expanded={open}
                  aria-controls={`faq-panel-${item.id}`}
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-[#f8f7f3] sm:px-5 sm:py-5"
                >
                  <span className="text-sm font-semibold text-[#171b22] sm:text-base">{item.q}</span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#ddd7ca] bg-white text-slate-500 transition ${
                      open ? 'rotate-180 border-sky-200 text-sky-700' : ''
                    }`}
                    aria-hidden
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </button>
                <div
                  id={`faq-panel-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${item.id}`}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 pb-4 text-sm leading-relaxed text-[#4b505a] sm:px-5 sm:pb-5">{item.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  dni: '',
  phone: '',
  topic: '',
  message: '',
  acceptPrivacy: false,
}

export function AtencionCiudadano() {
  const formId = useId()
  const [content, setContent] = useState(DEFAULT_CITIZEN_ATTENTION_CONTENT)
  const [loadingContent, setLoadingContent] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingContent(true)
      setLoadError('')
      try {
        const remote = await fetchCitizenAttentionContent()
        const merged = mergeCitizenAttentionContent(
          DEFAULT_CITIZEN_ATTENTION_CONTENT,
          remote || {},
        )
        if (!cancelled) setContent(merged)
      } catch (e) {
        if (!cancelled) {
          setContent(DEFAULT_CITIZEN_ATTENTION_CONTENT)
          setLoadError(e.message || 'No se pudo cargar la sección de atención.')
        }
      } finally {
        if (!cancelled) setLoadingContent(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFormError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError('Completá nombre y apellido.')
      return
    }
    const dni = String(form.dni || '').replace(/[^\d]/g, '')
    if (!dni || dni.length < 7 || dni.length > 10) {
      setFormError('Ingresá un DNI válido.')
      return
    }
    if (!form.topic) {
      setFormError('Elegí un tema para tu consulta.')
      return
    }
    if (!form.message.trim() || form.message.trim().length < 12) {
      setFormError('Escribí un mensaje de al menos 12 caracteres.')
      return
    }
    if (!form.acceptPrivacy) {
      setFormError('Tenés que aceptar el tratamiento de datos para continuar.')
      return
    }
    if (!isApiConfigured()) {
      setToast({
        type: 'error',
        message: 'No hay conexión disponible con el backend para enviar consultas.',
      })
      return
    }
    setSending(true)
    try {
      const inquiry = await createCitizenInquiry({ ...form, dni })
      setToast({
        type: 'success',
        message: inquiry?.id
          ? `Consulta enviada. Número de seguimiento: #${inquiry.id}.`
          : 'Consulta enviada correctamente.',
      })
      setForm(EMPTY_FORM)
    } catch (e2) {
      setToast({ type: 'error', message: e2.message || 'No se pudo enviar la consulta.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {toast ? <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} /> : null}
      <CitizenPageFloats />

      <section className="relative -mt-[calc(var(--navbar-h,5rem)+1.5rem)] overflow-hidden bg-linear-to-b from-[#f1eee8] via-[#f7f7f5] to-[#fcfcfa] pb-12 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-16">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_20%_-10%,rgba(56,189,248,0.12),transparent_65%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_100%_10%,rgba(15,23,42,0.12),transparent_70%)]"
          aria-hidden
        />

        <div className="relative min-h-[52dvh] overflow-hidden border-b border-white/10 bg-[#171b22] sm:min-h-[56dvh] lg:min-h-[58dvh]">
          <div className="relative min-h-[52dvh] sm:min-h-[56dvh] lg:min-h-[58dvh]">
            <img
              src={content.heroImageUrl}
              alt=""
              width={1920}
              height={1080}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
            />
            <div
              className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/88 to-slate-900/25"
              aria-hidden
            />
            <Container className="relative z-10 flex min-h-[52dvh] flex-col justify-center pt-[calc(var(--navbar-h,5rem)+1rem)] pb-8 sm:min-h-[56dvh] sm:pt-[calc(var(--navbar-h,5rem)+1.5rem)] sm:pb-10 lg:min-h-[58dvh] lg:pb-12">
              <p className="hero-enter-eyebrow text-[11px] font-bold uppercase tracking-[0.28em] text-sky-200 sm:text-xs">
                {content.heroEyebrow}
              </p>
              <h1 className="hero-enter-title mt-2 max-w-3xl font-serif text-3xl font-bold tracking-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl">
                {content.heroTitle}
              </h1>
              <p className="hero-enter-subtitle mt-3 max-w-2xl text-sm leading-relaxed text-slate-100/95 sm:text-base">
                {content.heroSubtitle}
              </p>
              <div className="hero-enter-actions mt-6 flex flex-wrap gap-3">
                <a
                  href="#consulta-ciudadano"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#171b22] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222831]"
                >
                  Dejar consulta
                </a>
                <Link
                  to={ROUTES.services}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/45 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/15"
                >
                  Ver servicios
                </Link>
              </div>
            </Container>
          </div>
        </div>

        <Container className="relative">
          <RevealOnScroll variant="slow">
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {content.channels.map((ch) => (
                <article
                  key={ch.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm ring-1 ring-[#1a1d24]/5 transition duration-300 hover:-translate-y-1 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/10 sm:p-6"
                >
                  <div
                    className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#2a313b] bg-[#171b22] text-sky-200 shadow-md transition group-hover:scale-105"
                  >
                    <ChannelIcon name={ch.icon} />
                  </div>
                  <h2 className="text-base font-bold text-[#171b22]">{ch.title}</h2>
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">{ch.subtitle}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#4b505a]">{ch.description}</p>
                </article>
              ))}
            </div>
          </RevealOnScroll>

          <RevealOnScroll variant="slow" delayMs={60} className="mt-12 lg:mt-16">
            <FaqAccordion faq={content.faq} tips={content.tips} />
          </RevealOnScroll>

          <RevealOnScroll variant="newsCardSlow" delayMs={120}>
            <div
            id="consulta-ciudadano"
            className="mt-12 scroll-mt-[calc(var(--navbar-h,5rem)+1rem)] rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.18)] sm:mt-16 sm:p-8 lg:p-10"
          >
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-xs font-bold uppercase tracking-[0.2em] text-sky-800">
                Consulta web
              </h2>
              <p className="mt-2 text-center font-serif text-2xl font-bold text-[#171b22] sm:text-3xl">
                Escribinos desde acá
              </p>
              <p className="mx-auto mt-2 max-w-xl text-center text-sm leading-relaxed text-[#4b505a]">
                {content.formIntroText}
              </p>
              {loadError ? (
                <p className={`${formErrorClass} mt-4`} role="alert">
                  {loadError}
                </p>
              ) : null}

              <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
                {formError ? (
                  <p className={formErrorClass} role="alert">
                    {formError}
                  </p>
                ) : null}
                <label className={labelClass} htmlFor={`${formId}-dni`}>
                  DNI *
                  <input
                    id={`${formId}-dni`}
                    className={inputClass}
                    value={form.dni}
                    onChange={(e) => updateField('dni', e.target.value)}
                    inputMode="numeric"
                    autoComplete="off"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass} htmlFor={`${formId}-nombre`}>
                    Nombre *
                    <input
                      id={`${formId}-nombre`}
                      className={inputClass}
                      value={form.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      autoComplete="given-name"
                    />
                  </label>
                  <label className={labelClass} htmlFor={`${formId}-apellido`}>
                    Apellido *
                    <input
                      id={`${formId}-apellido`}
                      className={inputClass}
                      value={form.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      autoComplete="family-name"
                    />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass} htmlFor={`${formId}-tel`}>
                    Teléfono (opcional)
                    <input
                      id={`${formId}-tel`}
                      type="tel"
                      className={inputClass}
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="Ej. 3862 …"
                    />
                  </label>
                </div>
                <label className={labelClass} htmlFor={`${formId}-tema`}>
                  Tema *
                  <select
                    id={`${formId}-tema`}
                    className={inputClass}
                    value={form.topic}
                    onChange={(e) => updateField('topic', e.target.value)}
                  >
                    <option value="">Elegí un tema…</option>
                    {content.formTopics.map((opt) => (
                      <option key={opt.value || 'empty'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass} htmlFor={`${formId}-mensaje`}>
                  Mensaje *
                  <textarea
                    id={`${formId}-mensaje`}
                    className={textareaClass}
                    rows={5}
                    value={form.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    placeholder="Contanos lugar, fecha u otros datos que ayuden a entender tu consulta."
                  />
                </label>
                <label className="flex cursor-pointer gap-3 rounded-xl border border-[#ddd7ca] bg-[#f8f7f3] p-4 text-sm leading-snug text-[#3e434d]">
                  <input
                    type="checkbox"
                    checked={form.acceptPrivacy}
                    onChange={(e) => updateField('acceptPrivacy', e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span>
                    Acepto que mis datos se utilicen para gestionar esta consulta conforme a la
                    normativa municipal vigente.
                  </span>
                </label>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="submit" className="w-full sm:w-auto" disabled={sending || loadingContent}>
                    {sending ? 'Enviando…' : 'Enviar consulta'}
                  </Button>
                  <p className="text-center text-xs text-slate-500 sm:text-right">
                    Te responderemos por los canales municipales disponibles.
                  </p>
                </div>
              </form>
            </div>
          </div>
          </RevealOnScroll>

        </Container>
      </section>
    </>
  )
}

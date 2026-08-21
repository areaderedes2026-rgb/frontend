import { useMemo, useState } from 'react'
import { isFdcOtherRubro } from '../../data/fdcContent.js'
import { createFdcStallApplication } from '../../services/fdcService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { formErrorClass, inputClass, labelClass } from '../ui/formStyles.js'

const EMPTY_FORM = {
  fullName: '',
  dni: '',
  address: '',
  locality: '',
  phone: '',
  email: '',
  rubro: '',
  rubroOther: '',
  participatedBefore: null,
  participationYears: '',
}

const selectClass = `${inputClass} appearance-none bg-[length:1rem] bg-[right_0.85rem_center] bg-no-repeat pr-10`
const selectChevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234b505a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")"
const fieldInputClass = `${inputClass} min-h-12 text-base sm:min-h-11 sm:text-sm`

function FieldLabel({ children, required = false }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      <span>{children}</span>
      {required ? (
        <span className="text-xs font-semibold text-amber-800" aria-hidden>
          *
        </span>
      ) : null}
    </span>
  )
}

function SectionTitle({ children }) {
  return (
    <header className="border-b border-[#ebe7df] pb-2.5">
      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">{children}</h3>
    </header>
  )
}

export function FdcStallApplicationForm({
  formNotice = '',
  formOpen = true,
  windowMessage = '',
  rubros = [],
  formEyebrow = 'Preinscripción 2026',
  formHeading = 'Completá tus datos',
  onSuccess,
}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')

  const rubroOptions = useMemo(() => {
    const list = Array.isArray(rubros)
      ? rubros.map((r) => String(r || '').trim()).filter(Boolean)
      : []
    return list
  }, [rubros])

  const disabled = !formOpen || sending

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFormError('')
  }

  const notice = useMemo(
    () =>
      formNotice ||
      'IMPORTANTE: La presente preinscripción no implica la adjudicación del espacio. La organización evaluará cada solicitud de acuerdo con la disponibilidad de lugares y el cumplimiento de los requisitos establecidos.',
    [formNotice],
  )

  async function handleSubmit(e) {
    e.preventDefault()
    if (!formOpen) {
      setFormError(windowMessage || 'La preinscripción no está abierta en este momento.')
      return
    }
    if (!form.fullName.trim()) {
      setFormError('Completá apellido y nombre.')
      return
    }
    const dni = String(form.dni || '').replace(/[^\d]/g, '')
    if (!dni || dni.length < 7 || dni.length > 10) {
      setFormError('Ingresá un DNI válido (solo números, 7 a 10 dígitos).')
      return
    }
    if (!form.address.trim()) {
      setFormError('Completá el domicilio.')
      return
    }
    if (!form.locality.trim()) {
      setFormError('Completá la localidad.')
      return
    }
    const phone = String(form.phone || '').trim()
    if (!phone || phone.length < 6) {
      setFormError('Completá un teléfono válido (mínimo 6 caracteres).')
      return
    }
    const email = form.email.trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Ingresá un correo electrónico válido.')
      return
    }
    if (!form.rubro) {
      setFormError('Seleccioná un rubro.')
      return
    }
    if (rubroOptions.length && !rubroOptions.includes(form.rubro)) {
      setFormError('Seleccioná un rubro válido.')
      return
    }
    if (isFdcOtherRubro(form.rubro) && !form.rubroOther.trim()) {
      setFormError('Indicá el rubro en «Otro».')
      return
    }
    if (form.participatedBefore == null) {
      setFormError('Indicá si participaste anteriormente en la fiesta.')
      return
    }
    if (form.participatedBefore && !form.participationYears.trim()) {
      setFormError('Indicá el/los año/s de participación.')
      return
    }
    if (!isApiConfigured()) {
      setFormError('El servicio no está disponible en este momento. Intentá más tarde.')
      return
    }

    setSending(true)
    setFormError('')
    try {
      const result = await createFdcStallApplication({
        fullName: form.fullName.trim(),
        dni,
        address: form.address.trim(),
        locality: form.locality.trim(),
        phone,
        email,
        rubro: form.rubro,
        rubroOther: isFdcOtherRubro(form.rubro) ? form.rubroOther.trim() : '',
        participatedBefore: Boolean(form.participatedBefore),
        participationYears: form.participatedBefore ? form.participationYears.trim() : '',
      })
      setForm(EMPTY_FORM)
      onSuccess?.({
        ...result,
        application: {
          ...(result?.application || {}),
          email: result?.application?.email || email,
        },
      })
    } catch (err) {
      setFormError(err.message || 'No se pudo enviar la preinscripción.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="block w-full" noValidate>
      <div className="w-full overflow-hidden rounded-2xl border border-[#ddd7ca] bg-white shadow-[0_20px_50px_-28px_rgba(23,27,34,0.4)] sm:rounded-3xl">
        <div className="border-b border-[#e8e5dd] bg-linear-to-br from-[#f8f4ec] via-white to-[#f3f7fb] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 xl:px-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-800 sm:text-xs">
            {formEyebrow || 'Preinscripción 2026'}
          </p>
          <h2 className="mt-1.5 font-serif text-xl font-bold tracking-tight text-[#171b22] sm:text-2xl lg:text-3xl">
            {formHeading || 'Completá tus datos'}
          </h2>
        </div>

        {/* Campos del formulario — ancho completo, sin columna lateral */}
        <div className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10 xl:py-9">
          <div className="flex w-full flex-col gap-7 lg:gap-8">
            {!formOpen ? (
              <div
                className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm leading-relaxed text-amber-950 sm:px-5"
                role="status"
              >
                {windowMessage || 'La preinscripción no está abierta en este momento.'}
              </div>
            ) : null}

            <section className="w-full space-y-4">
              <SectionTitle>Datos personales</SectionTitle>
              <fieldset
                disabled={disabled}
                className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-12"
              >
                <label className={`${labelClass} sm:col-span-2 lg:col-span-4 xl:col-span-8`}>
                  <FieldLabel required>Apellido y nombre</FieldLabel>
                  <input
                    className={fieldInputClass}
                    value={form.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    autoComplete="name"
                    required
                    placeholder="Ej. Pérez, María"
                  />
                </label>
                <label className={`${labelClass} lg:col-span-2 xl:col-span-4`}>
                  <FieldLabel required>DNI</FieldLabel>
                  <input
                    className={fieldInputClass}
                    value={form.dni}
                    onChange={(e) => updateField('dni', e.target.value)}
                    inputMode="numeric"
                    required
                    placeholder="Solo números"
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2 lg:col-span-4 xl:col-span-8`}>
                  <FieldLabel required>Domicilio</FieldLabel>
                  <input
                    className={fieldInputClass}
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    autoComplete="street-address"
                    required
                    placeholder="Calle y número"
                  />
                </label>
                <label className={`${labelClass} lg:col-span-2 xl:col-span-4`}>
                  <FieldLabel required>Localidad</FieldLabel>
                  <input
                    className={fieldInputClass}
                    value={form.locality}
                    onChange={(e) => updateField('locality', e.target.value)}
                    required
                    placeholder="Ej. Trancas"
                  />
                </label>
                <label className={`${labelClass} sm:col-span-1 lg:col-span-3 xl:col-span-6`}>
                  <FieldLabel required>Teléfono</FieldLabel>
                  <input
                    className={fieldInputClass}
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    autoComplete="tel"
                    required
                    placeholder="Con código de área"
                  />
                </label>
                <label className={`${labelClass} sm:col-span-1 lg:col-span-3 xl:col-span-6`}>
                  <FieldLabel required>Correo electrónico</FieldLabel>
                  <input
                    type="email"
                    className={fieldInputClass}
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    autoComplete="email"
                    required
                    placeholder="tu@email.com"
                  />
                </label>
              </fieldset>
            </section>

            <div className="grid w-full gap-7 sm:gap-8 md:grid-cols-2 md:gap-6 xl:gap-8">
              <section className="w-full space-y-4">
                <SectionTitle>Rubro</SectionTitle>
                <fieldset disabled={disabled} className="space-y-4">
                  <label className={labelClass}>
                    <FieldLabel required>Seleccioná el rubro de tu puesto</FieldLabel>
                    <select
                      className={`${selectClass} min-h-12 text-base sm:min-h-11 sm:text-sm`}
                      style={{ backgroundImage: selectChevron }}
                      value={form.rubro}
                      onChange={(e) => updateField('rubro', e.target.value)}
                      required
                    >
                      <option value="">Elegí una opción…</option>
                      {rubroOptions.map((rubro) => (
                        <option key={rubro} value={rubro}>
                          {rubro}
                        </option>
                      ))}
                    </select>
                  </label>
                  {isFdcOtherRubro(form.rubro) ? (
                    <label className={labelClass}>
                      <FieldLabel required>Especificá el rubro</FieldLabel>
                      <input
                        className={fieldInputClass}
                        value={form.rubroOther}
                        onChange={(e) => updateField('rubroOther', e.target.value)}
                        placeholder="Describí tu actividad"
                      />
                    </label>
                  ) : null}
                </fieldset>
              </section>

              <section className="w-full space-y-4">
                <SectionTitle>Experiencia</SectionTitle>
                <fieldset disabled={disabled} className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      ¿Participaste anteriormente en la Fiesta Nacional e Internacional del Caballo?{' '}
                      <span className="text-amber-800" aria-hidden>
                        *
                      </span>
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2.5">
                      {[
                        { value: true, label: 'Sí' },
                        { value: false, label: 'No' },
                      ].map((opt) => {
                        const active = form.participatedBefore === opt.value
                        return (
                          <button
                            key={String(opt.value)}
                            type="button"
                            disabled={disabled}
                            onClick={() => updateField('participatedBefore', opt.value)}
                            className={`min-h-12 rounded-xl border text-sm font-semibold transition sm:min-h-11 ${
                              active
                                ? 'border-[#171b22] bg-[#171b22] text-white shadow-sm'
                                : 'border-[#ddd7ca] bg-[#fcfcfa] text-[#171b22] hover:border-sky-300 hover:bg-sky-50'
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                            aria-pressed={active}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  {form.participatedBefore ? (
                    <label className={labelClass}>
                      <FieldLabel required>Indicá el/los año/s</FieldLabel>
                      <input
                        className={fieldInputClass}
                        value={form.participationYears}
                        onChange={(e) => updateField('participationYears', e.target.value)}
                        placeholder="Ej. 2022, 2024"
                      />
                    </label>
                  ) : null}
                </fieldset>
              </section>
            </div>

            {formError ? (
              <div className={`w-full ${formErrorClass}`} role="alert">
                {formError}
              </div>
            ) : null}

            <div className="flex w-full justify-center border-t border-[#ebe7df] pt-5">
              <button
                type="submit"
                disabled={disabled}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#171b22] px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-56"
              >
                {sending ? 'Enviando…' : 'Enviar preinscripción'}
              </button>
            </div>
          </div>
        </div>

        {/* Avisos debajo del formulario, mismo ancho completo — nunca al costado */}
        <div className="w-full border-t border-[#ebe7df] bg-[#fcfcfa] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 xl:px-10">
          <div className="flex w-full flex-col gap-4 sm:gap-5 lg:flex-row lg:items-stretch">
            <div className="min-w-0 flex-1 rounded-2xl border border-amber-200/90 bg-amber-50/95 px-4 py-4 text-sm leading-relaxed text-amber-950 sm:px-5 sm:py-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-900">
                Aviso importante
              </p>
              <p className="mt-2">{notice}</p>
            </div>
            <div className="min-w-0 flex-1 rounded-2xl border border-[#ddd7ca] bg-white px-4 py-4 sm:px-5 sm:py-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
                Documentación a presentar
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-[#171b22]">
                <li className="flex gap-2.5">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-700"
                    aria-hidden
                  />
                  <span>
                    <strong className="font-semibold">Fotocopia de DNI</strong> — se solicitará en el
                    proceso de evaluación / adjudicación.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

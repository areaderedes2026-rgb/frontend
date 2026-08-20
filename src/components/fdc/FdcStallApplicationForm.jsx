import { useMemo, useState } from 'react'
import { FDC_RUBROS } from '../../data/fdcContent.js'
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

function FieldLabel({ children, required = false, hint = null }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      <span>{children}</span>
      {required ? (
        <span className="text-xs font-semibold text-amber-800" aria-hidden>
          *
        </span>
      ) : null}
      {hint ? <span className="w-full text-xs font-normal text-slate-500">{hint}</span> : null}
    </span>
  )
}

export function FdcStallApplicationForm({
  formNotice = '',
  formOpen = true,
  windowMessage = '',
  onSuccess,
}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')

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
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError('Ingresá un correo electrónico válido (vas a recibir la constancia ahí).')
      return
    }
    if (!form.rubro) {
      setFormError('Seleccioná un rubro.')
      return
    }
    if (form.rubro === 'Otro' && !form.rubroOther.trim()) {
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
      setFormError('No hay conexión con el backend para enviar la preinscripción.')
      return
    }

    setSending(true)
    try {
      const result = await createFdcStallApplication({
        fullName: form.fullName.trim(),
        dni,
        address: form.address.trim(),
        locality: form.locality.trim(),
        phone,
        email: form.email.trim().toLowerCase(),
        rubro: form.rubro,
        rubroOther: form.rubroOther.trim(),
        participatedBefore: Boolean(form.participatedBefore),
        participationYears: form.participationYears.trim(),
      })
      setForm(EMPTY_FORM)
      onSuccess?.(result)
    } catch (err) {
      setFormError(err.message || 'No se pudo enviar la preinscripción.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form
      id="solicitud-puestos"
      onSubmit={handleSubmit}
      className="scroll-mt-[calc(var(--navbar-h,5rem)+1.25rem)]"
      noValidate
    >
      <div className="overflow-hidden rounded-2xl border border-[#ddd7ca] bg-white shadow-[0_12px_40px_-24px_rgba(23,27,34,0.35)] sm:rounded-3xl">
        <div className="border-b border-[#e8e5dd] bg-linear-to-br from-[#f8f4ec] via-white to-[#f3f7fb] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-800 sm:text-xs">
            Preinscripción 2026
          </p>
          <h2 className="mt-1.5 font-serif text-xl font-bold tracking-tight text-[#171b22] sm:text-2xl lg:text-[1.75rem]">
            Solicitud de puestos comerciales
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4b505a]">
            Completá tus datos. Al enviar vas a recibir la constancia en tu correo con el número de
            solicitud.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Los campos marcados con <span className="font-semibold text-amber-800">*</span> son
            obligatorios.
          </p>
        </div>

        <div className="space-y-6 px-4 py-5 sm:space-y-7 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          {!formOpen ? (
            <div
              className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm leading-relaxed text-amber-950 sm:px-5"
              role="status"
            >
              {windowMessage || 'La preinscripción no está abierta en este momento.'}
            </div>
          ) : null}

          <div className="rounded-2xl border border-amber-200/90 bg-amber-50/95 px-4 py-3.5 text-sm leading-relaxed text-amber-950 sm:px-5">
            {notice}
          </div>

          <section className="space-y-4">
            <header className="border-b border-[#ebe7df] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
                Datos personales
              </h3>
            </header>

            <fieldset disabled={disabled} className="grid gap-4 sm:grid-cols-2">
              <label className={`${labelClass} sm:col-span-2`}>
                <FieldLabel required>Apellido y nombre</FieldLabel>
                <input
                  className={`${inputClass} min-h-12 text-base sm:min-h-11 sm:text-sm`}
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  autoComplete="name"
                  required
                  placeholder="Ej. Pérez, María"
                />
              </label>

              <label className={labelClass}>
                <FieldLabel required>DNI</FieldLabel>
                <input
                  className={`${inputClass} min-h-12 text-base sm:min-h-11 sm:text-sm`}
                  value={form.dni}
                  onChange={(e) => updateField('dni', e.target.value)}
                  inputMode="numeric"
                  required
                  placeholder="Solo números"
                />
              </label>

              <label className={labelClass}>
                <FieldLabel required>Teléfono</FieldLabel>
                <input
                  className={`${inputClass} min-h-12 text-base sm:min-h-11 sm:text-sm`}
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  autoComplete="tel"
                  required
                  placeholder="Con código de área"
                />
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                <FieldLabel required>Domicilio</FieldLabel>
                <input
                  className={`${inputClass} min-h-12 text-base sm:min-h-11 sm:text-sm`}
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  autoComplete="street-address"
                  required
                  placeholder="Calle y número"
                />
              </label>

              <label className={labelClass}>
                <FieldLabel required>Localidad</FieldLabel>
                <input
                  className={`${inputClass} min-h-12 text-base sm:min-h-11 sm:text-sm`}
                  value={form.locality}
                  onChange={(e) => updateField('locality', e.target.value)}
                  required
                  placeholder="Ej. Trancas"
                />
              </label>

              <label className={labelClass}>
                <FieldLabel
                  required
                  hint="Vas a recibir la constancia automática con el número de solicitud."
                >
                  Correo electrónico
                </FieldLabel>
                <input
                  type="email"
                  className={`${inputClass} min-h-12 text-base sm:min-h-11 sm:text-sm`}
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  autoComplete="email"
                  required
                  placeholder="tu@email.com"
                />
              </label>
            </fieldset>
          </section>

          <section className="space-y-4">
            <header className="border-b border-[#ebe7df] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">Rubro</h3>
            </header>

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
                  {FDC_RUBROS.map((rubro) => (
                    <option key={rubro} value={rubro}>
                      {rubro}
                    </option>
                  ))}
                </select>
              </label>

              {form.rubro === 'Otro' ? (
                <label className={labelClass}>
                  <FieldLabel required>Especificá el rubro</FieldLabel>
                  <input
                    className={`${inputClass} min-h-12 text-base sm:min-h-11 sm:text-sm`}
                    value={form.rubroOther}
                    onChange={(e) => updateField('rubroOther', e.target.value)}
                    placeholder="Describí tu actividad"
                  />
                </label>
              ) : null}
            </fieldset>
          </section>

          <section className="space-y-4">
            <header className="border-b border-[#ebe7df] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
                Experiencia
              </h3>
            </header>

            <fieldset disabled={disabled} className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  ¿Participaste anteriormente en la Fiesta Nacional e Internacional del Caballo?{' '}
                  <span className="text-amber-800" aria-hidden>
                    *
                  </span>
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:max-w-xs">
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
                    className={`${inputClass} min-h-12 text-base sm:min-h-11 sm:text-sm`}
                    value={form.participationYears}
                    onChange={(e) => updateField('participationYears', e.target.value)}
                    placeholder="Ej. 2022, 2024"
                  />
                </label>
              ) : null}
            </fieldset>
          </section>

          <section className="rounded-2xl border border-[#ddd7ca] bg-[#f8f7f3] px-4 py-4 sm:px-5 sm:py-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
              Documentación a presentar
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#4b505a]">
              Esta información es solo orientativa. No tenés que adjuntar ni marcar nada para enviar
              la preinscripción online.
            </p>
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
          </section>

          {formError ? (
            <div className={formErrorClass} role="alert">
              {formError}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-[#ebe7df] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="order-2 text-center text-xs leading-relaxed text-slate-500 sm:order-1 sm:text-left sm:max-w-md">
              Al enviar, registramos tu solicitud y te enviamos la constancia al correo indicado.
            </p>
            <button
              type="submit"
              disabled={disabled}
              className="order-1 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#171b22] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 sm:w-auto sm:min-w-52"
            >
              {sending ? 'Enviando…' : 'Enviar preinscripción'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

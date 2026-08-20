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
  dniCopyAck: false,
  acceptedNotice: false,
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
      setFormError('Ingresá un DNI válido.')
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
      setFormError('Marcá un rubro.')
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
    if (!form.dniCopyAck) {
      setFormError('Confirmá que presentarás fotocopia de DNI.')
      return
    }
    if (!form.acceptedNotice) {
      setFormError('Debés aceptar el aviso de preinscripción.')
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
        dniCopyAck: true,
        acceptedNotice: true,
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
      className="scroll-mt-[calc(var(--navbar-h,5rem)+1.25rem)] space-y-6"
      noValidate
    >
      {!formOpen ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          {windowMessage || 'La preinscripción no está abierta en este momento.'}
        </div>
      ) : null}

      <div className="rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm leading-relaxed text-amber-950 sm:px-5">
        {notice}
      </div>

      <fieldset disabled={disabled} className="space-y-4">
        <legend className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
          Datos personales
        </legend>
        <label className={labelClass}>
          Apellido y nombre
          <input
            className={inputClass}
            value={form.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            autoComplete="name"
            required
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            DNI
            <input
              className={inputClass}
              value={form.dni}
              onChange={(e) => updateField('dni', e.target.value)}
              inputMode="numeric"
              required
            />
          </label>
          <label className={labelClass}>
            Teléfono
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              autoComplete="tel"
              required
            />
          </label>
        </div>
        <label className={labelClass}>
          Domicilio
          <input
            className={inputClass}
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            autoComplete="street-address"
            required
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Localidad
            <input
              className={inputClass}
              value={form.locality}
              onChange={(e) => updateField('locality', e.target.value)}
              required
            />
          </label>
          <label className={labelClass}>
            Correo electrónico
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              autoComplete="email"
              required
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Vas a recibir automáticamente la constancia de preinscripción con el número asignado.
            </span>
          </label>
        </div>
      </fieldset>

      <fieldset disabled={disabled} className="space-y-3">
        <legend className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
          Rubro <span className="normal-case tracking-normal text-slate-500">(marque con una X)</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {FDC_RUBROS.map((rubro) => (
            <label
              key={rubro}
              className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                form.rubro === rubro
                  ? 'border-sky-300 bg-sky-50 text-sky-950'
                  : 'border-[#ddd7ca] bg-white text-[#171b22] hover:border-sky-200'
              }`}
            >
              <input
                type="radio"
                name="fdc-rubro"
                className="h-4 w-4 border-slate-300 text-sky-700"
                checked={form.rubro === rubro}
                onChange={() => updateField('rubro', rubro)}
              />
              {rubro}
            </label>
          ))}
        </div>
        {form.rubro === 'Otro' ? (
          <label className={labelClass}>
            Especifique el rubro
            <input
              className={inputClass}
              value={form.rubroOther}
              onChange={(e) => updateField('rubroOther', e.target.value)}
            />
          </label>
        ) : null}
      </fieldset>

      <fieldset disabled={disabled} className="space-y-3">
        <legend className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
          Experiencia
        </legend>
        <p className="text-sm text-[#4b505a]">
          ¿Ha participado anteriormente en la Fiesta Nacional e Internacional del Caballo?
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { value: true, label: 'Sí' },
            { value: false, label: 'No' },
          ].map((opt) => (
            <label
              key={String(opt.value)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                form.participatedBefore === opt.value
                  ? 'border-[#171b22] bg-[#171b22] text-white'
                  : 'border-[#ddd7ca] bg-white text-[#171b22]'
              }`}
            >
              <input
                type="radio"
                name="fdc-participated"
                className="sr-only"
                checked={form.participatedBefore === opt.value}
                onChange={() => updateField('participatedBefore', opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
        {form.participatedBefore ? (
          <label className={labelClass}>
            En caso afirmativo, indique el/los año/s
            <input
              className={inputClass}
              value={form.participationYears}
              onChange={(e) => updateField('participationYears', e.target.value)}
              placeholder="Ej. 2022, 2024"
            />
          </label>
        ) : null}
      </fieldset>

      <fieldset disabled={disabled} className="space-y-3">
        <legend className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
          Documentación a presentar
        </legend>
        <label className="flex items-start gap-3 rounded-xl border border-[#ddd7ca] bg-white px-4 py-3 text-sm text-[#171b22]">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-700"
            checked={form.dniCopyAck}
            onChange={(e) => updateField('dniCopyAck', e.target.checked)}
          />
          <span>Fotocopia de DNI.</span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-[#ddd7ca] bg-white px-4 py-3 text-sm text-[#171b22]">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-700"
            checked={form.acceptedNotice}
            onChange={(e) => updateField('acceptedNotice', e.target.checked)}
          />
          <span>
            Leí y acepto que esta preinscripción no implica la adjudicación automática del espacio.
          </span>
        </label>
      </fieldset>

      {formError ? (
        <div className={formErrorClass} role="alert">
          {formError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={disabled}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#171b22] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-56"
      >
        {sending ? 'Enviando…' : 'Enviar preinscripción'}
      </button>
    </form>
  )
}

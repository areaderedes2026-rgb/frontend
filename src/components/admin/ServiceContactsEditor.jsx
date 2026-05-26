import {
  EMPTY_SERVICE_CONTACT_ITEM,
  EMPTY_SERVICE_CONTACT_SECTION,
  SERVICE_CONTACT_TYPES,
  normalizeServiceContactSection,
} from '../../utils/serviceContacts.js'
import { inputClass, labelClass } from '../ui/formStyles.js'

function newContactItemId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `contact-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function ServiceContactsEditor({
  contactSection,
  onChange,
  saving = false,
  className = '',
  hideHeader = false,
}) {
  const section = normalizeServiceContactSection(contactSection)

  function updateSection(patch) {
    onChange({
      ...section,
      ...patch,
    })
  }

  function updateItem(index, field, value) {
    const items = [...section.items]
    items[index] = {
      ...items[index],
      [field]: value,
    }
    updateSection({ items })
  }

  function addItem() {
    updateSection({
      items: [
        ...section.items,
        {
          ...EMPTY_SERVICE_CONTACT_ITEM,
          id: newContactItemId(),
        },
      ],
    })
  }

  function removeItem(index) {
    updateSection({
      items: section.items.filter((_, i) => i !== index),
    })
  }

  return (
    <div
      className={`min-w-0 max-w-full space-y-4 overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:col-span-2 ${className}`.trim()}
    >
      {!hideHeader ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">Contactos del servicio</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Opcional. Teléfonos, emails, WhatsApp o enlaces que se muestran en la página pública del
              servicio.
            </p>
          </div>
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-900 shadow-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              checked={section.enabled}
              onChange={(e) => updateSection({ enabled: e.target.checked })}
              disabled={saving}
            />
            Mostrar en el portal
          </label>
        </div>
      ) : null}

      {hideHeader || section.enabled ? (
        <>
          <label className={labelClass}>
            Título de la sección
            <input
              className={inputClass}
              value={section.title}
              onChange={(e) => updateSection({ title: e.target.value })}
              disabled={saving}
              maxLength={80}
              placeholder="Ej. Contacto, Consultas, Turnos"
            />
          </label>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
              Ítems de contacto
            </p>
            <button
              type="button"
              onClick={addItem}
              disabled={saving}
              className="inline-flex min-h-9 items-center justify-center rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Agregar contacto
            </button>
          </div>

          {section.items.length ? (
            <div className="space-y-3">
              {section.items.map((item, index) => (
                <article
                  key={item.id || `contact-${index}`}
                  className="rounded-2xl border border-white bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      Contacto {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={saving}
                      className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className={labelClass}>
                      Tipo
                      <select
                        className={inputClass}
                        value={item.type || 'text'}
                        onChange={(e) => updateItem(index, 'type', e.target.value)}
                        disabled={saving}
                      >
                        {SERVICE_CONTACT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={labelClass}>
                      Etiqueta
                      <input
                        className={inputClass}
                        value={item.label || ''}
                        onChange={(e) => updateItem(index, 'label', e.target.value)}
                        disabled={saving}
                        maxLength={80}
                        placeholder="Ej. Turnos, Mesa de entrada"
                      />
                    </label>
                    <label className={`${labelClass} sm:col-span-2`}>
                      {item.type === 'link' ? 'Texto del enlace' : 'Valor visible'}
                      <input
                        className={inputClass}
                        value={item.value || ''}
                        onChange={(e) => updateItem(index, 'value', e.target.value)}
                        disabled={saving}
                        maxLength={200}
                        placeholder={
                          item.type === 'phone'
                            ? '+54 381 400-1200'
                            : item.type === 'email'
                              ? 'contacto@trancas.gob.ar'
                              : item.type === 'whatsapp'
                                ? '3816396406'
                                : item.type === 'link'
                                  ? 'Ver formulario'
                                  : 'Horario o dato de contacto'
                        }
                      />
                    </label>
                    {item.type === 'link' ? (
                      <label className={`${labelClass} sm:col-span-2`}>
                        URL del enlace
                        <input
                          className={inputClass}
                          value={item.url || ''}
                          onChange={(e) => updateItem(index, 'url', e.target.value)}
                          disabled={saving}
                          maxLength={2048}
                          placeholder="https://..."
                        />
                      </label>
                    ) : null}
                    <label className={`${labelClass} sm:col-span-2`}>
                      Nota (opcional)
                      <input
                        className={inputClass}
                        value={item.note || ''}
                        onChange={(e) => updateItem(index, 'note', e.target.value)}
                        disabled={saving}
                        maxLength={160}
                        placeholder="Ej. Lunes a viernes de 8 a 13 hs"
                      />
                    </label>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-emerald-200 bg-white/70 px-4 py-6 text-center text-sm text-slate-600">
              Agregá al menos un contacto para que la sección se muestre en el portal.
            </p>
          )}
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-emerald-200 bg-white/70 px-4 py-5 text-sm text-slate-600">
          Activá la opción para configurar teléfonos, emails, WhatsApp o enlaces en la página del
          servicio.
        </p>
      )}
    </div>
  )
}

export { EMPTY_SERVICE_CONTACT_SECTION }

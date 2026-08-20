import {
  buildWhatsAppUrl,
  normalizePhoneForWhatsapp,
  openWhatsAppUrl,
} from './whatsapp.js'

export { normalizePhoneForWhatsapp }

export const DEFAULT_FDC_WHATSAPP_TEMPLATE = `Hola {{nombre}},

Te escribimos desde la Municipalidad de Trancas por tu preinscripción N° {{id}} al puesto comercial ({{rubro}}) de la Fiesta Nacional e Internacional del Caballo 2026.

Pronto te contactaremos con novedades.

Gracias por participar.`

export function applyFdcWhatsappPlaceholders(template, application) {
  const t = String(template ?? '').trim()
  const raw = t || DEFAULT_FDC_WHATSAPP_TEMPLATE
  const name = String(application?.fullName ?? '').trim() || '—'
  const rubro =
    application?.rubro === 'Otro' && application?.rubroOther
      ? `Otro: ${application.rubroOther}`
      : String(application?.rubro || '—')
  return raw
    .replaceAll('{{nombre}}', name)
    .replaceAll('{{id}}', String(application?.id ?? '—'))
    .replaceAll('{{rubro}}', rubro)
    .replaceAll('{{dni}}', String(application?.dni ?? '').trim() || '—')
    .replaceAll('{{telefono}}', String(application?.phone ?? '').trim() || '—')
}

export function openFdcStallWhatsApp(application, storedTemplate) {
  const digits = normalizePhoneForWhatsapp(application?.phone)
  if (!digits) {
    throw new Error('No hay un número de teléfono válido para abrir WhatsApp.')
  }
  const body = applyFdcWhatsappPlaceholders(storedTemplate, application)
  const url = buildWhatsAppUrl(digits, body)
  openWhatsAppUrl(url)
}

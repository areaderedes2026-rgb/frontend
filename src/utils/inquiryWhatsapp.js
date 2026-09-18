import {
  buildWhatsAppUrl,
  normalizePhoneForWhatsapp,
  openWhatsAppUrl,
} from './whatsapp.js'

export { normalizePhoneForWhatsapp }

/** Texto sugerido si aún no guardaron plantilla en el servidor. */
export const DEFAULT_INQUIRY_WHATSAPP_TEMPLATE = `Hola {{nombre}},

Te escribimos desde la Municipalidad de Trancas. Ya leímos tu consulta web N° {{id}} (tema: {{tema}}) y te responderemos en cuanto tengamos novedades.

Gracias por contactarnos.`

export const DEFAULT_FDC_FAQ_INQUIRY_WHATSAPP_TEMPLATE = `Hola {{nombre}},

Te escribimos desde la Fiesta del Caballo. Ya recibimos tu consulta N° {{id}} (motivo: {{tema}}) y te responderemos a la brevedad por este medio.

Gracias por escribirnos.`

/**
 * @param {string} template
 * @param {{ firstName?: string, lastName?: string, fullName?: string, id?: number, topic?: string, dni?: string }} inquiry
 */
export function applyInquiryWhatsappPlaceholders(template, inquiry, fallbackTemplate = DEFAULT_INQUIRY_WHATSAPP_TEMPLATE) {
  const t = String(template ?? '').trim()
  const raw = t || fallbackTemplate
  const full = String(inquiry?.fullName ?? '').trim()
  const first = String(inquiry?.firstName ?? '').trim() || full.split(/\s+/).filter(Boolean)[0] || ''
  const last =
    String(inquiry?.lastName ?? '').trim() ||
    full.split(/\s+/).filter(Boolean).slice(1).join(' ')
  const vecino = full || [first, last].filter(Boolean).join(' ').trim() || '—'
  return raw
    .replaceAll('{{nombre}}', first || vecino || '—')
    .replaceAll('{{apellido}}', last || '—')
    .replaceAll('{{vecino}}', vecino)
    .replaceAll('{{id}}', String(inquiry?.id ?? '—'))
    .replaceAll('{{tema}}', String(inquiry?.topic ?? '').trim() || '—')
    .replaceAll('{{dni}}', String(inquiry?.dni ?? '').trim() || '—')
}

/**
 * Abre WhatsApp (app o web) con el número del vecino y el mensaje.
 * @param {object} inquiry
 * @param {string} storedTemplate Plantilla del servidor (puede ir vacía).
 */
export function openInquiryWhatsApp(inquiry, storedTemplate, fallbackTemplate) {
  const digits = normalizePhoneForWhatsapp(inquiry?.phone)
  if (!digits) {
    throw new Error('No hay un número de teléfono válido para abrir WhatsApp.')
  }
  const body = applyInquiryWhatsappPlaceholders(storedTemplate, inquiry, fallbackTemplate)
  const url = buildWhatsAppUrl(digits, body)
  openWhatsAppUrl(url)
}

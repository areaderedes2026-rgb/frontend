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

/**
 * @param {string} template
 * @param {{ firstName?: string, lastName?: string, id?: number, topic?: string, dni?: string }} inquiry
 */
export function applyInquiryWhatsappPlaceholders(template, inquiry) {
  const t = String(template ?? '').trim()
  const raw = t || DEFAULT_INQUIRY_WHATSAPP_TEMPLATE
  const first = String(inquiry?.firstName ?? '').trim()
  const last = String(inquiry?.lastName ?? '').trim()
  const vecino = [first, last].filter(Boolean).join(' ').trim() || '—'
  return raw
    .replaceAll('{{nombre}}', first || '—')
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
export function openInquiryWhatsApp(inquiry, storedTemplate) {
  const digits = normalizePhoneForWhatsapp(inquiry?.phone)
  if (!digits) {
    throw new Error('No hay un número de teléfono válido para abrir WhatsApp.')
  }
  const body = applyInquiryWhatsappPlaceholders(storedTemplate, inquiry)
  const url = buildWhatsAppUrl(digits, body)
  openWhatsAppUrl(url)
}

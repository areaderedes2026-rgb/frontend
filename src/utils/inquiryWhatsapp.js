/** Texto sugerido si aún no guardaron plantilla en el servidor. */
export const DEFAULT_INQUIRY_WHATSAPP_TEMPLATE = `Hola {{nombre}},

Te escribimos desde la Municipalidad de Trancas. Ya leímos tu consulta web N° {{id}} (tema: {{tema}}) y te responderemos en cuanto tengamos novedades.

Gracias por contactarnos.`

const WA_TEXT_MAX = 4090

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

/** Solo dígitos; si parece Argentina sin prefijo, antepone 54. */
export function normalizePhoneForWhatsapp(phone) {
  let d = String(phone ?? '').replace(/\D/g, '')
  if (!d) return ''
  d = d.replace(/^0+/, '')
  if (!d.startsWith('54') && d.length >= 8 && d.length <= 10) {
    d = `54${d}`
  }
  return d
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
  const safe = body.slice(0, WA_TEXT_MAX)
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(safe)}`
  const a = document.createElement('a')
  a.href = url
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  a.setAttribute('aria-hidden', 'true')
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

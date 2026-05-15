/** Número institucional de WhatsApp (Argentina, con 9 móvil). */
export const MUNICIPAL_WHATSAPP_PHONE = '5493816396406'

export const MUNICIPAL_WHATSAPP_DISPLAY = '+54 9 3816 396406'

export const MUNICIPAL_WHATSAPP_DEFAULT_MESSAGE =
  'Hola, me comunico desde el sitio web de la Municipalidad de Trancas.'

const WA_TEXT_MAX = 4090

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

export function buildWhatsAppUrl(phoneDigits, message = '') {
  const digits = normalizePhoneForWhatsapp(phoneDigits)
  if (!digits) return ''
  const base = `https://wa.me/${digits}`
  const text = String(message ?? '').trim()
  if (!text) return base
  return `${base}?text=${encodeURIComponent(text.slice(0, WA_TEXT_MAX))}`
}

/** Abre WhatsApp en pestaña nueva sin navegar la página actual. */
export function openWhatsAppUrl(url) {
  if (!url) return
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

export function openMunicipalWhatsApp(message = MUNICIPAL_WHATSAPP_DEFAULT_MESSAGE) {
  const url = buildWhatsAppUrl(MUNICIPAL_WHATSAPP_PHONE, message)
  if (url) openWhatsAppUrl(url)
}

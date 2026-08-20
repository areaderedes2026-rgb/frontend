import { DEFAULT_FDC_CONTENT, mergeFdcContent } from '../data/fdcContent.js'
import { getApiBase } from '../utils/apiConfig.js'
import { jsonAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/authStorage.js'
import { errorFromApiResponse } from '../utils/concurrencyConflict.js'

function base() {
  return getApiBase().trim()
}

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

function mapApplication(value) {
  if (!value || typeof value !== 'object') return null
  return {
    id: value.id != null ? Number(value.id) : null,
    fullName: String(value.fullName || ''),
    dni: String(value.dni || ''),
    address: String(value.address || ''),
    locality: String(value.locality || ''),
    phone: String(value.phone || ''),
    email: String(value.email || ''),
    rubro: String(value.rubro || ''),
    rubroOther: String(value.rubroOther || ''),
    participatedBefore: value.participatedBefore === true,
    participationYears: String(value.participationYears || ''),
    dniCopyAck: value.dniCopyAck === true,
    acceptedNotice: value.acceptedNotice === true,
    status: String(value.status || 'sin_resolver'),
    emailSentAt: value.emailSentAt || null,
    emailError: String(value.emailError || ''),
    createdAt: value.createdAt || null,
    updatedAt: value.updatedAt || null,
  }
}

export async function fetchFdcContent() {
  const b = base()
  if (!b) return mergeFdcContent(DEFAULT_FDC_CONTENT, {})
  const res = await fetch(`${b}/api/fdc/content`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar Fiesta del Caballo.')
  }
  const data = await res.json().catch(() => ({}))
  return mergeFdcContent(DEFAULT_FDC_CONTENT, data.content ?? {})
}

export async function fetchFdcContentAdmin() {
  const b = base()
  if (!b) return mergeFdcContent(DEFAULT_FDC_CONTENT, {})
  const res = await fetch(`${b}/api/fdc/admin/content`, { headers: jsonAuthHeaders() })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar el contenido FDC.')
  }
  const data = await res.json().catch(() => ({}))
  return mergeFdcContent(DEFAULT_FDC_CONTENT, data.content ?? {})
}

export async function updateFdcContent(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar Fiesta del Caballo.')
  const res = await fetch(`${b}/api/fdc/content`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw await errorFromApiResponse(res, 'No se pudo guardar Fiesta del Caballo.')
  }
  const data = await res.json().catch(() => ({}))
  return mergeFdcContent(DEFAULT_FDC_CONTENT, data.content ?? {})
}

export async function createFdcStallApplication(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para enviar la preinscripción.')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 18_000)
  try {
    const res = await fetch(`${b}/api/fdc/stall-applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error((await apiErrorMessage(res)) || 'No se pudo enviar la preinscripción.')
    }
    const data = await res.json().catch(() => ({}))
    return {
      application: mapApplication(data.application),
      emailSent: Boolean(data.emailSent),
      emailQueued: Boolean(data.emailQueued),
      emailError: String(data.emailError || ''),
    }
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(
        'La solicitud tardó demasiado. Revisá tu conexión e intentá de nuevo en unos segundos.',
      )
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchFdcStallApplicationsAdmin(status = '') {
  const b = base()
  if (!b) return []
  const qs = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : ''
  const res = await fetch(`${b}/api/fdc/admin/stall-applications${qs}`, {
    headers: jsonAuthHeaders(),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudieron cargar las solicitudes.')
  }
  const data = await res.json().catch(() => ({}))
  return Array.isArray(data.applications) ? data.applications.map(mapApplication).filter(Boolean) : []
}

export async function fetchFdcStallApplicationAdminById(id) {
  const b = base()
  if (!b) return null
  const res = await fetch(`${b}/api/fdc/admin/stall-applications/${id}`, {
    headers: jsonAuthHeaders(),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar la solicitud.')
  }
  const data = await res.json().catch(() => ({}))
  return mapApplication(data.application)
}

export async function updateFdcStallApplicationStatus(id, payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL.')
  const res = await fetch(`${b}/api/fdc/admin/stall-applications/${id}/status`, {
    method: 'PATCH',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw await errorFromApiResponse(res, 'No se pudo actualizar el estado.')
  }
  const data = await res.json().catch(() => ({}))
  return mapApplication(data.application)
}

export async function deleteFdcStallApplication(id) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL.')
  const res = await fetch(`${b}/api/fdc/admin/stall-applications/${id}`, {
    method: 'DELETE',
    headers: jsonAuthHeaders(),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo eliminar la solicitud.')
  }
}

export async function resendFdcStallApplicationEmail(id) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL.')
  const res = await fetch(`${b}/api/fdc/admin/stall-applications/${id}/resend-email`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo reenviar el correo.')
  }
  const data = await res.json().catch(() => ({}))
  return mapApplication(data.application)
}

export async function fetchFdcWhatsappTemplate() {
  const b = base()
  if (!b) return { message: '', updatedAt: null }
  const res = await fetch(`${b}/api/fdc/admin/whatsapp-message`, {
    headers: jsonAuthHeaders(),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar la plantilla de WhatsApp.')
  }
  const data = await res.json().catch(() => ({}))
  return {
    message: String(data.message || ''),
    updatedAt: data.updatedAt || null,
  }
}

export async function updateFdcWhatsappTemplate(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL.')
  const res = await fetch(`${b}/api/fdc/admin/whatsapp-message`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw await errorFromApiResponse(res, 'No se pudo guardar la plantilla de WhatsApp.')
  }
  const data = await res.json().catch(() => ({}))
  return {
    message: String(data.message || ''),
    updatedAt: data.updatedAt || null,
  }
}

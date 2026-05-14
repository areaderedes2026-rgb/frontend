import { DEFAULT_CITIZEN_ATTENTION_CONTENT } from '../data/citizenAttentionContent.js'
import { getApiBase } from '../utils/apiConfig.js'
import { jsonAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/authStorage.js'

function base() {
  return getApiBase().trim()
}

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

function mapInquiry(value) {
  return {
    id: Number(value?.id) || 0,
    firstName: String(value?.firstName || ''),
    lastName: String(value?.lastName || ''),
    dni: String(value?.dni || ''),
    email: String(value?.email || ''),
    phone: String(value?.phone || ''),
    topic: String(value?.topic || ''),
    message: String(value?.message || ''),
    status: String(value?.status || 'sin_resolver'),
    createdAt: value?.createdAt || null,
    updatedAt: value?.updatedAt || null,
  }
}

export async function fetchCitizenAttentionContent() {
  const b = base()
  if (!b) return DEFAULT_CITIZEN_ATTENTION_CONTENT
  const res = await fetch(`${b}/api/citizen-attention/content`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar la sección de atención.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}

export async function updateCitizenAttentionContent(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar Atención al ciudadano.')
  const res = await fetch(`${b}/api/citizen-attention/content`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo guardar Atención al ciudadano.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}

export async function createCitizenInquiry(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para enviar consultas.')
  const res = await fetch(`${b}/api/citizen-attention/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo enviar la consulta.')
  }
  const data = await res.json().catch(() => ({}))
  return data.inquiry ? mapInquiry(data.inquiry) : null
}

export async function fetchCitizenInquiriesAdmin(status = '') {
  const b = base()
  if (!b) return []
  const qs = status ? `?status=${encodeURIComponent(status)}` : ''
  const res = await fetch(`${b}/api/citizen-attention/admin/inquiries${qs}`, {
    headers: jsonAuthHeaders(),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudieron cargar las consultas.')
  }
  const data = await res.json().catch(() => ({}))
  const list = Array.isArray(data.inquiries) ? data.inquiries : []
  return list.map(mapInquiry)
}

export async function fetchCitizenInquiryAdminById(id) {
  const b = base()
  if (!b) return null
  const res = await fetch(`${b}/api/citizen-attention/admin/inquiries/${id}`, {
    headers: jsonAuthHeaders(),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar la consulta.')
  }
  const data = await res.json().catch(() => ({}))
  return data.inquiry ? mapInquiry(data.inquiry) : null
}

export async function updateCitizenInquiryStatus(id, status, expectedUpdatedAt = null) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para actualizar consultas.')
  const res = await fetch(`${b}/api/citizen-attention/admin/inquiries/${id}/status`, {
    method: 'PATCH',
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ status, expectedUpdatedAt }),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo actualizar el estado.')
  }
  const data = await res.json().catch(() => ({}))
  return data.inquiry ? mapInquiry(data.inquiry) : null
}

export async function deleteCitizenInquiry(id) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para eliminar consultas.')
  const res = await fetch(`${b}/api/citizen-attention/admin/inquiries/${id}`, {
    method: 'DELETE',
    headers: jsonAuthHeaders(),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo eliminar la consulta.')
  }
}

export async function fetchInquiryWhatsappTemplate() {
  const b = base()
  if (!b) return { message: '', updatedAt: null }
  const res = await fetch(`${b}/api/citizen-attention/admin/inquiry-whatsapp-message`, {
    headers: jsonAuthHeaders(),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar la plantilla de WhatsApp.')
  }
  const data = await res.json().catch(() => ({}))
  return {
    message: typeof data.message === 'string' ? data.message : '',
    updatedAt: data.updatedAt || null,
  }
}

export async function updateInquiryWhatsappTemplate({ message, expectedUpdatedAt }) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar la plantilla.')
  const res = await fetch(`${b}/api/citizen-attention/admin/inquiry-whatsapp-message`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ message, expectedUpdatedAt }),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo guardar la plantilla de WhatsApp.')
  }
  const data = await res.json().catch(() => ({}))
  return {
    message: typeof data.message === 'string' ? data.message : '',
    updatedAt: data.updatedAt || null,
  }
}

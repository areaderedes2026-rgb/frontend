import { getApiBase } from '../utils/apiConfig.js'
import {
  getAuthHeaders,
  jsonAuthHeaders,
  notifyUnauthorizedIfNeeded,
} from '../utils/authStorage.js'

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

function apiBase() {
  const b = getApiBase()
  if (!b) throw new Error('Configurá VITE_API_URL para gestionar usuarios.')
  return b
}

export async function fetchUsersList() {
  const base = apiBase()
  const res = await fetch(`${base}/api/users`, { headers: getAuthHeaders() })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudieron cargar los usuarios.')
  }
  return res.json()
}

export async function fetchUserById(id) {
  const base = apiBase()
  const res = await fetch(`${base}/api/users/${id}`, { headers: getAuthHeaders() })
  notifyUnauthorizedIfNeeded(res)
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar el usuario.')
  }
  return res.json()
}

export async function createUser(payload) {
  const base = apiBase()
  const res = await fetch(`${base}/api/users`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo crear el usuario.')
  }
  return res.json()
}

export async function updateUser(id, payload) {
  const base = apiBase()
  const res = await fetch(`${base}/api/users/${id}`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo actualizar el usuario.')
  }
  return res.json()
}

export async function deleteUser(id) {
  const base = apiBase()
  const res = await fetch(`${base}/api/users/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo eliminar el usuario.')
  }
  return res.json()
}

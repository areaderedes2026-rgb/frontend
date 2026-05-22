import { getApiBase } from '../utils/apiConfig.js'
import {
  getAuthHeaders,
  jsonAuthHeaders,
  notifyUnauthorizedIfNeeded,
} from '../utils/authStorage.js'
import { errorFromApiResponse } from '../utils/concurrencyConflict.js'

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

function base() {
  const b = getApiBase()
  if (!b) throw new Error('Configurá VITE_API_URL.')
  return b
}

/** Listado público (sin token). */
export async function fetchCategories() {
  const b = base()
  const res = await fetch(`${b}/api/categories`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudieron cargar las categorías.')
  }
  const data = await res.json().catch(() => ({}))
  return Array.isArray(data.items) ? data.items : []
}

export async function createCategory(payload) {
  const b = base()
  const res = await fetch(`${b}/api/categories`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo crear la categoría.')
  }
  return res.json()
}

export async function updateCategory(id, payload) {
  const b = base()
  const res = await fetch(`${b}/api/categories/${id}`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw await errorFromApiResponse(res, 'No se pudo actualizar la categoría.')
  }
  return res.json()
}

export async function deleteCategory(id) {
  const b = base()
  const res = await fetch(`${b}/api/categories/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo eliminar la categoría.')
  }
  return res.json()
}

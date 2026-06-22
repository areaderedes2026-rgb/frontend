import { getApiBase } from '../utils/apiConfig.js'
import {
  getAuthHeaders,
  jsonAuthHeaders,
  notifyUnauthorizedIfNeeded,
} from '../utils/authStorage.js'

async function parseApiError(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

/** Sube una imagen al servidor (staff). Devuelve URL pública estable. */
export async function uploadMediaImage(file, kind = 'gallery') {
  const base = getApiBase()
  if (!base) {
    throw new Error('Configurá VITE_API_URL para subir imágenes.')
  }
  if (!file) {
    throw new Error('No se seleccionó ningún archivo.')
  }
  const form = new FormData()
  form.append('file', file)
  form.append('kind', kind === 'cover' ? 'cover' : 'gallery')
  const res = await fetch(`${base}/api/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: form,
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    const msg = await parseApiError(res)
    throw new Error(msg || 'No se pudo subir la imagen.')
  }
  const data = await res.json().catch(() => ({}))
  if (!data.url) {
    throw new Error('Respuesta inválida del servidor.')
  }
  return data.url
}

/** Importa una imagen desde URL remota y la guarda en storage propio. */
export async function importMediaImageFromUrl(url, kind = 'gallery') {
  const base = getApiBase()
  if (!base) {
    throw new Error('Configurá VITE_API_URL para importar imágenes por URL.')
  }
  const remote = String(url || '').trim()
  if (!remote) {
    throw new Error('Ingresá una URL de imagen.')
  }
  const res = await fetch(`${base}/api/upload/from-url`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify({
      url: remote,
      kind: kind === 'cover' ? 'cover' : 'gallery',
    }),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    const msg = await parseApiError(res)
    throw new Error(msg || 'No se pudo importar la imagen desde URL.')
  }
  const data = await res.json().catch(() => ({}))
  if (!data.url) {
    throw new Error('Respuesta inválida del servidor.')
  }
  return data.url
}

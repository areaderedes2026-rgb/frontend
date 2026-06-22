/**
 * Capa de datos de noticias: mock sin API, o backend vía VITE_API_URL.
 */
import { getApiBase } from '../utils/apiConfig.js'
import {
  getAuthHeaders,
  jsonAuthHeaders,
  notifyUnauthorizedIfNeeded,
} from '../utils/authStorage.js'
import { errorFromApiResponse } from '../utils/concurrencyConflict.js'
import {
  importMediaImageFromUrl,
  uploadMediaImage,
} from './mediaUploadService.js'

const API_BASE = getApiBase()

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

const MOCK_INITIAL = [
  {
    id: '1',
    slug: 'inicio-obras-plaza-central',
    title: 'Inicio de obras en la Plaza Central',
    summary:
      'La comuna informa el comienzo de mejoras en espacios públicos para el beneficio de todos los vecinos.',
    body: `La Municipalidad de Trancas informa que han dado inicio las obras de refacción y puesta en valor de la Plaza Central del pueblo.

Las tareas incluyen renovación de veredas, iluminación LED y mejoras en el sistema de desagües pluviales. Se estima una duración aproximada de tres meses, con prioridad en minimizar la afectación al tránsito peatonal.

Los vecinos pueden dirigir consultas a la Secretaría de Obras Públicas en el horario de atención habitual.`,
    publishedAt: '2026-03-15T10:00:00.000Z',
    category: 'Obras',
    imageUrl: null,
    galleryUrls: [],
  },
  {
    id: '2',
    slug: 'campana-vacunacion',
    title: 'Campaña de vacunación antigripal',
    summary:
      'Cronograma de vacunación para adultos mayores y grupos de riesgo en el centro de salud.',
    body: `El programa de vacunación antigripal 2026 continúa en el Centro de Salud local.

Están dirigidas a adultos mayores de 65 años, embarazadas y personas con factores de riesgo. No se requiere turno previo en los días establecidos para cada barrio.

Para más información, comunicarse con el área de Epidemiología municipal.`,
    publishedAt: '2026-03-28T14:30:00.000Z',
    category: 'Salud',
    imageUrl: null,
    galleryUrls: [],
  },
  {
    id: '3',
    slug: 'inscripciones-talleres',
    title: 'Inscripciones abiertas para talleres culturales',
    summary:
      'Danza, música y artes plásticas: cupos limitados durante el segundo cuatrimestre.',
    body: `La Dirección de Cultura abre las inscripciones para los talleres gratuitos del segundo cuatrimestre.

Las disciplinas incluyen folclore, guitarra, pintura y teatro infantil. Los interesados deben presentarse en la Casa de la Cultura con documentación del participante.

Las fechas de inicio se publicarán en la página oficial y redes sociales de la municipalidad.`,
    publishedAt: '2026-04-02T09:00:00.000Z',
    category: 'Cultura',
    imageUrl: null,
    galleryUrls: [],
  },
  {
    id: '4',
    slug: 'sesion-concejo-deliberante',
    title: 'Sesión ordinaria del Concejo Deliberante',
    summary:
      'Orden del día, proyectos en tratamiento y próximas audiencias públicas.',
    body: `El Concejo Deliberante informa la agenda de la sesión ordinaria correspondiente al mes de abril.

Entre los temas se incluyen dictámenes de comisiones y consultas vecinales. La transmisión será por las redes oficiales de la municipalidad.`,
    publishedAt: '2026-04-05T18:00:00.000Z',
    category: 'Institucional',
    imageUrl: null,
    galleryUrls: [],
  },
  {
    id: '5',
    slug: 'recoleccion-diferenciada',
    title: 'Nuevo cronograma de recolección diferenciada',
    summary:
      'Actualización de días y horarios por zona para residuos reciclables y orgánicos.',
    body: `La Secretaría de Medio Ambiente publica el cronograma actualizado de recolección diferenciada por barrio.

Se solicita a los vecinos respetar los horarios de salida de contenedores y consultar el mapa interactivo en la web municipal.`,
    publishedAt: '2026-04-07T11:15:00.000Z',
    category: 'Medio ambiente',
    imageUrl: null,
    galleryUrls: [],
  },
  {
    id: '6',
    slug: 'deporte-festejos-locales',
    title: 'El municipio acompaña festejos deportivos locales',
    summary:
      'Apoyo a clubes y escuelas deportivas para torneos regionales durante el fin de semana.',
    body: `Desde la Dirección de Deportes se confirma el acompañamiento logístico a las instituciones que participan de competencias regionales.

Se destacó el trabajo de entrenadores y familias en la organización de los eventos.`,
    publishedAt: '2026-04-08T08:45:00.000Z',
    category: 'Deportes',
    imageUrl: null,
    galleryUrls: [],
  },
]

let mockStore = [...MOCK_INITIAL]

function withDefaultStats(news) {
  const current = news?.stats || {}
  const shares = current.shares || {}
  return {
    ...news,
    stats: {
      views: Number(current.views || 0),
      shares: {
        facebook: Number(shares.facebook || 0),
        whatsapp: Number(shares.whatsapp || 0),
        instagram: Number(shares.instagram || 0),
        native: Number(shares.native || 0),
        copyLink: Number(shares.copyLink || 0),
        total: Number(shares.total || 0),
      },
      lastViewedAt: current.lastViewedAt || null,
      lastSharedAt: current.lastSharedAt || null,
    },
  }
}

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Sube una imagen al servidor (staff o editor de servicio de área). Devuelve URL pública estable. */
export async function uploadNewsImage(file, kind = 'gallery') {
  return uploadMediaImage(file, kind)
}

/** Importa una imagen desde una URL remota y la guarda en storage propio. */
export async function importNewsImageFromUrl(url, kind = 'gallery') {
  return importMediaImageFromUrl(url, kind)
}

export async function fetchNewsList() {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/news`)
    if (!res.ok) {
      const msg = await apiErrorMessage(res)
      throw new Error(msg || 'No se pudieron cargar las noticias')
    }
    const data = await res.json()
    return Array.isArray(data) ? data.map(withDefaultStats) : []
  }
  await delay()
  return [...mockStore]
    .map(withDefaultStats)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
}

export async function fetchNewsById(id) {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/news/${id}`)
    if (res.status === 404) return null
    if (!res.ok) {
      const msg = await apiErrorMessage(res)
      throw new Error(msg || 'No se pudo cargar la noticia')
    }
    const data = await res.json()
    return withDefaultStats(data)
  }
  await delay()
  const found = mockStore.find((n) => n.id === id || n.slug === id) ?? null
  return found ? withDefaultStats(found) : null
}

export async function recordNewsInteraction(idOrSlug, payload) {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/news/${idOrSlug}/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    return res.json().catch(() => null)
  }
  await delay(50)
  const idx = mockStore.findIndex((n) => n.id === idOrSlug || n.slug === idOrSlug)
  if (idx === -1) return null
  const news = withDefaultStats(mockStore[idx])
  if (payload?.type === 'view') {
    news.stats.views += 1
    news.stats.lastViewedAt = new Date().toISOString()
  }
  if (payload?.type === 'share' && payload?.channel) {
    const keyMap = {
      facebook: 'facebook',
      whatsapp: 'whatsapp',
      instagram: 'instagram',
      native: 'native',
      copy_link: 'copyLink',
    }
    const key = keyMap[payload.channel]
    if (key) {
      news.stats.shares[key] += 1
      news.stats.shares.total += 1
      news.stats.lastSharedAt = new Date().toISOString()
    }
  }
  mockStore[idx] = news
  return { ok: true, stats: news.stats }
}

export async function fetchNewsStatsOverview() {
  if (!API_BASE) {
    await delay(100)
    const list = mockStore.map(withDefaultStats)
    const totals = list.reduce(
      (acc, n) => {
        acc.total_news += 1
        acc.total_views += n.stats.views
        acc.total_shares += n.stats.shares.total
        acc.total_facebook += n.stats.shares.facebook
        acc.total_whatsapp += n.stats.shares.whatsapp
        acc.total_instagram += n.stats.shares.instagram
        acc.total_native += n.stats.shares.native
        acc.total_copy_link += n.stats.shares.copyLink
        return acc
      },
      {
        total_news: 0,
        total_views: 0,
        total_shares: 0,
        total_facebook: 0,
        total_whatsapp: 0,
        total_instagram: 0,
        total_native: 0,
        total_copy_link: 0,
      },
    )
    return {
      totals,
      topViews: [...list]
        .sort((a, b) => b.stats.views - a.stats.views)
        .slice(0, 5)
        .map((n) => ({ id: n.id, title: n.title, slug: n.slug, views_count: n.stats.views })),
      topShares: [...list]
        .sort((a, b) => b.stats.shares.total - a.stats.shares.total)
        .slice(0, 5)
        .map((n) => ({ id: n.id, title: n.title, slug: n.slug, shares_count: n.stats.shares.total })),
    }
  }
  const res = await fetch(`${API_BASE}/api/news/stats/overview`, {
    headers: { ...getAuthHeaders() },
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    const msg = await apiErrorMessage(res)
    throw new Error(msg || 'No se pudieron cargar las estadísticas de noticias')
  }
  return res.json()
}

export async function createNews(payload) {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/news`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(payload),
    })
    notifyUnauthorizedIfNeeded(res)
    if (!res.ok) {
      const msg = await apiErrorMessage(res)
      throw new Error(msg || 'No se pudo crear la noticia')
    }
    return res.json()
  }
  await delay()
  const created = {
    id: String(Date.now()),
    ...payload,
    publishedAt: new Date().toISOString(),
    imageUrl: payload.imageUrl ?? null,
    galleryUrls: Array.isArray(payload.galleryUrls) ? payload.galleryUrls : [],
  }
  mockStore = [created, ...mockStore]
  return created
}

export async function updateNews(id, payload) {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/news/${id}`, {
      method: 'PUT',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(payload),
    })
    notifyUnauthorizedIfNeeded(res)
    if (!res.ok) {
      throw await errorFromApiResponse(res, 'No se pudo actualizar la noticia')
    }
    return res.json()
  }
  await delay()
  const idx = mockStore.findIndex((n) => n.id === id)
  if (idx === -1) return null
  const updated = { ...mockStore[idx], ...payload, id }
  mockStore = [...mockStore.slice(0, idx), updated, ...mockStore.slice(idx + 1)]
  return updated
}

export async function deleteNews(id) {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/news/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    })
    notifyUnauthorizedIfNeeded(res)
    if (!res.ok) {
      const msg = await apiErrorMessage(res)
      throw new Error(msg || 'No se pudo eliminar la noticia')
    }
    return true
  }
  await delay()
  mockStore = mockStore.filter((n) => String(n.id) !== String(id))
  return true
}

import { getApiBase } from '../utils/apiConfig.js'
import { filterStaticSiteSearch } from '../data/siteSearchStatic.js'

const AREA_PROFILE_CACHE_MS = 60_000
let areaProfileCache = null
let areaProfileCacheAt = 0
let areaProfileCachePromise = null

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null
  const path = String(raw.path || '').trim()
  if (!path.startsWith('/')) return null
  return {
    kind: String(raw.kind || 'page'),
    id: String(raw.id ?? path),
    title: String(raw.title || '').trim() || path,
    subtitle: String(raw.subtitle || '').trim(),
    path,
  }
}

function normalizeSearchText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function excerpt(value, max = 120) {
  const text = String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}…`
}

function projectText(project) {
  return [
    project?.id,
    project?.title,
    project?.description,
    project?.status,
    project?.linkLabel,
  ].join(' ')
}

function serviceText(service) {
  return [
    service?.id,
    service?.title,
    service?.description,
    service?.mode,
    service?.personInCharge,
    service?.generalObjective,
    ...(Array.isArray(service?.projects) ? service.projects.map(projectText) : []),
  ].join(' ')
}

async function readJson(res) {
  return res.json().catch(() => ({}))
}

async function fetchAreaProfilesForSearch(base, signal) {
  const now = Date.now()
  if (areaProfileCache && now - areaProfileCacheAt < AREA_PROFILE_CACHE_MS) {
    return areaProfileCache
  }
  if (areaProfileCachePromise) return areaProfileCachePromise

  areaProfileCachePromise = (async () => {
    const areasRes = await fetch(`${base}/api/areas`, { signal, credentials: 'omit' })
    if (!areasRes.ok) return []
    const areasData = await readJson(areasRes)
    const areas = Array.isArray(areasData.items) ? areasData.items : []
    const limitedAreas = areas.slice(0, 80)
    const profiles = await Promise.all(
      limitedAreas.map(async (area) => {
        const slug = String(area?.slug || '').trim()
        if (!slug) return null
        try {
          const profileRes = await fetch(`${base}/api/areas/${encodeURIComponent(slug)}/profile`, {
            signal,
            credentials: 'omit',
          })
          if (!profileRes.ok) return null
          const profileData = await readJson(profileRes)
          return {
            area: {
              slug,
              title: String(area?.title || slug),
              description: String(area?.description || ''),
            },
            profile: profileData.profile || null,
          }
        } catch {
          return null
        }
      }),
    )
    const items = profiles.filter(Boolean)
    areaProfileCache = items
    areaProfileCacheAt = Date.now()
    return items
  })()

  try {
    return await areaProfileCachePromise
  } finally {
    areaProfileCachePromise = null
  }
}

function serviceSubtitle(areaTitle, service, normalizedQuery) {
  const projects = Array.isArray(service?.projects) ? service.projects : []
  const matchingProject = projects.find((project) =>
    normalizeSearchText(projectText(project)).includes(normalizedQuery),
  )
  const label = [areaTitle ? `Área: ${areaTitle}` : '', service?.mode || '']
    .filter(Boolean)
    .join(' · ')
  const context = excerpt(
    matchingProject?.description ||
      service?.description ||
      service?.generalObjective ||
      service?.personInCharge,
    130,
  )
  return [label, context].filter(Boolean).join(' — ')
}

async function fetchAreaServiceFallbackItems(base, query, signal) {
  const normalizedQuery = normalizeSearchText(query)
  if (normalizedQuery.length < 2) return []
  const profiles = await fetchAreaProfilesForSearch(base, signal)
  const out = []
  profiles.forEach(({ area, profile }) => {
    const services = Array.isArray(profile?.serviceBlocks) ? profile.serviceBlocks : []
    services
      .map((service, idx) => ({ service, idx }))
      .filter(({ service }) => normalizeSearchText(serviceText(service)).includes(normalizedQuery))
      .sort((a, b) => {
        const oa = Math.max(0, Math.round(Number(a.service?.sortOrder)) || 0)
        const ob = Math.max(0, Math.round(Number(b.service?.sortOrder)) || 0)
        if (oa !== ob) return oa - ob
        return a.idx - b.idx
      })
      .forEach(({ service }) => {
        const serviceId = String(service?.id || '').trim()
        const title = String(service?.title || '').trim()
        if (!serviceId || !title) return
        out.push({
          kind: 'area_service',
          id: `${area.slug}:${serviceId}`,
          title,
          subtitle: serviceSubtitle(area.title, service, normalizedQuery),
          path: `/areas/${encodeURIComponent(area.slug)}/servicios/${encodeURIComponent(serviceId)}`,
        })
      })
  })
  return out.slice(0, 16)
}

/**
 * @param {string} query
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ items: Array<{ kind: string, id: string, title: string, subtitle: string, path: string }> }>}
 */
export async function fetchGlobalSearch(query, signal) {
  const trimmed = String(query || '').trim()
  if (trimmed.length < 2) {
    return { items: [] }
  }

  const staticItems = filterStaticSiteSearch(trimmed)
  const base = getApiBase()

  if (!base) {
    return { items: staticItems.slice(0, 24) }
  }

  try {
    const url = `${base}/api/search?q=${encodeURIComponent(trimmed)}`
    const res = await fetch(url, { signal, credentials: 'omit' })
    const data = await res.json().catch(() => ({}))
    const apiRaw = Array.isArray(data.items) ? data.items : []
    const apiItems = apiRaw.map(normalizeItem).filter(Boolean)
    const fallbackItems = await fetchAreaServiceFallbackItems(base, trimmed, signal)
    const seen = new Set([...apiItems, ...fallbackItems].map((i) => i.path))
    const merged = [
      ...staticItems.filter((i) => !seen.has(i.path)),
      ...apiItems,
      ...fallbackItems.filter((i) => !apiItems.some((apiItem) => apiItem.path === i.path)),
    ]
    return { items: merged.slice(0, 28) }
  } catch {
    if (signal?.aborted) return { items: [] }
    try {
      const fallbackItems = await fetchAreaServiceFallbackItems(base, trimmed, signal)
      const seen = new Set(fallbackItems.map((i) => i.path))
      return {
        items: [
          ...staticItems.filter((i) => !seen.has(i.path)),
          ...fallbackItems,
        ].slice(0, 24),
      }
    } catch {
      return { items: staticItems.slice(0, 24) }
    }
  }
}

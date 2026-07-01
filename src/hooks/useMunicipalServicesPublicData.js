import { useEffect, useState } from 'react'
import {
  DEFAULT_MUNICIPAL_SERVICES,
  DEFAULT_SERVICES_PAGE_CONTENT,
  mergeServicesPageContent,
} from '../data/servicesPageContent.js'
import {
  fetchMunicipalServicesPublic,
  fetchServicesPageContent,
} from '../services/municipalServicesService.js'
import { isApiConfigured } from '../utils/apiConfig.js'

let cachedPayload = null
let inflightRequest = null

function toMergedState(remoteContent, remoteServices) {
  return {
    content: mergeServicesPageContent(DEFAULT_SERVICES_PAGE_CONTENT, remoteContent),
    services: Array.isArray(remoteServices) ? remoteServices : DEFAULT_MUNICIPAL_SERVICES,
  }
}

export function getMunicipalServicesPublicCache() {
  return cachedPayload
}

export function clearMunicipalServicesPublicCache() {
  cachedPayload = null
  inflightRequest = null
}

export async function loadMunicipalServicesPublicData({ force = false } = {}) {
  if (!force && cachedPayload) return cachedPayload
  if (!force && inflightRequest) return inflightRequest

  if (!isApiConfigured()) {
    cachedPayload = {
      content: DEFAULT_SERVICES_PAGE_CONTENT,
      services: DEFAULT_MUNICIPAL_SERVICES,
    }
    return cachedPayload
  }

  inflightRequest = Promise.all([
    fetchServicesPageContent(),
    fetchMunicipalServicesPublic(),
  ])
    .then(([remoteContent, remoteServices]) => {
      cachedPayload = toMergedState(remoteContent, remoteServices)
      return cachedPayload
    })
    .catch(() => {
      cachedPayload = {
        content: DEFAULT_SERVICES_PAGE_CONTENT,
        services: DEFAULT_MUNICIPAL_SERVICES,
      }
      return cachedPayload
    })
    .finally(() => {
      inflightRequest = null
    })

  return inflightRequest
}

/**
 * Datos públicos de servicios con caché en memoria.
 * La primera carga puede mostrar loading; las navegaciones internas son instantáneas.
 */
export function useMunicipalServicesPublicData() {
  const initial = cachedPayload || null
  const [state, setState] = useState(() => ({
    content: initial?.content ?? DEFAULT_SERVICES_PAGE_CONTENT,
    services: initial?.services ?? DEFAULT_MUNICIPAL_SERVICES,
    loading: !initial && isApiConfigured(),
    error: null,
  }))

  useEffect(() => {
    let cancelled = false

    void loadMunicipalServicesPublicData().then((payload) => {
      if (cancelled) return
      setState({
        content: payload.content,
        services: payload.services,
        loading: false,
        error: null,
      })
    })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}

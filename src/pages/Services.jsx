import { useEffect, useMemo, useState } from 'react'
import { ServicesPublicView } from '../components/services/ServicesPublicView.jsx'
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

export function Services() {
  const [content, setContent] = useState(DEFAULT_SERVICES_PAGE_CONTENT)
  const [services, setServices] = useState(DEFAULT_MUNICIPAL_SERVICES)
  const [loading, setLoading] = useState(true)

  const mergedContent = useMemo(
    () => mergeServicesPageContent(DEFAULT_SERVICES_PAGE_CONTENT, content),
    [content],
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!isApiConfigured()) {
        setLoading(false)
        return
      }
      try {
        const [remoteContent, remoteServices] = await Promise.all([
          fetchServicesPageContent(),
          fetchMunicipalServicesPublic(),
        ])
        if (cancelled) return
        setContent(remoteContent || DEFAULT_SERVICES_PAGE_CONTENT)
        setServices(Array.isArray(remoteServices) ? remoteServices : DEFAULT_MUNICIPAL_SERVICES)
      } catch {
        if (!cancelled) {
          setContent(DEFAULT_SERVICES_PAGE_CONTENT)
          setServices(DEFAULT_MUNICIPAL_SERVICES)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading && isApiConfigured()) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center px-4 py-16 text-sm text-slate-600">
        Cargando servicios...
      </div>
    )
  }

  return <ServicesPublicView content={mergedContent} services={services} />
}

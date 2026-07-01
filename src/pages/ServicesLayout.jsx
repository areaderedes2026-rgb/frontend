import { Outlet } from 'react-router-dom'
import { useMunicipalServicesPublicData } from '../hooks/useMunicipalServicesPublicData.js'
import { isApiConfigured } from '../utils/apiConfig.js'

export function ServicesLayout() {
  const { content, services, loading } = useMunicipalServicesPublicData()

  if (loading && isApiConfigured()) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center px-4 py-16 text-sm text-slate-600">
        Cargando servicios…
      </div>
    )
  }

  return <Outlet context={{ content, services }} />
}

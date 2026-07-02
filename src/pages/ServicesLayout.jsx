import { Outlet } from 'react-router-dom'
import { useMunicipalServicesPublicData } from '../hooks/useMunicipalServicesPublicData.js'
import { isApiConfigured } from '../utils/apiConfig.js'

export function ServicesLayout() {
  const { content, services, loading } = useMunicipalServicesPublicData()
  const contentReady = !isApiConfigured() || !loading

  return <Outlet context={{ content, services, contentReady }} />
}

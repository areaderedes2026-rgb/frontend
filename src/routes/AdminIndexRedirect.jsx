import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export function AdminIndexRedirect() {
  const { user } = useAuth()
  if (user?.role === 'area_service_editor') {
    return <Navigate to="/admin/my-area-services" replace />
  }
  return <Navigate to="/admin/dashboard" replace />
}

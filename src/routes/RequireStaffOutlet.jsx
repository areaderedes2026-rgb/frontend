import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export function RequireStaffOutlet() {
  const { user } = useAuth()
  if (user?.role !== 'admin' && user?.role !== 'editor') {
    return <Navigate to="/admin/my-area-services" replace />
  }
  return <Outlet />
}

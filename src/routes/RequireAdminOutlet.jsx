import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export function RequireAdminOutlet() {
  const { user } = useAuth()
  if (user?.role !== 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  return <Outlet />
}

import { Navigate, useLocation } from 'react-router-dom'
import { isAccessGranted, getCurrentUser } from '../lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireUser?: boolean
}

export function ProtectedRoute({ children, requireUser = false }: ProtectedRouteProps) {
  const location = useLocation()

  if (!isAccessGranted()) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  if (requireUser && !getCurrentUser()) {
    return <Navigate to="/select" replace />
  }

  return <>{children}</>
}

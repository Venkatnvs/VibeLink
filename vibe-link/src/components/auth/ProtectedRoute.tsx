import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAppSelector } from '@/store/hooks'
import { getUserProfile, initializeAuth } from '@/store/slices/authSlice'
import { useAppDispatch } from '@/store/hooks'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  requireOtpVerified?: boolean
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireOtpVerified = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, otpVerified, isLoading, isInitialized } = useAppSelector(state => state.auth)
  const location = useLocation()
  const dispatch = useAppDispatch()

  // Initialize auth state on first load
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth())
    }
  }, [dispatch, isInitialized])

  // Show loading state while checking authentication or initializing
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If OTP verification is required but user is not verified
  if (requireOtpVerified && !otpVerified) {
    return <Navigate to="/verify-otp" state={{ from: location }} replace />
  }

  // If user is authenticated but trying to access auth pages, redirect to home
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

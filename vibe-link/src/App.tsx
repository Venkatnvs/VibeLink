import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAppDispatch } from './store/hooks'
import { logout } from './store/slices/authSlice'
import { loadSettings } from './store/slices/settingsSlice'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './components/layout/app-layout'
import { HomePage } from './pages/home'
import { DiscoverPage } from './pages/discover'
import { ChatPage } from './pages/chat'
import { ProfilePage } from './pages/profile'
import { UserProfilePage } from './pages/user-profile'
import { SettingsPage } from './pages/settings'
import { NotFoundPage } from './pages/not-found'
import { LoginPage } from './pages/login'
import { RegisterPage } from './pages/register'
import { VerifyOTPPage } from './pages/verify-otp'
import { NotificationsPage } from './pages/notifications'

function App() {
  const dispatch = useAppDispatch()

  // Load settings on app start
  useEffect(() => {
    dispatch(loadSettings())
  }, [dispatch])

  // Listen for auth logout events from axios interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      dispatch(logout())
    }

    window.addEventListener('auth:logout', handleAuthLogout)
    
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout)
    }
  }, [dispatch])

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes - accessible to everyone */}
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          } />
          <Route path="/register" element={
            <ProtectedRoute requireAuth={false}>
              <RegisterPage />
            </ProtectedRoute>
          } />
          <Route path="/verify-otp" element={
            <ProtectedRoute requireAuth={false}>
              <VerifyOTPPage />
            </ProtectedRoute>
          } />
          
          {/* Protected routes - require authentication */}
          <Route path="/" element={
            <ProtectedRoute requireAuth={true}>
              <AppLayout>
                <HomePage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/discover" element={
            <ProtectedRoute requireAuth={true}>
              <AppLayout>
                <DiscoverPage />
              </AppLayout>
            </ProtectedRoute>
          } />


          <Route path="/chat" element={
            <ProtectedRoute requireAuth={true}>
              <AppLayout>
                <ChatPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/chat/:recipientId" element={
            <ProtectedRoute requireAuth={true}>
              <AppLayout>
                <ChatPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute requireAuth={true}>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/user/:userId" element={
            <ProtectedRoute requireAuth={true}>
              <AppLayout>
                <UserProfilePage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute requireAuth={true}>
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/notifications" element={
            <ProtectedRoute requireAuth={true}>
              <AppLayout>
                <NotificationsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'toast-theme',
            style: {
              background: 'var(--toast-background)',
              color: 'var(--toast-foreground)',
              border: '1px solid var(--toast-border)',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App

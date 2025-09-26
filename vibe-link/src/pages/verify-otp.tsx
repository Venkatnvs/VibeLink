import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { verifyOTP, sendOTP, clearError, clearAllOTP } from '@/store/slices/authSlice'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, ArrowLeft, RefreshCw } from 'lucide-react'

export function VerifyOTPPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { isLoading, error, otpVerified } = useAppSelector(state => state.auth)
  
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const [hasNavigated, setHasNavigated] = useState(false)
  const hasNavigatedRef = useRef(false)

  // Get email from location state or query params
  useEffect(() => {
    const stateEmail = location.state?.email
    const urlParams = new URLSearchParams(location.search)
    const queryEmail = urlParams.get('email')
    const localStorageEmail = localStorage.getItem('pendingVerificationEmail')
    
    console.log('OTP Page - Location state:', location.state)
    console.log('OTP Page - Query params:', location.search)
    console.log('OTP Page - LocalStorage email:', localStorageEmail)
    
    if (stateEmail) {
      console.log('Setting email from state:', stateEmail)
      setEmail(stateEmail)
    } else if (queryEmail) {
      console.log('Setting email from query:', queryEmail)
      setEmail(queryEmail)
    } else if (localStorageEmail) {
      console.log('Setting email from localStorage:', localStorageEmail)
      setEmail(localStorageEmail)
    } else {
      console.log('No email found, redirecting to register')
      // Redirect to register if no email
      navigate('/register')
    }
  }, [location, navigate])

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError())
    
    // Cleanup: clear OTP state when component unmounts
    return () => {
      dispatch(clearAllOTP())
      hasNavigatedRef.current = false
    }
  }, [dispatch])


  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  // Redirect if OTP is verified
  useEffect(() => {
    if (otpVerified && !hasNavigatedRef.current && location.pathname === '/verify-otp') {
      hasNavigatedRef.current = true
      // Clear OTP state to prevent continuous redirects
      dispatch(clearError())
      dispatch(clearAllOTP()) // Clear the sent OTP state
      
      // Clean up localStorage
      localStorage.removeItem('pendingVerificationEmail')
      
      navigate('/')
    }
  }, [otpVerified, navigate, dispatch, location.pathname])

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || !email) return

    try {
      await dispatch(verifyOTP({ email, otp })).unwrap()
      toast.success('Email verified successfully')
      // Redirect will happen automatically via useEffect
    } catch (error) {
      console.error('OTP verification failed:', error)
      const message = (error as any)?.toString?.() || 'OTP verification failed'
      toast.error(message)
    }
  }

  const handleResendOTP = async () => {
    if (!email || !canResend) return

    try {
      await dispatch(sendOTP(email)).unwrap()
      setCountdown(60) // 60 second countdown
      setCanResend(false)
      toast.success('Verification code sent')
    } catch (error) {
      console.error('Failed to resend OTP:', error)
      const message = (error as any)?.toString?.() || 'Failed to resend OTP'
      toast.error(message)
    }
  }

  const handleBackToRegister = () => {
    navigate('/register')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <p className="text-muted-foreground">
            We've sent a verification code to <strong>{email}</strong>
          </p>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="pl-10 text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code sent to your email
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !otp}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>
          
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleResendOTP}
                disabled={!canResend || isLoading}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {countdown > 0 
                  ? `Resend in ${countdown}s` 
                  : 'Resend Code'
                }
              </Button>
            </div>
            
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToRegister}
                className="text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Registration
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code? Check your spam folder or{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  request a new one
                </button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

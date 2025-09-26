import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { registerUser, clearError, clearAllOTP } from '@/store/slices/authSlice'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FRIENDSHIP_HASHTAGS } from '@/lib/constants'
import { Mail, Lock, User, Eye, EyeOff, Hash, MapPin, Camera, Upload } from 'lucide-react'

interface FormData {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  confirmPassword: string
  age: string
  profilePhoto: File | null
  location: {
    city: string
    state: string
    latitude: string
    longitude: string
  }
  bio: string
}

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { isLoading, error, otpSent } = useAppSelector(state => state.auth)
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    profilePhoto: null,
    location: {
      city: '',
      state: '',
      latitude: '',
      longitude: ''
    },
    bio: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [hasNavigated, setHasNavigated] = useState(false)
  const hasNavigatedRef = useRef(false)
  const [registrationEmail, setRegistrationEmail] = useState<string>('')

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError())
    
    // Cleanup: clear OTP state when component unmounts
    return () => {
      dispatch(clearAllOTP())
      hasNavigatedRef.current = false
      setRegistrationEmail('')
    }
  }, [dispatch])

  // Keep the useEffect for cleanup purposes only
  useEffect(() => {
    console.log('Register useEffect - otpSent:', otpSent, 'hasNavigated:', hasNavigatedRef.current, 'pathname:', location.pathname, 'registrationEmail:', registrationEmail)
    
    // This useEffect is now mainly for cleanup and debugging
    // Navigation is handled directly in the registration handler
  }, [otpSent, registrationEmail, navigate, formData.email, dispatch, location.pathname])


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      if (parent === 'location') {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            [child]: value
          }
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePhoto: file
      }))
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleHashtagToggle = (hashtag: string) => {
    setSelectedHashtags(prev => 
      prev.includes(hashtag) 
        ? prev.filter(h => h !== hashtag)
        : prev.length < 10 
          ? [...prev, hashtag]
          : prev
    )
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    
    if (selectedHashtags.length < 5) {
      alert('Please select at least 5 hashtags')
      return
    }

    if (!formData.age || !formData.profilePhoto || !formData.location.latitude || !formData.location.longitude) {
      alert('Please fill in all required fields including age, profile photo, and location coordinates')
      return
    }

    // Create FormData for file upload
    const formDataToSend = new FormData()
    formDataToSend.append('first_name', formData.firstName)
    formDataToSend.append('last_name', formData.lastName)
    formDataToSend.append('username', formData.username)
    formDataToSend.append('email', formData.email)
    formDataToSend.append('password', formData.password)
    formDataToSend.append('confirm_password', formData.confirmPassword)
    formDataToSend.append('age', formData.age)
    formDataToSend.append('profile_photo', formData.profilePhoto)
    formDataToSend.append('city', formData.location.city)
    formDataToSend.append('state', formData.location.state)
    formDataToSend.append('latitude', formData.location.latitude)
    formDataToSend.append('longitude', formData.location.longitude)
    formDataToSend.append('bio', formData.bio)
    
    // Append hashtags as JSON string
    selectedHashtags.forEach(hashtag => {
      formDataToSend.append('hashtags', hashtag)
    })

    try {
      const result = await dispatch(registerUser(formDataToSend)).unwrap()
      console.log('Registration successful:', result)
      toast.success('Registration successful. Please verify your email')
      
      // Store the email from the response
      const emailFromResponse = (result as any)?.email
      console.log('Email from response:', emailFromResponse)
      
      if (emailFromResponse) {
        setRegistrationEmail(emailFromResponse)
        console.log('Stored registration email:', emailFromResponse)
        
        // Navigate directly after successful registration
        console.log('Navigating to OTP verification with email:', emailFromResponse)
        navigate('/verify-otp', { 
          state: { 
            email: emailFromResponse,
            from: 'register'
          } 
        })
      } else {
        console.warn('No email found in registration response')
      }
      
      // Store email in localStorage as fallback
      localStorage.setItem('pendingVerificationEmail', emailFromResponse || formData.email)
      
    } catch (error) {
      console.error('Registration failed:', error)
      const message = (error as any)?.toString?.() || 'Registration failed'
      toast.error(message)
    }
  }

  const categories = [
    { id: 'all', name: 'All', count: FRIENDSHIP_HASHTAGS.length },
    { id: 'hobbies', name: 'Hobbies', count: FRIENDSHIP_HASHTAGS.filter(h => h.category === 'hobbies').length },
    { id: 'lifestyle', name: 'Lifestyle', count: FRIENDSHIP_HASHTAGS.filter(h => h.category === 'lifestyle').length },
    { id: 'career', name: 'Career', count: FRIENDSHIP_HASHTAGS.filter(h => h.category === 'career').length },
    { id: 'social', name: 'Social', count: FRIENDSHIP_HASHTAGS.filter(h => h.category === 'social').length },
    { id: 'culture', name: 'Culture', count: FRIENDSHIP_HASHTAGS.filter(h => h.category === 'culture').length },
    { id: 'health', name: 'Health', count: FRIENDSHIP_HASHTAGS.filter(h => h.category === 'health').length }
  ]

  const filteredHashtags = activeCategory === 'all' 
    ? FRIENDSHIP_HASHTAGS 
    : FRIENDSHIP_HASHTAGS.filter(h => h.category === activeCategory)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <CardTitle className="text-2xl">Create Your Friendship Profile</CardTitle>
          <p className="text-muted-foreground">Join VibeLink and find meaningful connections</p>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Choose username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="18"
                    max="100"
                    placeholder="Your age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profilePhoto">Profile Photo</Label>
                <div className="space-y-3">
                  {photoPreview && (
                    <div className="flex justify-center">
                      <img 
                        src={photoPreview} 
                        alt="Profile preview" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Input
                      id="profilePhoto"
                      name="profilePhoto"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <Label 
                      htmlFor="profilePhoto" 
                      className="flex items-center justify-center w-full h-12 px-4 py-2 border-2 border-dashed border-muted-foreground rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      <span>{photoPreview ? 'Change Photo' : 'Upload Profile Photo'}</span>
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Recommended: Square image, max 5MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="location.city"
                    placeholder="Your city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="location.state"
                    placeholder="Your state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="location.latitude"
                    type="number"
                    step="any"
                    placeholder="e.g., 37.7749"
                    value={formData.location.latitude}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="location.longitude"
                    type="number"
                    step="any"
                    placeholder="e.g., -122.4194"
                    value={formData.location.longitude}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Get Current Location Button */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          setFormData(prev => ({
                            ...prev,
                            location: {
                              ...prev.location,
                              latitude: position.coords.latitude.toString(),
                              longitude: position.coords.longitude.toString()
                            }
                          }))
                        },
                        (error) => {
                          console.error('Error getting location:', error)
                          alert('Unable to get your location. Please enter coordinates manually.')
                        }
                      )
                    } else {
                      alert('Geolocation is not supported by this browser. Please enter coordinates manually.')
                    }
                  }}
                  className="flex items-center space-x-2"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Get Current Location</span>
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself and what you're looking for in friendships..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Security</h3>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Hashtag Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Select Your Interests</h3>
                <span className="text-sm text-muted-foreground">
                  {selectedHashtags.length}/10 selected
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Choose hashtags that represent your interests, values, and what you're looking for in friendships. 
                This helps us find better matches for you.
              </p>

              {/* Category Tabs */}
              <div className="flex space-x-1 bg-muted p-1 rounded-lg overflow-x-auto">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveCategory(category.id)}
                    className="whitespace-nowrap"
                  >
                    {category.name} ({category.count})
                  </Button>
                ))}
              </div>

              {/* Hashtag Grid */}
              <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {filteredHashtags.map((hashtag) => (
                    <Badge
                      key={hashtag.name}
                      variant={selectedHashtags.includes(hashtag.name) ? 'default' : 'secondary'}
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                      onClick={() => handleHashtagToggle(hashtag.name)}
                    >
                      #{hashtag.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedHashtags.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Hashtags:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedHashtags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="default"
                        className="cursor-pointer"
                        onClick={() => handleHashtagToggle(tag)}
                      >
                        #{tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="rounded border-gray-300"
                required
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={selectedHashtags.length < 5 || isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

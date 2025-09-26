import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchPosts, createPost, toggleLike, toggleShare } from '@/store/slices/postsSlice'
import { updateUserApi } from '@/apis/auth'
import { FRIENDSHIP_HASHTAGS } from '@/lib/constants'
import { formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Edit,
  Settings,
  Grid3X3,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Plus,
  ImageIcon,
  X,
  Camera
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import ShareModal from '@/components/share/ShareModal'

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const { user, isLoading: authLoading } = useAppSelector(state => state.auth)
  const { posts, isLoading: postsLoading } = useAppSelector(state => state.posts)
  
  // Show loading state if user is not loaded yet
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  const [isEditing, setIsEditing] = useState(false)
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    bio: '',
    city: '',
    state: '',
    hashtags: [] as string[],
    interests: [] as string[]
  })
  const [newPost, setNewPost] = useState({
    content: '',
    image: null as File | null,
    hashtags: ''
  })
  const [imagePreview, setImagePreview] = useState<string>('')
  const [showHashtagSelector, setShowHashtagSelector] = useState(false)
  const [showInterestSelector, setShowInterestSelector] = useState(false)
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false)
  const [quickProfilePhoto, setQuickProfilePhoto] = useState<File | null>(null)
  const [quickProfilePhotoPreview, setQuickProfilePhotoPreview] = useState<string>('')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false)

  const [shareOpen, setShareOpen] = useState(false)
  const [sharePostId, setSharePostId] = useState<number | null>(null)

  const currentUser = user
  const userPosts = posts.filter(post => post && post.user && post.user.id === parseInt(currentUser?.id || '0'))
  const [searchParams] = useSearchParams()

  const highlightType = searchParams.get('highlight')
  const highlightPostId = searchParams.get('postId')

  useEffect(() => {
    if (highlightType === 'post' && highlightPostId && userPosts?.length) {
      const timeoutId = setTimeout(() => {
        const el = document.querySelector(`[data-post-id="${highlightPostId}"]`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
        }
      }, 400)
      return () => clearTimeout(timeoutId)
    }
  }, [highlightType, highlightPostId, userPosts])

  const shouldHighlightPost = (postId: number) => highlightType === 'post' && highlightPostId && Number(highlightPostId) === postId

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchPosts())
    }
  }, [dispatch, user?.id])

  const handleLike = (postId: number) => {
    dispatch(toggleLike(postId))
  }

  const handleShare = (postId: number) => {
    setSharePostId(postId)
    setShareOpen(true)
  }

  const handleEditProfile = () => {
    if (currentUser) {
      setEditData({
        firstName: currentUser?.first_name || '',
        lastName: currentUser?.last_name || '',
        age: currentUser?.age?.toString() || '',
        bio: currentUser?.bio || '',
        city: currentUser?.city || '',
        state: currentUser?.state || '',
        hashtags: [...(currentUser?.hashtags || [])],
        interests: [] // We'll need to add interests to the user model
      })
      setIsEditing(true)
    }
  }

  const handleSaveProfile = async () => {
    // Basic validation
    if (!editData.firstName.trim() || !editData.lastName.trim()) {
      alert('First name and last name are required')
      return
    }

    setIsUpdatingProfile(true)
    try {
      const formData = new FormData()
      formData.append('first_name', editData.firstName.trim())
      formData.append('last_name', editData.lastName.trim())
      formData.append('age', editData.age)
      formData.append('bio', editData.bio.trim())
      formData.append('city', editData.city.trim())
      formData.append('state', editData.state.trim())
      formData.append('hashtags', JSON.stringify(editData.hashtags))
      
      const response = await updateUserApi(formData)
      
      console.log('Profile updated successfully:', response.data)
      setIsEditing(false)
      
      // Optionally refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleHashtagToggle = (hashtag: string) => {
    setEditData(prev => ({
      ...prev,
      hashtags: prev.hashtags.includes(hashtag) 
        ? prev.hashtags.filter(h => h !== hashtag)
        : [...prev.hashtags, hashtag]
    }))
  }

  const handleInterestToggle = (interest: string) => {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewPost(prev => ({
        ...prev,
        image: file
      }))
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }


  const handleCreatePost = () => {
    if (newPost.content.trim()) {
      const postData = {
        content: newPost.content,
        image: newPost.image || undefined,
        hashtags: newPost.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }
      
      dispatch(createPost(postData))
      setNewPost({ content: '', image: null, hashtags: '' })
      setImagePreview('')
      setIsCreatingPost(false)
    }
  }

  const handleCancelPost = () => {
    setNewPost({ content: '', image: null, hashtags: '' })
    setImagePreview('')
    setIsCreatingPost(false)
  }

  const removeImage = () => {
    setNewPost(prev => ({ ...prev, image: null }))
    setImagePreview('')
  }

  const handleQuickProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setQuickProfilePhoto(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setQuickProfilePhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleQuickProfilePhotoSave = async () => {
    if (quickProfilePhoto) {
      setIsUpdatingPhoto(true)
      try {
        const formData = new FormData()
        formData.append('profile_photo', quickProfilePhoto)
        
        const response = await updateUserApi(formData)
        
        // Update the user in the auth state
        // Note: You might want to dispatch an action to update the user in Redux store
        console.log('Profile photo updated successfully:', response.data)
        
        // Close the modal and reset state
        setShowProfilePhotoModal(false)
        setQuickProfilePhoto(null)
        setQuickProfilePhotoPreview('')
        
        // Optionally refresh the page to show the updated photo
        window.location.reload()
      } catch (error) {
        console.error('Failed to update profile photo:', error)
        alert('Failed to update profile photo. Please try again.')
      } finally {
        setIsUpdatingPhoto(false)
      }
    }
  }

  const handleQuickProfilePhotoCancel = () => {
    setShowProfilePhotoModal(false)
    setQuickProfilePhoto(null)
    setQuickProfilePhotoPreview('')
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        shareUrl={`${window.location.origin}/profile?highlight=post&postId=${sharePostId ?? ''}`}
        shareText={sharePostId ? userPosts.find(p => p.id === sharePostId)?.content?.slice(0, 140) : undefined}
        onShared={() => {
          if (sharePostId) {
            dispatch(toggleShare(sharePostId))
          }
        }}
      />
      {/* Profile Header */}
      <Card className="mb-8">
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-t-lg"></div>
          <div className="absolute bottom-0 left-8 transform translate-y-1/2">
            <Dialog open={showProfilePhotoModal} onOpenChange={setShowProfilePhotoModal}>
              <DialogTrigger asChild>
                <div className="relative group cursor-pointer">
                  <Avatar className="w-32 h-32 border-4 border-white group-hover:opacity-80 transition-opacity">
                    <AvatarImage src={currentUser?.profile_photo} />
                    <AvatarFallback className="text-4xl">{currentUser?.first_name?.[0] || currentUser?.username?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Update Profile Photo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={quickProfilePhotoPreview || currentUser?.profile_photo} />
                      <AvatarFallback className="text-2xl">
                        {currentUser?.first_name?.[0] || currentUser?.username?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleQuickProfilePhotoChange}
                      className="hidden"
                      id="quick-profile-photo"
                    />
                    <Label
                      htmlFor="quick-profile-photo"
                      className="flex items-center justify-center w-full h-10 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      <span>Choose New Photo</span>
                    </Label>
                  </div>

                  {quickProfilePhotoPreview && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground text-center">Preview:</p>
                      <div className="relative">
                        <img
                          src={quickProfilePhotoPreview}
                          alt="Profile preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => {
                            setQuickProfilePhoto(null)
                            setQuickProfilePhotoPreview('')
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={handleQuickProfilePhotoCancel}
                      disabled={isUpdatingPhoto}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleQuickProfilePhotoSave}
                      disabled={!quickProfilePhoto || isUpdatingPhoto}
                    >
                      {isUpdatingPhoto ? 'Updating...' : 'Update Photo'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <CardContent className="pt-20 pb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editData.firstName}
                        onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editData.lastName}
                        onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        min="18"
                        max="100"
                        value={editData.age}
                        onChange={(e) => setEditData(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="Age"
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={currentUser?.username || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={editData.city}
                        onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={editData.state}
                        onChange={(e) => setEditData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="State"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editData.bio}
                      onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Hashtags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editData.hashtags.map((tag) => (
                        <Badge key={tag} variant="default" className="cursor-pointer" onClick={() => handleHashtagToggle(tag)}>
                          #{tag} ×
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" onClick={() => setShowHashtagSelector(true)}>
                      Edit Hashtags
                    </Button>
                  </div>

                  <div>
                    <Label>Interests</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editData.interests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="cursor-pointer" onClick={() => handleInterestToggle(interest)}>
                          {interest} ×
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" onClick={() => setShowInterestSelector(true)}>
                      Edit Interests
                    </Button>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      disabled={isUpdatingProfile}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{currentUser?.first_name} {currentUser?.last_name}</h1>
                  <p className="text-muted-foreground mb-2">@{currentUser?.username}</p>
                  <p className="text-foreground mb-4">{currentUser?.bio}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{currentUser?.city}, {currentUser?.state}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(currentUser?.date_joined || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(currentUser?.hashtags || []).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {!isEditing && (
                <Button variant="outline" onClick={handleEditProfile}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{formatNumber(userPosts.length)}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{formatNumber(user?.followers_count || 0)}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{formatNumber(user?.following_count || 0)}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hashtag Selector Modal */}
      {showHashtagSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Select Hashtags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {FRIENDSHIP_HASHTAGS.map((hashtag) => (
                  <Badge
                    key={hashtag.name}
                    variant={editData.hashtags.includes(hashtag.name) ? 'default' : 'secondary'}
                    className="cursor-pointer text-xs"
                    onClick={() => handleHashtagToggle(hashtag.name)}
                  >
                    #{hashtag.name}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowHashtagSelector(false)}>Done</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interest Selector Modal */}
      {showInterestSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Select Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {['hiking', 'reading', 'cooking', 'yoga', 'meditation', 'photography', 'gaming', 'music', 'art', 'travel', 'fitness', 'writing'].map((interest) => (
                  <Badge
                    key={interest}
                    variant={editData.interests.includes(interest) ? 'default' : 'secondary'}
                    className="cursor-pointer text-xs"
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowInterestSelector(false)}>Done</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Post Section */}
      <Card className="mb-8">
        <CardContent className="p-6">
          {isCreatingPost ? (
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[100px]"
              />
              
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Post preview"
                    className="w-full max-h-64 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="post-image"
                  />
                  <Label
                    htmlFor="post-image"
                    className="flex items-center justify-center w-full h-10 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    <span>Add Image</span>
                  </Label>
                </div>
                <Input
                  placeholder="Hashtags (optional)"
                  value={newPost.hashtags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, hashtags: e.target.value }))}
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <Button variant="outline" onClick={handleCancelPost}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePost} disabled={!newPost.content.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={currentUser?.profile_photo} />
                <AvatarFallback>{currentUser?.first_name?.[0] || currentUser?.username?.[0]}</AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                className="flex-1 justify-start text-muted-foreground"
                onClick={() => setIsCreatingPost(true)}
              >
                What's on your mind?
              </Button>
              <Button variant="outline" size="icon">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your Posts</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'} shared
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreatingPost(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Post</span>
            </Button>
          </div>
        </div>

        {postsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4 text-lg">Loading your posts...</p>
          </div>
        ) : userPosts.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Grid3X3 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">No posts yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Share your thoughts, experiences, and connect with others by creating your first post.
              </p>
              <Button onClick={() => setIsCreatingPost(true)} size="lg" className="px-8">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {userPosts.map((post) => (
              <Card key={post.id} data-post-id={post.id} className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-card/50 backdrop-blur-sm ${shouldHighlightPost(post.id) ? 'ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                      <AvatarImage src={post.user?.profile_photo} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                        {post.user?.full_name?.[0] || post.user?.username?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate">
                        {post.user?.full_name || post.user?.username}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{post.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground leading-relaxed line-clamp-4">{post.content}</p>

                  {post.image && (
                    <div className="relative rounded-xl overflow-hidden group/image">
                      <img
                        src={post.image}
                        alt="Post content"
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover/image:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-300" />
                    </div>
                  )}

                  {post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.hashtags.slice(0, 3).map((hashtag) => (
                        <Badge 
                          key={hashtag} 
                          variant="secondary" 
                          className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                        >
                          #{hashtag}
                        </Badge>
                      ))}
                      {post.hashtags.length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          +{post.hashtags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center space-x-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={`p-2 h-auto rounded-full transition-all duration-200 ${
                          post.is_liked 
                            ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                            : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                        <span className="ml-2 text-xs font-medium">{post.likes_count}</span>
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(post.id)}
                      className={`p-2 h-auto rounded-full transition-all duration-200 ${
                        post.is_shared 
                          ? 'text-blue-500 bg-blue-50 hover:bg-blue-100' 
                          : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="ml-2 text-xs font-medium">{post.shares_count}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchUserPosts, toggleLike, toggleShare } from '@/store/slices/postsSlice'
import { fetchUserProfile, toggleFollow } from '@/store/slices/socialSlice'
import { formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Grid3X3, 
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Calendar,
  UserPlus,
  MessageCircle as MessageIcon
} from 'lucide-react'

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const { userPosts, isLoading: postsLoading } = useAppSelector(state => state.posts)
  const { currentUserProfile: profileUser, isLoading: profileLoading } = useAppSelector(state => state.social)

  // Get highlight parameters from URL
  const highlightType = searchParams.get('highlight')
  const highlightPostId = searchParams.get('postId')
  const highlightHashtag = searchParams.get('hashtag')

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile(parseInt(userId)))
      dispatch(fetchUserPosts(parseInt(userId)))
    }
  }, [dispatch, userId])

  useEffect(() => {
    if (!profileLoading && !profileUser && userId) {
      // Don't navigate to 404 immediately, show loading or error state
      console.log('User profile not found for ID:', userId)
    }
  }, [profileUser, profileLoading, navigate, userId])

  // Auto-scroll to highlighted content
  useEffect(() => {
    if (highlightType && userPosts.length > 0) {
      const scrollToHighlighted = () => {
        if (highlightType === 'post' && highlightPostId) {
          // Find the highlighted post element
          const postElement = document.querySelector(`[data-post-id="${highlightPostId}"]`)
          if (postElement) {
            postElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            })
            return
          }
        }
        
        if (highlightType === 'hashtag' && highlightHashtag) {
          // Find the first post with the highlighted hashtag
          const postWithHashtag = userPosts.find(post => 
            post.hashtags.some(tag => 
              tag.toLowerCase() === highlightHashtag.toLowerCase()
            )
          )
          
          if (postWithHashtag) {
            const postElement = document.querySelector(`[data-post-id="${postWithHashtag.id}"]`)
            if (postElement) {
              postElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
              })
            }
          }
        }
      }

      // Small delay to ensure DOM is rendered
      const timeoutId = setTimeout(scrollToHighlighted, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [highlightType, highlightPostId, highlightHashtag, userPosts])

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profileUser && !profileLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">User not found</h2>
          <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return null
  }

  const handleLike = (postId: number) => {
    dispatch(toggleLike(postId))
  }

  const handleShare = (postId: number) => {
    dispatch(toggleShare(postId))
  }

  const handleFollow = () => {
    dispatch(toggleFollow(profileUser.id))
  }

  const handleMessage = () => {
    // In a real app, this would navigate to chat
    navigate(`/chat`)
  }

  const isFollowing = profileUser.is_following

  // Function to check if a post should be highlighted
  const shouldHighlightPost = (postId: number) => {
    return highlightType === 'post' && highlightPostId && parseInt(highlightPostId) === postId
  }

  // Function to highlight hashtags in post content
  const highlightHashtagsInContent = (content: string) => {
    if (!highlightHashtag) return content
    
    const regex = new RegExp(`#${highlightHashtag}`, 'gi')
    return content.replace(regex, `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">#$1</mark>`)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </div>

      {/* Highlight Indicator */}
      {highlightType && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              {highlightType === 'post' && 'Highlighting post from search result - scrolling to content'}
              {highlightType === 'hashtag' && `Highlighting hashtag #${highlightHashtag} - scrolling to content`}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(`/user/${userId}`)}
              className="ml-auto text-xs h-6 px-2"
            >
              Clear Highlight
            </Button>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <Card className="mb-8">
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-t-lg"></div>
          
          {/* Profile Picture */}
          <div className="absolute bottom-0 left-8 transform translate-y-1/2">
            <Avatar className="w-32 h-32 border-4 border-white">
              <AvatarImage src={profileUser.profile_photo} />
              <AvatarFallback className="text-4xl">{profileUser.full_name?.[0] || profileUser.username?.[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <CardContent className="pt-20 pb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{profileUser.full_name || profileUser.username}</h1>
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  {profileUser.match_percentage}% Match
                </Badge>
              </div>
              <p className="text-muted-foreground mb-2">@{profileUser.username}</p>
              <p className="text-foreground mb-4">{profileUser.bio}</p>
              
              <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profileUser.city}, {profileUser.state}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{Math.round(profileUser.distance)}km away</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined {profileUser.date_joined ? new Date(profileUser.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '-'}
                  </span>
                </div>
              </div>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(profileUser.hashtags || []).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant={isFollowing ? 'outline' : 'default'}
                onClick={handleFollow}
                className="flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
              </Button>
              <Button variant="outline" onClick={handleMessage}>
                <MessageIcon className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{formatNumber(profileUser.posts_count)}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{formatNumber(profileUser.followers_count)}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{formatNumber(profileUser.following_count)}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
            <Grid3X3 className="h-5 w-5" />
            <span>{profileUser.full_name || profileUser.username}'s Posts</span>
          </h2>
        </div>
        
        {postsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading posts...</p>
          </div>
        ) : userPosts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid3X3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground">This user hasn't shared any posts yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPosts.map((post) => (
              <Card 
                key={post.id} 
                data-post-id={post.id}
                className={`card-hover transition-all duration-300 ${
                  shouldHighlightPost(post.id) 
                    ? 'ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg animate-pulse' 
                    : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={post.user.profile_photo} />
                      <AvatarFallback>{post.user.full_name?.[0] || post.user.username?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{post.user.full_name || post.user.username}</div>
                      <div className="text-xs text-muted-foreground">{post.timestamp}</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p 
                    className="text-sm text-foreground line-clamp-3"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightHashtagsInContent(post.content) 
                    }}
                  />
                  
                  {post.image && (
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={post.image} 
                        alt="Post content" 
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {post.hashtags.slice(0, 2).map((hashtag) => (
                      <Badge 
                        key={hashtag} 
                        variant="secondary" 
                        className={`text-xs ${
                          highlightHashtag && hashtag.toLowerCase() === highlightHashtag.toLowerCase()
                            ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100'
                            : ''
                        }`}
                      >
                        #{hashtag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleLike(post.id)}
                        className={`p-1 h-auto ${
                          post.is_liked ? 'text-red-500' : 'text-muted-foreground'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                        <span className="ml-1 text-xs">{post.likes_count}</span>
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="p-1 h-auto text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleShare(post.id)}
                      className={`p-1 h-auto ${post.is_shared ? 'text-blue-500' : 'text-muted-foreground'}`}
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="ml-1 text-xs">{post.shares_count}</span>
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

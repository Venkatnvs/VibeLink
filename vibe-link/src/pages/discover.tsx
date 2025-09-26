import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleFollow, fetchAIRecommendations } from '@/store/slices/socialSlice'
import { startConversation } from '@/store/slices/chatSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserPlus,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Heart
} from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export function DiscoverPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const { aiRecommendations: users, isLoading, followLoadingIds } = useAppSelector(state => state.social)
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  
  const cardRef = useRef<HTMLDivElement>(null)

  // Minimum swipe distance to trigger action
  const minSwipeDistance = 50

  // Load AI recommendations on component mount
  useEffect(() => {
    dispatch(fetchAIRecommendations({ page: 1, per_page: 10 }))
  }, [dispatch])

  // Handle hashtag filter from URL
  const hashtagFilter = searchParams.get('hashtag')
  
  // Filter users by hashtag if provided
  const filteredUsers = hashtagFilter 
    ? (users || []).filter(user => 
        user.hashtags && user.hashtags.some(tag => 
          tag.toLowerCase().includes(hashtagFilter.toLowerCase())
        )
      )
    : (users || [])

  // Filter out already-followed users defensively (in case backend/slice missed any)
  const visibleUsers = filteredUsers.filter(u => !u.is_following)
  const currentProfile = visibleUsers[currentIndex]

  // Clamp index when users list changes (e.g., after following someone removed from list)
  useEffect(() => {
    if (currentIndex >= visibleUsers.length) {
      setCurrentIndex(visibleUsers.length > 0 ? visibleUsers.length - 1 : 0)
    }
  }, [visibleUsers.length])

  const handleFollow = async (userId: number) => {
    try {
      await dispatch(toggleFollow(userId)).unwrap()
      // Refetch recommendations to remove the followed user immediately
      dispatch(fetchAIRecommendations(
        { page: 1, per_page: 10 }
      ))
    } catch (error) {
      console.error('Failed to follow user:', error)
    }
  }

  const handleMessage = async (userId: number, customMessage?: string) => {
    try {
      // Start a conversation with the user
      await dispatch(startConversation(userId)).unwrap()
      // Navigate to chat page with pre-filled message using AI insights
      const currentUser = currentProfile
      
      let message = customMessage
      if (!message) {
        // Use conversation starters from AI insights if available
        if (currentUser.conversation_starters && currentUser.conversation_starters.length > 0) {
          // Use the first conversation starter
          message = currentUser.conversation_starters[0]
        } else if (currentUser.shared_interests && currentUser.shared_interests.length > 0) {
          // Fallback to shared interests
          const interests = currentUser.shared_interests.slice(0, 2).join(' and ')
          message = `Hi! I noticed we both like ${interests}. Would love to chat!`
        } else if (currentUser.compatibility_reasons && currentUser.compatibility_reasons.length > 0) {
          // Fallback to compatibility reasons
          message = `Hi! I saw your profile and thought we might have a lot in common. ${currentUser.compatibility_reasons[0]}`
        } else {
          // Default message
          message = 'Hi! Would love to chat!'
        }
      }
      
      navigate(`/chat/${userId}`, { state: { preFilledMessage: message } })
    } catch (error) {
      console.error('Failed to start conversation:', error)
      // Still navigate to chat page even if starting conversation fails
      navigate('/chat')
    }
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isAnimating || !currentProfile) return
    
    setIsAnimating(true)
    setSwipeDirection(direction)
    
    // If swiped right, follow the user
    if (direction === 'right') {
      handleFollow(currentProfile.id)
    }
    
    // Animate the swipe
    setTimeout(() => {
      setSwipeDirection(null)
      setIsAnimating(false)
      setCurrentIndex(prev => Math.min(prev + 1, Math.max(visibleUsers.length - 1, 0)))
    }, 300)
  }

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY)
    
    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        // Swiped left - pass
        handleSwipe('left')
      } else {
        // Swiped right - like/follow
        handleSwipe('right')
      }
    }
    
    setTouchStart(null)
    setTouchEnd(null)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading users...</div>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">No people found</h2>
          <p className="text-muted-foreground mb-6">Try adjusting your search terms or location radius</p>
          <Button onClick={handleReset}>Reset Filters</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Hashtag Filter Indicator */}
      {hashtagFilter && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-lg px-4 py-2">
            <Badge variant="secondary">
              #{hashtagFilter}
            </Badge>
            <span className="text-sm text-muted-foreground">Filtering by hashtag</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/discover')}
              className="text-xs h-6 px-2"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="flex justify-center mb-6">
        <Card 
          ref={cardRef}
          className={`w-full max-w-md relative transition-all duration-300 ${
            swipeDirection === 'left' ? 'transform -translate-x-full opacity-0' :
            swipeDirection === 'right' ? 'transform translate-x-full opacity-0' :
            'transform translate-x-0 opacity-100'
          }`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Avatar className="w-24 h-24 mx-auto cursor-pointer" onClick={() => navigate(`/user/${currentProfile.id}${hashtagFilter ? `?highlight=hashtag&hashtag=${encodeURIComponent(hashtagFilter)}` : ''}`)}>
                <AvatarImage src={currentProfile.profile_photo} />
                <AvatarFallback className="text-2xl">{currentProfile.full_name?.[0] || currentProfile.username?.[0]}</AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">{currentProfile.full_name || currentProfile.username}</h2>
                <p className="text-muted-foreground mb-2">@{currentProfile.username}</p>
                <p className="text-foreground leading-relaxed">{currentProfile.bio}</p>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  {currentProfile.match_percentage}% Match
                </Badge>
                <Badge variant="secondary">
                  {Math.round(currentProfile.distance)}km away
                </Badge>
                {currentProfile.follows_you && (
                  <Badge variant="secondary">Follows you</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {currentProfile.hashtags.slice(0, 4).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className={`text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors ${
                      hashtagFilter && tag.toLowerCase() === hashtagFilter.toLowerCase()
                        ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100'
                        : ''
                    }`}
                    onClick={() => navigate(`/user/${currentProfile.id}?highlight=hashtag&hashtag=${encodeURIComponent(tag)}`)}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={currentProfile.is_following ? 'outline' : 'default'}
                  onClick={() => handleFollow(currentProfile.id)}
                  className="flex-1"
                  disabled={followLoadingIds.includes(currentProfile.id)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {followLoadingIds.includes(currentProfile.id) ? 'Loading...' : (currentProfile.is_following ? 'Following' : 'Follow')}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleMessage(currentProfile.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {currentProfile.compatibility_reasons && currentProfile.compatibility_reasons.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
            </div>
            
            <div className="space-y-4">
              {/* Compatibility Reasons */}
              <Collapsible 
                open={expandedCard === currentProfile.id} 
                onOpenChange={() => setExpandedCard(expandedCard === currentProfile.id ? null : currentProfile.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <span className="text-sm font-medium text-foreground">Why you're compatible</span>
                    {expandedCard === currentProfile.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {currentProfile.compatibility_reasons.map((reason, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Heart className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{reason}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Conversation Starters */}
              {currentProfile.conversation_starters && currentProfile.conversation_starters.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Conversation Starters</h4>
                  <div className="space-y-1">
                    {currentProfile.conversation_starters.slice(0, 2).map((starter, index) => (
                      <div 
                        key={index} 
                        className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleMessage(currentProfile.id, starter)}
                        title="Click to send this message"
                      >
                        "{starter}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared Interests */}
              {currentProfile.shared_interests && currentProfile.shared_interests.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Shared Interests</h4>
                  <div className="flex flex-wrap gap-1">
                    {currentProfile.shared_interests.slice(0, 5).map((interest, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
                        onClick={() => handleMessage(currentProfile.id, `Hi! I noticed we both like ${interest}. Would love to chat!`)}
                        title="Click to send message about this interest"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground">{currentProfile.followers_count}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{currentProfile.following_count}</div>
            <div className="text-sm text-muted-foreground">Following</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{currentProfile.posts_count}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </div>
        </div>
      </div>

      {/* Navigation and Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Profile {currentIndex + 1} of {users.length}</span>
          <span>AI-powered recommendations</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / users.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === users.length - 1}
          className="flex items-center space-x-2"
        >
          <span>Next</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Swipe Instructions */}
      <div className="text-center mt-6 text-sm text-muted-foreground">
        <p>Swipe left to pass, swipe right to follow</p>
        <p className="text-xs mt-1">Or use the navigation buttons above</p>
      </div>
    </div>
  )
}

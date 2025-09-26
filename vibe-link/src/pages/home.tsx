import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchFollowerPosts, createPost, toggleLike, toggleShare } from '@/store/slices/postsSlice'
import { toggleFollow, fetchTopMatches } from '@/store/slices/socialSlice'
import { startConversation } from '@/store/slices/chatSlice'
import { formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Heart,
  Share2,
  MessageCircle,
  MapPin,
  Users,
  Plus,
  ImageIcon,
  UserPlus,
  X
} from 'lucide-react'

export function HomePage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const { followerPosts, isLoading: postsLoading } = useAppSelector(state => state.posts)
  const { topMatches: suggestedUsers, followLoadingIds } = useAppSelector(state => state.social)
  
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [newPost, setNewPost] = useState({
    content: '',
    image: null as File | null,
    hashtags: ''
  })
  const [imagePreview, setImagePreview] = useState<string>('')

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchFollowerPosts())
    dispatch(fetchTopMatches())
  }, [dispatch])

  const handleLike = (postId: number) => {
    dispatch(toggleLike(postId))
  }

  const handleShare = (postId: number) => {
    dispatch(toggleShare(postId))
  }

  const handleFollow = (userId: number) => {
    dispatch(toggleFollow(userId))
  }

  const handleMessage = async (userId: number) => {
    try {
      // Start a conversation with the user
      await dispatch(startConversation(userId)).unwrap()
      // Navigate to chat page with recipient ID
      navigate(`/chat/${userId}`)
    } catch (error) {
      console.error('Failed to start conversation:', error)
      // Still navigate to chat page even if starting conversation fails
      navigate('/chat')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewPost(prev => ({
        ...prev,
        image: file
      }))

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreatePost = () => {
    if (newPost.content.trim()) {
      const hashtags = newPost.hashtags ? newPost.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      
      dispatch(createPost({
        content: newPost.content,
        image: newPost.image || undefined,
        hashtags
      }))
      
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

  // Get top 6 suggested users
  const userMatches = Array.isArray(suggestedUsers) ? suggestedUsers.filter(user => user).slice(0, 6) : []

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
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
                <AvatarImage src={user?.profile_photo} />
                <AvatarFallback>{user?.username?.[0] || 'U'}</AvatarFallback>
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

      {/* Matches Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center space-x-2">
          <Users className="h-6 w-6 text-primary" />
          <span>Your Top Matches</span>
        </h2>
        {userMatches.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No matches found yet. We’ll update these soon based on your activity.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userMatches.map((match) => (
            <Card key={match.id} className="card-hover">
              <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-16 h-16 flex-shrink-0 cursor-pointer" onClick={() => navigate(`/user/${match.id}`)}>
                      <AvatarImage src={match.profile_photo} />
                      <AvatarFallback className="text-lg">{match.full_name?.[0] || match.username?.[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className="font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors flex-1 mr-2"
                          onClick={() => navigate(`/user/${match.id}`)}
                        >
                          {match.full_name || match.username}
                        </h3>
                        <Badge variant="default" className="bg-primary text-primary-foreground flex-shrink-0">
                          {match.match_percentage}% Match
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{match.bio}</p>

                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-3">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{Math.round(match.distance)}km away</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant={match.is_following ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => handleFollow(match.id)}
                          className="flex-1 min-w-0"
                          disabled={followLoadingIds.includes(match.id)}
                        >
                          <UserPlus className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{followLoadingIds.includes(match.id) ? 'Loading...' : (match.is_following ? 'Following' : 'Follow')}</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 min-w-0"
                          onClick={() => handleMessage(match.id)}
                        >
                          <MessageCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">Message</span>
                        </Button>
                      </div>
                    </div>
                  </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Your Feed</h2>

        {postsLoading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Loading posts...</div>
          </div>
        ) : !Array.isArray(followerPosts) || followerPosts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">No posts yet. Create your first post or follow some users to see their posts!</div>
          </div>
        ) : (
          followerPosts.filter(post => post && post.user).map((post) => (
            <Card key={post.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                    onClick={() => navigate(`/user/${post.user?.id}`)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.user?.profile_photo} />
                      <AvatarFallback>{post.user?.full_name?.[0] || post.user?.username?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">{post.user?.full_name || post.user?.username}</div>
                      <div className="text-sm text-muted-foreground">
                        @{post.user?.username} • {post.timestamp}
                      </div>
                    </div>
                  </div>
                  {/* Only show follow/message buttons for other users' posts */}
                  {post.user?.id !== Number(user?.id) && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={post.user?.is_following ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleFollow(post.user?.id)}
                        className="text-xs"
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        {post.user?.is_following ? 'Following' : 'Follow'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMessage(post.user?.id)}
                        className="text-xs"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Post Content */}
                <p className="text-foreground leading-relaxed">{post.content}</p>

                {/* Post Image */}
                {post.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={post.image}
                      alt="Post content"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                {/* Hashtags */}
                <div className="flex flex-wrap gap-2">
                  {post.hashtags.map((hashtag) => (
                    <Badge
                      key={hashtag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      #{hashtag}
                    </Badge>
                  ))}
                </div>

                {/* Post Actions - Only Like and Share */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 ${
                        post.is_liked ? 'text-red-500' : 'text-muted-foreground'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${post.is_liked ? 'fill-current' : ''}`} />
                      <span>{formatNumber(post.likes_count)}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(post.id)}
                      className="flex items-center space-x-2 text-muted-foreground"
                    >
                      <Share2 className="h-5 w-5" />
                      <span>{formatNumber(post.shares_count)}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

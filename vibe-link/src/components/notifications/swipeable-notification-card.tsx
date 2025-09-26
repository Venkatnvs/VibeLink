import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Heart,
  Share2,
  UserPlus,
  MessageCircle,
  Sparkles,
  Bell,
  Check,
  Trash2,
  Clock
} from 'lucide-react'

interface SwipeableNotificationCardProps {
  notification: {
    id: number
    notification_type: string
    content: string
    is_read: boolean
    timestamp: string
    from_user?: string
  }
  onMarkAsRead: (id: number) => void
  onClear: (id: number) => void
}

export function SwipeableNotificationCard({ 
  notification, 
  onMarkAsRead, 
  onClear
}: SwipeableNotificationCardProps) {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'share':
        return <Share2 className="h-4 w-4 text-blue-500" />
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />
      case 'message':
        return <MessageCircle className="h-4 w-4 text-purple-500" />
      case 'match':
        return <Sparkles className="h-4 w-4 text-pink-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'share':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'follow':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'message':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'match':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const handleStart = (clientX: number) => {
    setIsDragging(true)
    setStartX(clientX)
    setCurrentX(clientX)
  }

  const handleMove = (clientX: number) => {
    if (!isDragging) return
    
    const deltaX = clientX - startX
    const newTranslateX = Math.max(-120, Math.min(120, deltaX))
    setTranslateX(newTranslateX)
    setCurrentX(clientX)
  }

  const handleEnd = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    const deltaX = currentX - startX
    const threshold = 60 // 50% of 120px max swipe
    
    if (Math.abs(deltaX) >= threshold) {
      if (deltaX > 0) {
        // Swipe right - mark as read
        if (!notification.is_read) {
          onMarkAsRead(notification.id)
        }
      } else {
        // Swipe left - clear notification
        onClear(notification.id)
      }
    }
    
    setTranslateX(0)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX)
  }

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, currentX, startX])



  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Background Actions */}
      <div className="absolute inset-0 flex">
        {/* Right side - Mark as Read */}
        <div className={`flex-1 flex items-center justify-end pr-4 transition-all duration-200 ${
          translateX > 30 && !notification.is_read 
            ? 'bg-green-500 shadow-lg' 
            : 'bg-green-500/20'
        }`}>
          {translateX > 30 && !notification.is_read && (
            <div className="flex items-center space-x-2 text-white animate-in slide-in-from-right-2">
              <Check className="h-5 w-5" />
              <span className="font-medium text-sm">Mark as Read</span>
            </div>
          )}
        </div>
        
        {/* Left side - Clear */}
        <div className={`flex-1 flex items-center justify-start pl-4 transition-all duration-200 ${
          translateX < -30 
            ? 'bg-red-500 shadow-lg' 
            : 'bg-red-500/20'
        }`}>
          {translateX < -30 && (
            <div className="flex items-center space-x-2 text-white animate-in slide-in-from-left-2">
              <Trash2 className="h-5 w-5" />
              <span className="font-medium text-sm">Clear</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Card */}
      <Card 
        ref={cardRef}
        className={`transition-all duration-200 ease-out cursor-grab active:cursor-grabbing hover:shadow-md ${
          !notification.is_read ? 'border-l-4 border-l-primary bg-primary/5' : 'hover:bg-muted/50'
        }`}
        style={{ 
          transform: `translateX(${translateX}px)`,
          touchAction: 'pan-y'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleMouseDown}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-full flex items-center justify-center">
                {getTypeIcon(notification.notification_type)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Badge className={`text-xs px-2 py-0.5 ${getTypeColor(notification.notification_type)}`}>
                  {notification.notification_type}
                </Badge>
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                )}
              </div>
              
              <p className="text-sm text-foreground line-clamp-2 mb-1 leading-relaxed">
                {notification.content}
              </p>
              
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{notification.timestamp}</span>
                {notification.from_user && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline truncate">from @{notification.from_user}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0 flex items-center space-x-1">
              {!notification.is_read && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs hidden sm:flex"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkAsRead(notification.id)
                  }}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Read
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onClear(notification.id)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

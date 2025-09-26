import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchNotifications, markNotificationAsRead } from '@/store/slices/socialSlice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Heart,
  Share2,
  UserPlus,
  MessageCircle,
  Sparkles,
  Check,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export function NotificationDropdown() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { notifications, notificationsUnreadCount } = useAppSelector(state => state.social)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Fetch notifications immediately on component mount
    dispatch(fetchNotifications())
  }, [dispatch])

  useEffect(() => {
    // Fetch notifications when dropdown opens
    if (isOpen) {
      dispatch(fetchNotifications())
    }
  }, [dispatch, isOpen])

  useEffect(() => {
    // Set up real-time updates every 10 seconds (more frequent for better UX)
    const interval = setInterval(() => {
      dispatch(fetchNotifications())
    }, 10000)
    
    return () => {
      clearInterval(interval)
    }
  }, [dispatch])

  const handleMarkAsRead = (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(markNotificationAsRead(notificationId))
  }

  const handleNotificationClick = (notification: any) => {
    // Mark as read when clicked
    if (!notification.is_read) {
      dispatch(markNotificationAsRead(notification.id))
    }
    
    // Navigate based on notification type
    switch (notification.notification_type) {
      case 'follow':
        // Navigate to the user's profile if we have the user info
        if (notification.from_user) {
          // You might need to get the user ID from the notification
          // For now, just go to notifications page
          navigate('/notifications')
        }
        break
      case 'message':
        navigate('/chat')
        break
      case 'like':
      case 'share':
        navigate('/profile')
        break
      default:
        navigate('/notifications')
    }
    
    setIsOpen(false)
  }

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

  // Get the last 3 notifications
  const recentNotifications = notifications.slice(0, 3)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={`h-5 w-5 transition-all duration-200 ${
            notificationsUnreadCount && notificationsUnreadCount > 0 
              ? 'animate-pulse text-primary' 
              : 'text-muted-foreground'
          }`} />
            {notificationsUnreadCount && notificationsUnreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center animate-bounce">
                {notificationsUnreadCount > 9 ? '9+' : notificationsUnreadCount}
              </Badge>
            )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {notificationsUnreadCount && notificationsUnreadCount > 0 ? (
              <Badge variant="secondary" className="text-xs">
                {notificationsUnreadCount} unread
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                All read
              </Badge>
            )}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {recentNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-foreground mb-1">All caught up!</h4>
              <p className="text-sm text-muted-foreground mb-3">
                You don't have any notifications yet
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigate('/notifications')
                  setIsOpen(false)
                }}
                className="text-xs"
              >
                View all notifications
              </Button>
            </div>
          ) : (
            recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      {getTypeIcon(notification.notification_type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={`text-xs ${getTypeColor(notification.notification_type)}`}>
                        {notification.notification_type}
                      </Badge>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    
                    <p className="text-sm text-foreground line-clamp-2 mb-1">
                      {notification.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {notification.timestamp}
                      </span>
                      {!notification.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        {recentNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => {
                navigate('/notifications')
                setIsOpen(false)
              }}
            >
              <div className="flex items-center space-x-2 w-full">
                <MoreHorizontal className="h-4 w-4" />
                <span>View all notifications</span>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

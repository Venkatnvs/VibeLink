import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, deleteAllNotifications } from '@/store/slices/socialSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  CheckCheck,
  Filter,
  Trash2
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { SwipeableNotificationCard } from '@/components/notifications/swipeable-notification-card'

export function NotificationsPage() {
  const dispatch = useAppDispatch()
  const { notifications, isLoading, notificationsUnreadCount } = useAppSelector(state => state.social)
  
  const [filter, setFilter] = useState<{ type?: string }>({})

  useEffect(() => {
    dispatch(fetchNotifications())
    
    // Set up real-time updates every 15 seconds
    const interval = setInterval(() => {
      dispatch(fetchNotifications())
    }, 15000)
    
    return () => clearInterval(interval)
  }, [dispatch])

  const handleMarkAsRead = (notificationId: number) => {
    dispatch(markNotificationAsRead(notificationId))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead())
  }

  const handleClearNotification = (notificationId: number) => {
    dispatch(deleteNotification(notificationId))
  }

  const handleClearAll = () => {
    dispatch(deleteAllNotifications())
  }


  const filteredNotifications = filter.type 
    ? notifications.filter(n => n.notification_type === filter.type)
    : notifications

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Notifications</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Stay updated with your social activity</p>
            </div>
            {notificationsUnreadCount && notificationsUnreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notificationsUnreadCount} unread
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleClearAll} 
              variant="outline" 
              size="sm" 
              disabled={notifications.length === 0}
              className="text-xs sm:text-sm"
            >
              <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Clear All</span>
              <span className="sm:hidden">Clear</span>
            </Button>
            <Button 
              onClick={handleMarkAllAsRead} 
              variant="outline" 
              size="sm" 
              disabled={notificationsUnreadCount === 0}
              className="text-xs sm:text-sm"
            >
              <CheckCheck className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Mark All Read</span>
              <span className="sm:hidden">Read All</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Filter Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="type-filter" className="text-sm">Type</Label>
                <Select value={filter.type || 'all'} onValueChange={(value) => 
                  setFilter(prev => ({ ...prev, type: value === 'all' ? undefined : value }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="like">Likes</SelectItem>
                    <SelectItem value="share">Shares</SelectItem>
                    <SelectItem value="follow">Follows</SelectItem>
                    <SelectItem value="message">Messages</SelectItem>
                    <SelectItem value="match">Matches</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-2 sm:space-y-3">
          {isLoading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No notifications</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {filter.type ? `No ${filter.type} notifications found.` : "You're all caught up! No new notifications."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <SwipeableNotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onClear={handleClearNotification}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

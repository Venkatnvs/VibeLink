import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { 
  fetchEmailNotifications, 
  markEmailNotificationAsRead, 
  markAllEmailNotificationsAsRead,
  sendTestEmailNotification,
  createEmailNotification
} from '@/store/slices/emailNotificationsSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Bell, 
  Mail, 
  Check, 
  CheckCheck, 
  Send, 
  Plus, 
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

export function EmailNotifications() {
  const dispatch = useAppDispatch()
  const { notifications, isLoading, unreadCount } = useAppSelector(state => state.emailNotifications)
  
  const [filter, setFilter] = useState<{ status?: string; type?: string }>({})
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newNotification, setNewNotification] = useState({
    notification_type: '',
    subject: '',
    message: '',
    related_object_id: '',
    related_object_type: ''
  })

  useEffect(() => {
    dispatch(fetchEmailNotifications(filter))
  }, [dispatch, filter])

  const handleMarkAsRead = (notificationId: number) => {
    dispatch(markEmailNotificationAsRead(notificationId))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllEmailNotificationsAsRead())
  }

  const handleSendTest = () => {
    dispatch(sendTestEmailNotification())
  }

  const handleCreateNotification = () => {
    if (newNotification.notification_type && newNotification.subject && newNotification.message) {
      dispatch(createEmailNotification({
        ...newNotification,
        related_object_id: newNotification.related_object_id ? parseInt(newNotification.related_object_id) : undefined,
        related_object_type: newNotification.related_object_type || undefined
      }))
      setNewNotification({
        notification_type: '',
        subject: '',
        message: '',
        related_object_id: '',
        related_object_type: ''
      })
      setIsCreateDialogOpen(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'bg-red-100 text-red-800'
      case 'share':
        return 'bg-blue-100 text-blue-800'
      case 'follow':
        return 'bg-green-100 text-green-800'
      case 'message':
        return 'bg-purple-100 text-purple-800'
      case 'match':
        return 'bg-pink-100 text-pink-800'
      case 'system':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Email Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleSendTest} variant="outline" size="sm">
            <Send className="h-4 w-4 mr-2" />
            Send Test
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Email Notification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newNotification.notification_type} onValueChange={(value) => 
                    setNewNotification(prev => ({ ...prev, notification_type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="like">Like</SelectItem>
                      <SelectItem value="share">Share</SelectItem>
                      <SelectItem value="follow">Follow</SelectItem>
                      <SelectItem value="message">Message</SelectItem>
                      <SelectItem value="match">Match</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newNotification.subject}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Notification subject"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Notification message"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNotification}>
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filter.status || 'all'} onValueChange={(value) => 
                setFilter(prev => ({ ...prev, status: value === 'all' ? undefined : value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="type-filter">Type</Label>
              <Select value={filter.type || 'all'} onValueChange={(value) => 
                setFilter(prev => ({ ...prev, type: value === 'all' ? undefined : value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="like">Like</SelectItem>
                  <SelectItem value="share">Share</SelectItem>
                  <SelectItem value="follow">Follow</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                  <SelectItem value="match">Match</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
              <p className="text-muted-foreground">You don't have any email notifications yet.</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(notification.status)}
                      <Badge className={getTypeColor(notification.notification_type)}>
                        {notification.notification_type}
                      </Badge>
                      <Badge className={getStatusColor(notification.status)}>
                        {notification.status}
                      </Badge>
                      {notification.from_user_name && (
                        <span className="text-sm text-muted-foreground">
                          from {notification.from_user_name}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{notification.subject}</h3>
                    <p className="text-muted-foreground mb-3">{notification.message}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{notification.timestamp}</span>
                      {notification.sent_at && (
                        <span>Sent: {new Date(notification.sent_at).toLocaleString()}</span>
                      )}
                      {notification.delivered_at && (
                        <span>Delivered: {new Date(notification.delivered_at).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {(notification.status === 'pending' || notification.status === 'sent') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark Read
                      </Button>
                    )}
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

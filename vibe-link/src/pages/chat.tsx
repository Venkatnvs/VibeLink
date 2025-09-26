import { useState, useEffect, useRef } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchConversations, fetchMessages, fetchMoreMessages, sendMessage, startConversation, markMessagesAsRead, addOptimisticMessage } from '@/store/slices/chatSlice'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Send, 
  MessageCircle,
  ArrowLeft,
  Menu
} from 'lucide-react'

export function ChatPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { recipientId } = useParams<{ recipientId?: string }>()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const { conversations, messages, isLoading: conversationsLoading, messagesPagination } = useAppSelector(state => state.chat)
  
  const [selectedChat, setSelectedChat] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageText, setMessageText] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const previousScrollHeightRef = useRef<number | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setShowSidebar(!selectedChat)
      } else {
        setShowSidebar(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [selectedChat])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!isLoadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else if (messagesContainerRef.current && previousScrollHeightRef.current !== null) {
      // Preserve scroll position when older messages are prepended
      const container = messagesContainerRef.current
      const newScrollHeight = container.scrollHeight
      const delta = newScrollHeight - previousScrollHeightRef.current
      container.scrollTop = delta
      previousScrollHeightRef.current = null
      setIsLoadingMore(false)
    }
  }, [messages])
  // Infinite scroll: load older messages when scrolled to top
  const handleMessagesScroll = async () => {
    const container = messagesContainerRef.current
    if (!container || isLoadingMore) return
    if (container.scrollTop <= 0 && messagesPagination?.previous) {
      // Record current scroll height to restore position after prepend
      previousScrollHeightRef.current = container.scrollHeight
      setIsLoadingMore(true)
      try {
        await dispatch(fetchMoreMessages(messagesPagination.previous)).unwrap()
      } catch (e) {
        setIsLoadingMore(false)
        previousScrollHeightRef.current = null
      }
    }
  }


  // Load conversations on mount and periodically
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchConversations())
      
      // Refresh conversations every 30 seconds for real-time updates
      const interval = setInterval(() => {
        dispatch(fetchConversations())
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [dispatch, user?.id])

  // Handle pre-filled message from navigation state
  useEffect(() => {
    const preFilledMessage = location.state?.preFilledMessage
    if (preFilledMessage) {
      setMessageText(preFilledMessage)
    }
  }, [location.state])

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      dispatch(fetchMessages(selectedChat))
      // Mark messages as read when opening a chat
      dispatch(markMessagesAsRead(selectedChat))
      
      // Refresh messages every 30 seconds when in active chat (less frequent to avoid interference)
      const interval = setInterval(() => {
        dispatch(fetchMessages(selectedChat))
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [dispatch, selectedChat])

  // Handle recipient ID from URL
  useEffect(() => {
    if (recipientId && !conversationsLoading) {
      if (conversations.length > 0) {
        // Find conversation with the recipient
        const conversation = conversations.find(chat => 
          chat.other_participant?.id === parseInt(recipientId)
        )
        if (conversation) {
          setSelectedChat(conversation.id)
          if (isMobile) setShowSidebar(false)
        } else {
          // If no conversation exists, create one
          dispatch(startConversation(parseInt(recipientId)))
            .unwrap()
            .then((newConversation) => {
              setSelectedChat(newConversation.id)
              if (isMobile) setShowSidebar(false)
            })
            .catch((error) => {
              console.error('Failed to create conversation:', error)
              // If user doesn't exist, redirect to chat list
              navigate('/chat')
            })
        }
      } else {
        // No conversations exist, create one with the recipient
        dispatch(startConversation(parseInt(recipientId)))
          .unwrap()
          .then((newConversation) => {
            setSelectedChat(newConversation.id)
            if (isMobile) setShowSidebar(false)
          })
          .catch((error) => {
            console.error('Failed to create conversation:', error)
            // If user doesn't exist, redirect to chat list
            navigate('/chat')
          })
      }
    }
  }, [recipientId, conversations, conversationsLoading, dispatch, isMobile, navigate])

  const filteredChats = (conversations || []).filter(chat =>
    chat?.other_participant?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat?.other_participant?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat?.last_message?.content?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedChatData = selectedChat ? (conversations || []).find(chat => chat?.id === selectedChat) : null

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedChat) {
      const content = messageText.trim()
      setMessageText('')
      
      // Add optimistic message immediately
      dispatch(addOptimisticMessage({ content, conversationId: selectedChat }))
      
      try {
        await dispatch(sendMessage({ conversationId: selectedChat, content })).unwrap()
        // Don't refresh conversations here - the sendMessage.fulfilled will handle it
      } catch (error) {
        console.error('Failed to send message:', error)
        // Remove optimistic message on error
        // The message will be removed when the real message fails
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleChatSelect = (chatId: number) => {
    setSelectedChat(chatId)
    if (isMobile) {
      setShowSidebar(false)
    }
  }

  const handleBackToChats = () => {
    setSelectedChat(null)
    if (isMobile) {
      setShowSidebar(true)
    }
  }

  // Format conversation list timestamp into a short, compact string
  const formatConvTime = (input?: string) => {
    if (!input) return ''
    const date = new Date(input)
    if (Number.isNaN(date.getTime())) return ''
    const now = new Date()
    const isSameDay =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    if (isSameDay) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] relative">
      {/* Mobile Overlay */}
      {isMobile && showSidebar && selectedChat && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Chat List Sidebar */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300' : 'w-80'}
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        border-r bg-card flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Messages</h2>
            {isMobile && selectedChat && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto conversation-scroll">
          {conversationsLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2 text-sm">Loading conversations...</p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-4 text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No conversations found</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`p-4 border-b transition-colors hover:bg-muted/50 ${
                  selectedChat === chat.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Profile Picture - Clickable */}
                  <Avatar 
                    className="w-12 h-12 flex-shrink-0 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (chat.other_participant?.id) {
                        navigate(`/user/${chat.other_participant.id}`)
                      }
                    }}
                  >
                    <AvatarImage src={chat.other_participant?.profile_photo} />
                    <AvatarFallback className="text-sm">
                      {chat.other_participant?.full_name?.[0] || chat.other_participant?.username?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Chat Info - Clickable for conversation */}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleChatSelect(chat.id)}
                  >
                    <h3 className="font-semibold text-foreground truncate">
                      {chat.other_participant?.full_name || chat.other_participant?.username}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.last_message?.content || 'No messages yet'}
                    </p>
                  </div>
                  
                  {/* Timestamp and Unread Count */}
                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[72px] text-right">
                      {formatConvTime(chat.last_message?.timestamp)}
                    </span>
                    {chat.unread_count > 0 && (
                      <Badge className="text-xs" variant="destructive">
                        {chat.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Conversation */}
      <div className="flex-1 flex flex-col">
        {selectedChatData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToChats}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div 
                  className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                  onClick={() => {
                    if (selectedChatData.other_participant?.id) {
                      navigate(`/user/${selectedChatData.other_participant.id}`)
                    }
                  }}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedChatData.other_participant?.profile_photo} />
                    <AvatarFallback className="text-sm">
                      {selectedChatData.other_participant?.full_name?.[0] || selectedChatData.other_participant?.username?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {selectedChatData.other_participant?.full_name || selectedChatData.other_participant?.username}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      @{selectedChatData.other_participant?.username}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={messagesContainerRef} onScroll={handleMessagesScroll} className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll">
              {!messages || messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No messages yet</p>
                  <p className="text-muted-foreground text-xs">Start the conversation!</p>
                </div>
              ) : (
                (messages || []).map((message) => {
                  if (!message || !message.sender) return null
                  
                  const isOptimistic = message.id < 0 && message.sender.username === 'You'
                  const isCurrentUser = message.sender.id === parseInt(user?.id || '0') || isOptimistic
                  
                  return (
                    <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-lg px-4 py-2 max-w-xs sm:max-w-sm md:max-w-md transition-all duration-200 ${
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      } ${isOptimistic ? 'opacity-70 animate-pulse' : ''}`}>
                        <p className="text-sm break-words">{message.content}</p>
                        <span className={`text-xs flex items-center space-x-1 mt-1 ${
                          isCurrentUser ? 'opacity-70' : 'text-muted-foreground'
                        }`}>
                          <span>{message.timestamp}</span>
                          {isOptimistic && (
                            <span className="text-xs opacity-50">• Sending</span>
                          )}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-card">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-20"
                  />
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!messageText.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a chat from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

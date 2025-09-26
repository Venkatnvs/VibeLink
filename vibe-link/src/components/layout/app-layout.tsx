import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useMobile } from '../../hooks/use-mobile'
import { NAV_ITEMS } from '../../lib/constants'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import { 
  Home, 
  Compass, 
  MessageSquare, 
  MessageCircle, 
  User, 
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Sparkles
} from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { BackToTop } from '../ui/back-to-top'
import { SearchDropdown } from '../search/search-dropdown'
import { NotificationDropdown } from '../notifications/notification-dropdown'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

interface AppLayoutProps {
  children: ReactNode
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Home': return Home
    case 'Compass': return Compass
    case 'Sparkles': return Sparkles
    case 'MessageSquare': return MessageSquare
    case 'MessageCircle': return MessageCircle
    case 'Bell': return Bell
    case 'User': return User
    case 'Settings': return Settings
    default: return Home
  }
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useMobile()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`
    }
    if (user?.username) {
      return user.username[0].toUpperCase()
    }
    return 'U'
  }

  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    if (user?.username) {
      return user.username
    }
    return 'User'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-xl text-foreground">VibeLink</span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          {!isMobile && <SearchDropdown />}

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationDropdown />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profile_photo} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">
                    {getUserDisplayName()}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{getUserDisplayName()}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4.1rem)]">
        {/* Sidebar - Hidden on mobile */}
        {!isMobile && (
          <aside className="w-64 border-r bg-card h-full overflow-y-auto p-4">
            <nav className="space-y-2">
              {NAV_ITEMS.map((item) => {
                const Icon = getIcon(item.icon)
                const isActive = location.pathname === item.href
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>
        )}

        {/* Main content area */}
        <main className={`flex-1 h-full overflow-y-auto ${isMobile ? 'pb-20' : ''}`}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="mobile-bottom-nav">
          <div className="flex items-center justify-around py-0 bg-card">
            {NAV_ITEMS.slice(0, 5).map((item) => {
              const Icon = getIcon(item.icon)
              const isActive = location.pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                  <span className="text-xs">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  )
}

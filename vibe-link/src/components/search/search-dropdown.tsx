import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setQuery, setOpen, clearResults } from '@/store/slices/searchSlice'
import { searchContent } from '@/store/slices/searchSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  X, 
  User, 
  MessageSquare, 
  Hash,
  Loader2
} from 'lucide-react'

export function SearchDropdown() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { query, results, isLoading, isOpen } = useAppSelector(state => state.search)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue.trim()) {
        console.log('Searching for:', inputValue)
        dispatch(setQuery(inputValue))
        dispatch(searchContent(inputValue))
      } else {
        dispatch(clearResults())
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [inputValue, dispatch])

  // Debug logging
  useEffect(() => {
    console.log('Search state:', { query, results, isLoading, isOpen, inputValue })
    if (results && results.length > 0) {
      console.log('Search results:', results)
    }
  }, [query, results, isLoading, isOpen, inputValue])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        dispatch(setOpen(false))
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dispatch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (!isOpen) {
      dispatch(setOpen(true))
    }
  }

  const handleInputFocus = () => {
    if (query) {
      dispatch(setOpen(true))
    }
  }

  const handleResultClick = (result: any) => {
    console.log('Search result clicked:', result)
    dispatch(setOpen(false))
    setInputValue('')
    dispatch(clearResults())

    switch (result.type) {
      case 'user':
        console.log('Navigating to user profile:', result.data.id)
        navigate(`/user/${result.data.id}`)
        break
      case 'post':
        // Navigate to the user's profile who made the post with post highlight
        if (result.data.user?.id) {
          console.log('Navigating to post author profile with post highlight:', result.data.user.id, result.data.id)
          navigate(`/user/${result.data.user.id}?highlight=post&postId=${result.data.id}`)
        }
        break
      case 'hashtag':
        // Navigate to discover page with hashtag filter
        console.log('Navigating to discover with hashtag filter:', result.data.name)
        navigate(`/discover?hashtag=${encodeURIComponent(result.data.name)}`)
        break
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />
      case 'post':
        return <MessageSquare className="h-4 w-4" />
      case 'hashtag':
        return <Hash className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getResultImage = (result: any) => {
    if (result.type === 'user') {
      return result.data.profile_photo
    }
    return null
  }

  const getResultTitle = (result: any) => {
    if (result.type === 'user') {
      return result.data.full_name || result.data.username
    }
    if (result.type === 'post') {
      return result.data.content?.substring(0, 50) + (result.data.content?.length > 50 ? '...' : '')
    }
    if (result.type === 'hashtag') {
      return `#${result.data.name}`
    }
    return result.title
  }

  const getResultSubtitle = (result: any) => {
    if (result.type === 'user') {
      return `@${result.data.username}`
    }
    if (result.type === 'post') {
      return `by ${result.data.user?.full_name || result.data.user?.username}`
    }
    if (result.type === 'hashtag') {
      return `${result.data.post_count || 0} posts`
    }
    return result.subtitle
  }

  return (
    <div className="relative flex-1 max-w-md mx-8" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          placeholder="Search people, posts, hashtags..."
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="pl-10 bg-muted/50 border-0 focus:bg-background"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {inputValue && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setInputValue('')
              dispatch(clearResults())
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {(() => {
        const shouldShow = isOpen && (query || (results && results.length > 0))
        console.log('Dropdown visibility check:', { isOpen, query, resultsLength: results?.length, shouldShow })
        return shouldShow
      })() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : (results && results.length > 0) ? (
            <div className="py-2">
              {(results || []).map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  {result.type === 'user' ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getResultImage(result)} />
                      <AvatarFallback>
                        {result.data.full_name?.[0] || result.data.username?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {getResultIcon(result.type)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium truncate">
                        {getResultTitle(result)}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {result.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {getResultSubtitle(result)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center">
              <Search className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No results found</p>
              <p className="text-xs text-muted-foreground">Try a different search term</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

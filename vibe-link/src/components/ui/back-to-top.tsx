import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from './button'
import { ChevronUp } from 'lucide-react'

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const location = useLocation()

  // Show button when page is scrolled down
  useEffect(() => {
    const getScrollContainers = () => {
      const containers: (Element | Window)[] = []
      const mainContent = document.querySelector('main')
      if (mainContent) containers.push(mainContent)
      // Chat specific scroll areas
      document.querySelectorAll('.chat-scroll, .conversation-scroll').forEach(el => containers.push(el))
      // Fallback to window
      containers.push(window)
      return containers
    }

    const toggleVisibility = () => {
      const mainContent = document.querySelector('main') as HTMLElement | null
      const chatScroll = document.querySelector('.chat-scroll') as HTMLElement | null
      const convoScroll = document.querySelector('.conversation-scroll') as HTMLElement | null

      const candidates: (HTMLElement | Window | null)[] = [chatScroll, convoScroll, mainContent, window]
      let visible = false
      for (const c of candidates) {
        if (!c) continue
        const top = c === window ? window.pageYOffset : (c as HTMLElement).scrollTop
        if (top > 300) {
          visible = true
          break
        }
      }
      setIsVisible(visible)
    }

    const containers = getScrollContainers()
    containers.forEach(c => c.addEventListener('scroll', toggleVisibility as any))
    // Initial compute
    toggleVisibility()

    return () => {
      containers.forEach(c => c.removeEventListener('scroll', toggleVisibility as any))
    }
  }, [])

  // Scroll to top smoothly
  const scrollToTop = () => {
    const chatScroll = document.querySelector('.chat-scroll') as HTMLElement | null
    const convoScroll = document.querySelector('.conversation-scroll') as HTMLElement | null
    const mainContent = document.querySelector('main') as HTMLElement | null

    const target = chatScroll || convoScroll || mainContent
    if (target) {
      target.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Hide on chat page
  if (location.pathname.startsWith('/chat')) {
    return null
  }

  // For debugging - always show the button
  // if (!isVisible) {
  //   return null
  // }

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className="fixed bottom-6 right-6 z-[9999] h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
      aria-label="Back to top"
      style={{ 
        opacity: isVisible ? 1 : 0.3,
        transform: isVisible ? 'scale(1)' : 'scale(0.8)',
        transition: 'all 0.3s ease'
      }}
    >
      <ChevronUp className="h-6 w-6" />
    </Button>
  )
}

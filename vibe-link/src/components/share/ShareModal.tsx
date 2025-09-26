import { useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Copy, Mail, Share2, Twitter, Facebook, Send, MessageCircle } from 'lucide-react'

type ShareModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  shareUrl: string
  shareText?: string
  onShared?: () => void
}

export function ShareModal(props: ShareModalProps) {
  const { open, onOpenChange, shareUrl, shareText = 'Check this out on VibeLink', onShared } = props

  const encodedUrl = useMemo(() => encodeURIComponent(shareUrl), [shareUrl])
  const encodedText = useMemo(() => encodeURIComponent(shareText), [shareText])

  const actions = useMemo(
    () => [
      {
        key: 'whatsapp',
        label: 'WhatsApp',
        Icon: MessageCircle,
        href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      },
      {
        key: 'telegram',
        label: 'Telegram',
        Icon: Send,
        href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      },
      {
        key: 'email',
        label: 'Email',
        Icon: Mail,
        href: `mailto:?subject=${encodedText}&body=${encodedUrl}`,
      },
      {
        key: 'x',
        label: 'X (Twitter)',
        Icon: Twitter,
        href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      },
      {
        key: 'facebook',
        label: 'Facebook',
        Icon: Facebook,
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      },
    ],
    [encodedUrl, encodedText]
  )

  const handleClick = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer')
    onShared?.()
    onOpenChange(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      onShared?.()
      onOpenChange(false)
    } catch (e) {
      // fallback
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-3 text-sm text-muted-foreground break-all">
            {shareUrl}
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {actions.map(({ key, label, Icon, href }) => (
              <Button
                key={key}
                variant="outline"
                className="justify-start gap-2"
                onClick={() => handleClick(href)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}

            <Button variant="default" className="justify-start gap-2" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
              Copy link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShareModal



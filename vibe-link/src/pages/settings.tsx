import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  saveSettings,
  updateNotificationSetting,
  updatePrivacySetting,
  updateMatchmakingSetting,
  updateAppearanceSetting,
  applyTheme,
  applyFontSize,
  clearError
} from '@/store/slices/settingsSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Bell, 
  Shield, 
  Palette, 
  Monitor,
  Type,
  Save,
  AlertCircle
} from 'lucide-react'

export function SettingsPage() {
  const dispatch = useAppDispatch()
  const { isLoading, error, ...settings } = useAppSelector(state => state.settings)

  // Settings are loaded globally in App.tsx

  // Remove auto-save to prevent infinite loops - only save on explicit user action

  const handleNotificationChange = (key: string, value: boolean) => {
    dispatch(updateNotificationSetting({ key, value }))
  }

  const handlePrivacyChange = (key: string, value: string | boolean) => {
    dispatch(updatePrivacySetting({ key, value }))
  }

  const handleMatchmakingChange = (key: string, value: number | boolean | { min: number; max: number }) => {
    dispatch(updateMatchmakingSetting({ key, value }))
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    dispatch(updateAppearanceSetting({ key: 'theme', value: newTheme }))
    dispatch(applyTheme(newTheme))
  }

  const handleFontSizeChange = (newSize: 'small' | 'medium' | 'large') => {
    dispatch(updateAppearanceSetting({ key: 'fontSize', value: newSize }))
    dispatch(applyFontSize(newSize))
  }

  const handleSaveAll = () => {
    const settingsToSave = {
      notifications: settings.notifications,
      privacy: settings.privacy,
      matchmaking: settings.matchmaking,
      appearance: settings.appearance,
      isLoading: false,
      error: null
    }
    dispatch(saveSettings(settingsToSave))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and privacy</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-destructive">{error}</span>
          <Button variant="ghost" size="sm" onClick={() => dispatch(clearError())}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notification Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="likes">Likes</Label>
                <p className="text-sm text-muted-foreground">Get notified when someone likes your posts</p>
              </div>
              <Switch
                id="likes"
                checked={settings.notifications.likes}
                onCheckedChange={(checked) => handleNotificationChange('likes', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="shares">Shares</Label>
                <p className="text-sm text-muted-foreground">Get notified when someone shares your posts</p>
              </div>
              <Switch
                id="shares"
                checked={settings.notifications.shares}
                onCheckedChange={(checked) => handleNotificationChange('shares', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="messages">Messages</Label>
                <p className="text-sm text-muted-foreground">Get notified about new messages</p>
              </div>
              <Switch
                id="messages"
                checked={settings.notifications.messages}
                onCheckedChange={(checked) => handleNotificationChange('messages', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Privacy Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileVisibility">Profile Visibility</Label>
              <Select
                value={settings.privacy.profileVisibility}
                onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showLocation">Show Location</Label>
                <p className="text-sm text-muted-foreground">Allow others to see your location</p>
              </div>
              <Switch
                id="showLocation"
                checked={settings.privacy.showLocation}
                onCheckedChange={(checked) => handlePrivacyChange('showLocation', checked)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="allowMessages">Allow Messages From</Label>
              <Select
                value={settings.privacy.allowMessages}
                onValueChange={(value) => handlePrivacyChange('allowMessages', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="none">No One</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Matchmaking Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="h-5 w-5" />
              <span>Matchmaking Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="locationRadius">Location Radius (km)</Label>
              <Input
                id="locationRadius"
                type="number"
                min="1"
                max="500"
                value={settings.matchmaking.locationRadius}
                onChange={(e) => handleMatchmakingChange('locationRadius', parseInt(e.target.value))}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="ageRange">Age Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min="18"
                  max="100"
                  placeholder="Min age"
                  value={settings.matchmaking.ageRange.min}
                  onChange={(e) => {
                    handleMatchmakingChange('ageRange', { 
                      ...settings.matchmaking.ageRange, 
                      min: parseInt(e.target.value) 
                    })
                  }}
                />
                <Input
                  type="number"
                  min="18"
                  max="100"
                  placeholder="Max age"
                  value={settings.matchmaking.ageRange.max}
                  onChange={(e) => {
                    handleMatchmakingChange('ageRange', { 
                      ...settings.matchmaking.ageRange, 
                      max: parseInt(e.target.value) 
                    })
                  }}
                />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showDistance">Show Distance</Label>
                <p className="text-sm text-muted-foreground">Display distance in match results</p>
              </div>
              <Switch
                id="showDistance"
                checked={settings.matchmaking.showDistance}
                onCheckedChange={(checked) => handleMatchmakingChange('showDistance', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={settings.appearance.theme} onValueChange={handleThemeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-4 h-4" />
                      <span>System</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Select value={settings.appearance.fontSize} onValueChange={handleFontSizeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">
                    <div className="flex items-center space-x-2">
                      <Type className="w-4 h-4" />
                      <span>Small</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center space-x-2">
                      <Type className="w-4 h-4" />
                      <span>Medium</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="large">
                    <div className="flex items-center space-x-2">
                      <Type className="w-4 h-4" />
                      <span>Large</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveAll} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Save All Settings</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
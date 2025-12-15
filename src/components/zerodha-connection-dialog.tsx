'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { Settings, Key, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react'

export function ZerodhaConnectionDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [redirectUri, setRedirectUri] = useState('http://localhost:3000/api/zerodha/callback')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { zerodhaProfile, connectZerodha, disconnectZerodha } = useAppStore()

  const handleConnect = async () => {
    if (!apiKey || !apiSecret) {
      setError('API Key and API Secret are required')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      await connectZerodha(apiKey, apiSecret)
      setIsOpen(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect to Zerodha')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setIsLoading(true)
    try {
      await disconnectZerodha()
      setIsOpen(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to disconnect from Zerodha')
    } finally {
      setIsLoading(false)
    }
  }

  const isConnected = zerodhaProfile?.isConnected || false

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Zerodha API Configuration
          </DialogTitle>
          <DialogDescription>
            Connect your Zerodha account to enable algorithmic trading features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Connection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={isConnected ? 'default' : 'destructive'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                  {isConnected && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                  {!isConnected && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                {isConnected && (
                  <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={isLoading}>
                    Disconnect
                  </Button>
                )}
              </div>
              
              {isConnected && zerodhaProfile && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID:</span>
                    <span className="font-medium">{zerodhaProfile.zerodhaUserId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User Name:</span>
                    <span className="font-medium">{zerodhaProfile.userName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Broker:</span>
                    <span className="font-medium">{zerodhaProfile.broker || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Connected:</span>
                    <span className="font-medium">
                      {zerodhaProfile.lastConnected 
                        ? new Date(zerodhaProfile.lastConnected).toLocaleString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {!isConnected && (
            <>
              <Separator />

              {/* API Configuration */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="text"
                    placeholder="Enter your Zerodha API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-secret">API Secret</Label>
                  <Textarea
                    id="api-secret"
                    placeholder="Enter your Zerodha API Secret"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redirect-uri">Redirect URI</Label>
                  <Input
                    id="redirect-uri"
                    type="url"
                    placeholder="Callback URL after authorization"
                    value={redirectUri}
                    onChange={(e) => setRedirectUri(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    This URL must be whitelisted in your Zerodha developer console
                  </p>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How to get API credentials</CardTitle>
                  <CardDescription>
                    Follow these steps to get your Zerodha API credentials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Visit Kite Connect</p>
                      <p className="text-sm text-muted-foreground">
                        Go to{' '}
                        <a 
                          href="https://kite.trade/connect/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 inline"
                        >
                          kite.trade/connect
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Create an app</p>
                      <p className="text-sm text-muted-foreground">
                        Register a new app in the Kite Connect dashboard
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Get credentials</p>
                      <p className="text-sm text-muted-foreground">
                        Copy the API Key and API Secret from your app settings
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Set redirect URI</p>
                      <p className="text-sm text-muted-foreground">
                        Add <code className="bg-muted px-1 py-0.5 rounded text-xs">{redirectUri}</code> to your app's redirect URIs
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConnect} disabled={isLoading}>
                  {isLoading ? 'Connecting...' : 'Connect to Zerodha'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
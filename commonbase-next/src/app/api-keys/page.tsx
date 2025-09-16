'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Copy, Plus, Key, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ApiKey {
  id: string
  name: string
  created: string
  lastUsed?: string
}

export default function ApiKeysPage() {
  const { data: session, status } = useSession()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if auth is enabled
  const isAuthEnabled = typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true'

  useEffect(() => {
    if (!isAuthEnabled) return
    if (status === 'loading') return

    if (session) {
      fetchApiKeys()
    } else {
      setLoading(false)
    }
  }, [session, status, isAuthEnabled])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/user/api-keys')
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || [])
      } else {
        setError('Failed to fetch API keys')
      }
    } catch (err) {
      setError('Error fetching API keys')
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) return

    setCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedKey(data.key)
        setNewKeyName('')
        await fetchApiKeys()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create API key')
      }
    } catch (err) {
      setError('Error creating API key')
    } finally {
      setCreating(false)
    }
  }

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/user/api-keys/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setApiKeys(apiKeys.filter(key => key.id !== id))
      } else {
        setError('Failed to delete API key')
      }
    } catch (err) {
      setError('Error deleting API key')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // If auth is not enabled, show message
  if (!isAuthEnabled) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  API key management is only available in production deployments with authentication enabled.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading || status === 'loading') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Please sign in to manage your API keys.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Key className="w-8 h-8" />
            API Keys
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal API keys for programmatic access to your Commonbase instance.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {generatedKey && (
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Your new API key has been generated!</strong></p>
                <p className="text-sm">Save this key securely - it will not be shown again.</p>
                <div className="flex items-center gap-2 mt-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono flex-1">
                    {generatedKey}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedKey)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGeneratedKey(null)}
                  className="mt-2"
                >
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="API key name (e.g., 'My App', 'Production Bot')"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createApiKey()}
                disabled={creating}
              />
              <Button
                onClick={createApiKey}
                disabled={!newKeyName.trim() || creating}
              >
                <Plus className="w-4 h-4 mr-2" />
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your API Keys ({apiKeys.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No API keys yet. Create one above to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{key.name}</h3>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>Created: {formatDate(key.created)}</span>
                        {key.lastUsed && (
                          <span>Last used: {formatDate(key.lastUsed)}</span>
                        )}
                        {!key.lastUsed && (
                          <Badge variant="outline">Never used</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteApiKey(key.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>Use your API key by including it in the <code>x-api-key</code> header:</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`curl -X POST https://your-deployment.vercel.app/api/add \\
  -H "x-api-key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"data": "Your entry content"}'`}
              </pre>
              <p className="text-muted-foreground">
                All entries created with your API key will be tagged with your username and user ID.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
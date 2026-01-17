import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, AlertCircle, Eye, EyeOff } from 'lucide-react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import JsonViewer from './JsonViewer'

interface ResponseViewerProps {
  status?: number
  statusText?: string
  headers?: Record<string, string>
  body?: string
  error?: string
  isLoading?: boolean
}

export function ResponseViewer({
  status,
  statusText,
  headers,
  body,
  error,
  isLoading = false,
}: ResponseViewerProps) {
  const [useJsonViewer, setUseJsonViewer] = useState(false)
  const isSuccess = status && status >= 200 && status < 300

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (isLoading) {
    return (
      <Card className="flex justify-center items-center bg-card p-6 border-border min-h-96">
        <div className="text-center">
          <div className="mx-auto mb-3 border border-primary rounded-full w-8 h-8 animate-spin" />
          <p className="text-muted-foreground">Sending request...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card p-6 border-destructive">
        <div className="flex gap-3">
          <AlertCircle className="mt-1 text-destructive shrink-0" />
          <div>
            <h3 className="mb-1 font-semibold text-destructive">Error</h3>
            <p className="text-foreground text-sm">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  if (!status) {
    return (
      <Card className="flex justify-center items-center bg-card p-6 border-border min-h-96">
        <p className="text-muted-foreground">
          Send a request to see the response here
        </p>
      </Card>
    )
  }

  const parsedBody = body ? (() => {
    try {
      return JSON.parse(body)
    } catch {
      return null
    }
  })() : null

  return (
    <Card className="flex flex-col bg-card border-border overflow-hidden">
      {/* Status Bar */}
      <div className="flex justify-between items-center bg-secondary/50 p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Badge
            variant={isSuccess ? 'default' : 'destructive'}
            className="px-3 py-1 text-base"
          >
            {status} {statusText}
          </Badge>
          <p className="text-muted-foreground text-sm">Response</p>
        </div>

        {/* Toggle Button */}
        {parsedBody && (
          <Button
            onClick={() => setUseJsonViewer(!useJsonViewer)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {useJsonViewer ? (
              <>
                <Eye size={14} className="mr-1" />
                Formatted
              </>
            ) : (
              <>
                <EyeOff size={14} className="mr-1" />
                Viewer
              </>
            )}
          </Button>
        )}
      </div>

      {/* Response Tabs */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-96">
          {/* Headers */}
          {headers && Object.keys(headers).length > 0 && (
            <div className="p-4 border-b border-border">
              <h3 className="mb-3 font-semibold text-sm">Response Headers</h3>
              <div className="space-y-2">
                {Object.entries(headers).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 text-xs">
                    <span className="font-mono text-primary">{key}</span>
                    <span className="font-mono text-muted-foreground break-all">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          {body && (
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-sm">Response Body</h3>
                <Button
                  onClick={() => copyToClipboard(body)}
                  variant="ghost"
                  size="sm"
                >
                  <Copy size={14} className="mr-1" /> Copy
                </Button>
              </div>

              {useJsonViewer && parsedBody ? (
                <div className="border border-border rounded-md overflow-hidden">
                  <JsonViewer
                    data={parsedBody}
                    showCopyButton={true}
                    showMinimizeButton={true}
                  />
                </div>
              ) : (
                <div className="border border-border rounded-md overflow-hidden">
                  <SyntaxHighlighter
                    language="json"
                    style={atomOneDark}
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      backgroundColor: 'transparent',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                    showLineNumbers
                  >
                    {body}
                  </SyntaxHighlighter>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </Card>
  )
}
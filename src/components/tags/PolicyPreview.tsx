import type { Tag } from '@/lib/types'
import { Card } from '@/components/ui/card'

interface PolicyPreviewProps {
  tags: Tag[]
  request: {
    url: string
    headers: Record<string, string>
    queryParams: Record<string, string>
  }
}

export function PolicyPreview({ tags, request }: PolicyPreviewProps) {
  // Merge tag policies with request values
  // Request values take priority (no override)
  const mergedHeaders = { ...tags.reduce((acc: Record<string, string>, tag) => {
    return { ...acc, ...tag.headers }
  }, {} as Record<string, string>), ...request.headers }

  const mergedParams = { ...tags.reduce((acc: Record<string, string>, tag) => {
    return { ...acc, ...tag.queryParams }
  }, {} as Record<string, string>), ...request.queryParams }

  // Build resolved URL with query params
  const urlObj = new URL(request.url)
  Object.entries(mergedParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value)
  })
  const resolvedUrl = urlObj.toString()

  return (
    <Card className="space-y-3 bg-card p-4 border-border">
      <div>
        <p className="mb-1 text-muted-foreground text-xs">Final URL (after tags):</p>
        <code className="block bg-secondary/50 p-2 rounded font-mono text-foreground text-sm break-all">
          {resolvedUrl}
        </code>
      </div>

      {Object.keys(mergedHeaders).length > 0 && (
        <div>
          <p className="mb-1 text-muted-foreground text-xs">Headers:</p>
          <div className="space-y-1 bg-secondary/50 p-2 rounded">
            {Object.entries(mergedHeaders).map(([key, value]) => (
              <div key={key} className="font-mono text-foreground text-xs">
                <span className="text-primary">{key}:</span> <span className="text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(mergedParams).length > 0 && (
        <div>
          <p className="mb-1 text-muted-foreground text-xs">Query Params:</p>
          <div className="space-y-1 bg-secondary/50 p-2 rounded">
            {Object.entries(mergedParams).map(([key, value]) => (
              <div key={key} className="font-mono text-foreground text-xs">
                <span className="text-primary">{key}:</span> <span className="text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
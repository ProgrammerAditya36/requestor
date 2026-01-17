import { Card } from '@/components/ui/card'

interface EnvironmentPreviewProps {
  variables: Record<string, string>
  request: {
    url: string
    headers: Record<string, string>
    queryParams: Record<string, string>
    body?: string
  }
}

// Helper: Resolve {{VAR}} syntax in strings
function resolveTemplate(
  text: string | undefined,
  variables: Record<string, string>
): string {
  if (!text) return ''

  return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] ?? match // Keep {{VAR}} if not found
  })
}

// Helper: Resolve templates in objects (headers, params)
function resolveTemplateObject(
  obj: Record<string, string> | undefined,
  variables: Record<string, string>
): Record<string, string> {
  if (!obj) return {}

  const resolved: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    resolved[key] = resolveTemplate(value, variables)
  }
  return resolved
}

// Build final URL with query params
function buildFinalUrl(baseUrl: string, params: Record<string, string>): string {
  if (!baseUrl) return baseUrl
  
  try {
    const url = new URL(baseUrl)
    Object.entries(params).forEach(([key, value]) => {
      if (key && value) {
        url.searchParams.set(key, value)
      }
    })
    return url.toString()
  } catch {
    // If URL is invalid, append query params manually
    if (Object.keys(params).length === 0) {
      return baseUrl
    }
    const queryString = Object.entries(params)
      .filter(([key, value]) => key && value)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryString}`
  }
}

export function EnvironmentPreview({ variables, request }: EnvironmentPreviewProps) {
  // Resolve templates in request values
  const resolvedUrl = resolveTemplate(request.url, variables)
  const resolvedHeaders = resolveTemplateObject(request.headers, variables)
  const resolvedParams = resolveTemplateObject(request.queryParams, variables)
  const resolvedBody = resolveTemplate(request.body, variables)

  // Build final URL with query params
  const finalUrl = buildFinalUrl(resolvedUrl, resolvedParams)

  // Check if any variables were actually used
  const hasVariables = Object.keys(variables).length > 0
  const urlHasVariables = request.url && /\{\{\w+\}\}/.test(request.url)
  const headersHaveVariables = Object.values(request.headers || {}).some(
    (v) => typeof v === 'string' && /\{\{\w+\}\}/.test(v)
  )
  const paramsHaveVariables = Object.values(request.queryParams || {}).some(
    (v) => typeof v === 'string' && /\{\{\w+\}\}/.test(v)
  )
  const bodyHasVariables = request.body && /\{\{\w+\}\}/.test(request.body)

  const hasAnyVariables = urlHasVariables || headersHaveVariables || paramsHaveVariables || bodyHasVariables

  if (!hasVariables || !hasAnyVariables) {
    return null
  }

  return (
    <Card className="space-y-3 bg-card p-4 border-border">
      <div>
        <p className="mb-1 text-muted-foreground text-xs">Final URL (after variables):</p>
        <code className="block bg-secondary/50 p-2 rounded font-mono text-foreground text-sm break-all">
          {finalUrl}
        </code>
      </div>

      {Object.keys(resolvedHeaders).length > 0 && (
        <div>
          <p className="mb-1 text-muted-foreground text-xs">Headers:</p>
          <div className="space-y-1 bg-secondary/50 p-2 rounded">
            {Object.entries(resolvedHeaders).map(([key, value]) => (
              <div key={key} className="font-mono text-foreground text-xs">
                <span className="text-primary">{key}:</span>{' '}
                <span className="text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(resolvedParams).length > 0 && (
        <div>
          <p className="mb-1 text-muted-foreground text-xs">Query Params:</p>
          <div className="space-y-1 bg-secondary/50 p-2 rounded">
            {Object.entries(resolvedParams).map(([key, value]) => (
              <div key={key} className="font-mono text-foreground text-xs">
                <span className="text-primary">{key}:</span>{' '}
                <span className="text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolvedBody && (
        <div>
          <p className="mb-1 text-muted-foreground text-xs">Body:</p>
          <code className="block bg-secondary/50 p-2 rounded font-mono text-foreground text-sm break-all whitespace-pre-wrap">
            {resolvedBody}
          </code>
        </div>
      )}
    </Card>
  )
}

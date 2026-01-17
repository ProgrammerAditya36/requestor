// Client-side request execution utilities

// Helper: Resolve {{VAR}} syntax in strings
export function resolveTemplate(
  text: string | undefined,
  variables: Record<string, string>
): string {
  if (!text) return ''

  return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] ?? match // Keep {{VAR}} if not found
  })
}

// Helper: Resolve templates in objects (headers, params)
export function resolveTemplateObject(
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

// Helper: Merge tag policies with request values
export function mergeHeaders(
  tagHeaders: Record<string, string>[],
  requestHeaders: Record<string, string>
): Record<string, string> {
  const merged = {} as Record<string, string>
  tagHeaders.forEach(th => Object.assign(merged, th))
  Object.assign(merged, requestHeaders) // Request values override tags
  return merged
}

export function mergeParams(
  tagParams: Record<string, string>[],
  requestParams: Record<string, string>
): Record<string, string> {
  const merged = {} as Record<string, string>
  tagParams.forEach(tp => Object.assign(merged, tp))
  Object.assign(merged, requestParams) // Request values override tags
  return merged
}

// Build final URL with query params
export function buildFinalUrl(baseUrl: string, params: Record<string, string>): string {
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

export interface ExecuteRequestParams {
  url: string
  method: string
  headers: Record<string, string>
  queryParams: Record<string, string>
  body?: string
  environmentVariables?: Record<string, string>
  tagHeaders?: Record<string, string>[]
  tagParams?: Record<string, string>[]
}

export interface ExecuteRequestResult {
  success: boolean
  status?: number
  statusText?: string
  headers?: Record<string, string>
  body?: string
  error?: string
  duration: number
  resolvedUrl: string
  resolvedHeaders: Record<string, string>
  resolvedQueryParams: Record<string, string>
  resolvedBody?: string
}

export async function executeRequestClient(params: ExecuteRequestParams): Promise<ExecuteRequestResult> {
  const start = Date.now()

  try {
    const envVariables = params.environmentVariables || {}

    // Resolve templates in request values first
    const resolvedRequestUrl = resolveTemplate(params.url, envVariables)
    const resolvedRequestHeaders = resolveTemplateObject(params.headers, envVariables)
    const resolvedRequestParams = resolveTemplateObject(params.queryParams, envVariables)
    const resolvedRequestBody = resolveTemplate(params.body, envVariables)

    // Resolve templates in tag values
    const tagHeadersResolved = (params.tagHeaders || []).map((th) =>
      resolveTemplateObject(th, envVariables)
    )
    const tagParamsResolved = (params.tagParams || []).map((tp) =>
      resolveTemplateObject(tp, envVariables)
    )

    // Merge headers and params (request values override tags)
    const resolvedHeaders = mergeHeaders(
      tagHeadersResolved,
      resolvedRequestHeaders
    )

    const resolvedParams = mergeParams(
      tagParamsResolved,
      resolvedRequestParams
    )

    const resolvedUrl = buildFinalUrl(resolvedRequestUrl, resolvedParams)

    // Methods that can have a body
    const methodsWithBody = ['POST', 'PUT', 'PATCH', 'DELETE']
    const canHaveBody = methodsWithBody.includes(params.method)

    // Make the actual HTTP request from client
    const fetchOptions: RequestInit = {
      method: params.method,
      headers: resolvedHeaders,
    }

    // Only include body for methods that support it
    if (canHaveBody && resolvedRequestBody) {
      fetchOptions.body = resolvedRequestBody
    }

    const response = await fetch(resolvedUrl, fetchOptions)

    const duration = Date.now() - start

    // Parse response
    const contentType = response.headers.get('content-type')
    let responseBody = ''
    if (contentType?.includes('application/json')) {
      try {
        const data = await response.json()
        responseBody = JSON.stringify(data, null, 2)
      } catch {
        responseBody = await response.text()
      }
    } else {
      responseBody = await response.text()
    }

    // Convert response headers to object
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      duration,
      resolvedUrl,
      resolvedHeaders,
      resolvedQueryParams: resolvedParams,
      resolvedBody: resolvedRequestBody,
    }
  } catch (error) {
    const duration = Date.now() - start

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    return {
      success: false,
      error: errorMessage,
      duration,
      resolvedUrl: params.url,
      resolvedHeaders: params.headers,
      resolvedQueryParams: params.queryParams,
      resolvedBody: params.body,
    }
  }
}

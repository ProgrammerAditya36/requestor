import { action, internalMutation, mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { api, internal } from './_generated/api'

// Helper: Merge tag policies with request values
function mergeHeaders(
  tagHeaders: Record<string, string>[],
  requestHeaders: Record<string, string>
): Record<string, string> {
  const merged = {} as Record<string, string>
  tagHeaders.forEach(th => Object.assign(merged, th))
  Object.assign(merged, requestHeaders) // Request values override tags
  return merged
}

function mergeParams(
  tagParams: Record<string, string>[],
  requestParams: Record<string, string>
): Record<string, string> {
  const merged = {} as Record<string, string>
  tagParams.forEach(tp => Object.assign(merged, tp))
  Object.assign(merged, requestParams) // Request values override tags
  return merged
}

// Build final URL with query params
function buildFinalUrl(baseUrl: string, params: Record<string, string>): string {
  const url = new URL(baseUrl)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  return url.toString()
}

// Internal mutation to save history (called from action)
export const saveHistory = internalMutation({
  args: {
    projectId: v.id('projects'),
    requestId: v.id('requests'),
    method: v.string(),
    url: v.string(),
    resolvedUrl: v.string(),
    resolvedHeaders: v.any(),
    resolvedQueryParams: v.any(),
    resolvedBody: v.optional(v.string()),
    status: v.optional(v.number()),
    statusText: v.optional(v.string()),
    responseHeaders: v.optional(v.any()),
    responseBody: v.optional(v.string()),
    error: v.optional(v.string()),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const historyId = await ctx.db.insert('history', {
      projectId: args.projectId,
      requestId: args.requestId,
      method: args.method,
      url: args.url,
      resolvedUrl: args.resolvedUrl,
      resolvedHeaders: args.resolvedHeaders,
      resolvedQueryParams: args.resolvedQueryParams,
      resolvedBody: args.resolvedBody,
      status: args.status,
      statusText: args.statusText,
      responseHeaders: args.responseHeaders,
      responseBody: args.responseBody,
      error: args.error,
      duration: args.duration,
      timestamp: Date.now(),
      createdAt: Date.now(),
    })
    return historyId
  },
})

// Action to execute HTTP request (can use fetch)
export const executeRequest = action({
  args: {
    projectId: v.id('projects'),
    requestId: v.id('requests'),
    method: v.string(),
    url: v.string(),
    headers: v.any(),
    queryParams: v.any(),
    body: v.optional(v.string()),
    tagIds: v.array(v.id('tags')),
  },
  handler: async (ctx, args) => {
    const start = Date.now()

    try {
      // Fetch all tags to get their policies using runQuery
      const tags = await Promise.all(
        args.tagIds.map(async (tagId) => {
          const tag = await ctx.runQuery(api.tags.getTag, { tagId })
          return tag
        })
      )

      const validTags = tags.filter(
        (t): t is NonNullable<typeof t> => t !== null
      )

      // Merge headers and params
      const resolvedHeaders = mergeHeaders(
        validTags.map(t => t.headers),
        args.headers
      )

      const resolvedParams = mergeParams(
        validTags.map(t => t.queryParams),
        args.queryParams
      )

      const resolvedUrl = buildFinalUrl(args.url, resolvedParams)

      // Make the actual HTTP request (this is allowed in actions)
      const response = await fetch(resolvedUrl, {
        method: args.method,
        headers: resolvedHeaders,
        body: args.body,
      })

      const duration = Date.now() - start

      // Parse response
      const contentType = response.headers.get('content-type')
      let responseBody = ''
      if (contentType?.includes('application/json')) {
        const data = await response.json()
        responseBody = JSON.stringify(data, null, 2)
      } else {
        responseBody = await response.text()
      }

      // Convert response headers to object
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      // Store history using runMutation
      const historyId: string = await ctx.runMutation(internal.execution.saveHistory, {
        projectId: args.projectId,
        requestId: args.requestId,
        method: args.method,
        url: args.url,
        resolvedUrl,
        resolvedHeaders,
        resolvedQueryParams: resolvedParams,
        resolvedBody: args.body,
        status: response.status,
        statusText: response.statusText,
        responseHeaders,
        responseBody,
        duration,
      })

      return {
        success: true,
        historyId,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
        duration,
        resolvedUrl,
        resolvedHeaders,
      }
    } catch (error) {
      const duration = Date.now() - start

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'

      // Store error in history using runMutation
      const historyId: string = await ctx.runMutation(internal.execution.saveHistory, {
        projectId: args.projectId,
        requestId: args.requestId,
        method: args.method,
        url: args.url,
        resolvedUrl: args.url,
        resolvedHeaders: args.headers,
        resolvedQueryParams: args.queryParams,
        resolvedBody: args.body,
        error: errorMessage,
        duration,
      })

      return {
        success: false,
        historyId,
        error: errorMessage,
        duration,
      }
    }
  },
})

export const listHistory = query({
  args: {
    projectId: v.id('projects'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query('history')
      .withIndex('by_projectId', (q) => q.eq('projectId', args.projectId))
      .order('desc')

    const limit = args.limit || 50
    const history = await query.take(limit)
    return history
  },
})

export const getHistory = query({
  args: { historyId: v.id('history') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.historyId)
  },
})

export const deleteHistory = mutation({
  args: { historyId: v.id('history') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.historyId)
  },
})
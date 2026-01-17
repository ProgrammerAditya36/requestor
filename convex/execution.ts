import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// Mutation to save history (called from client)
export const saveHistory = mutation({
  args: {
    projectId: v.id('projects'),
    requestId: v.id('requests'),
    environmentId: v.optional(v.id('environments')),
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
      environmentId: args.environmentId,
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

// Request execution is now done on the client side
// See src/lib/requestExecution.ts for the client-side implementation

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
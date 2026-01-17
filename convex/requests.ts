import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const createRequest = mutation({
  args: {
    projectId: v.id('projects'),
    name: v.string(),
    method: v.union(
      v.literal('GET'),
      v.literal('POST'),
      v.literal('PUT'),
      v.literal('DELETE'),
      v.literal('PATCH'),
      v.literal('HEAD'),
      v.literal('OPTIONS')
    ),
    url: v.string(),
    headers: v.object({}) as any,
    queryParams: v.object({}) as any,
    body: v.optional(v.string()),
    tagIds: v.array(v.id('tags')),
  },
  handler: async (ctx, args) => {
    const requestId = await ctx.db.insert('requests', {
      projectId: args.projectId,
      name: args.name,
      method: args.method,
      url: args.url,
      headers: args.headers,
      queryParams: args.queryParams,
      body: args.body,
      tagIds: args.tagIds,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return requestId
  },
})

export const updateRequest = mutation({
  args: {
    requestId: v.id('requests'),
    name: v.optional(v.string()),
    method: v.optional(
      v.union(
        v.literal('GET'),
        v.literal('POST'),
        v.literal('PUT'),
        v.literal('DELETE'),
        v.literal('PATCH'),
        v.literal('HEAD'),
        v.literal('OPTIONS')
      )
    ),
    url: v.optional(v.string()),
    headers: v.optional(v.object({}) as any),
    queryParams: v.optional(v.object({}) as any),
    body: v.optional(v.string()),
    tagIds: v.optional(v.array(v.id('tags'))),
  },
  handler: async (ctx, args) => {
    const updateData: any = { updatedAt: Date.now() }
    if (args.name) updateData.name = args.name
    if (args.method) updateData.method = args.method
    if (args.url) updateData.url = args.url
    if (args.headers) updateData.headers = args.headers
    if (args.queryParams) updateData.queryParams = args.queryParams
    if (args.body !== undefined) updateData.body = args.body
    if (args.tagIds) updateData.tagIds = args.tagIds

    await ctx.db.patch(args.requestId, updateData)
    return args.requestId
  },
})

export const deleteRequest = mutation({
  args: { requestId: v.id('requests') },
  handler: async (ctx, args) => {
    // Delete history for this request
    const history = await ctx.db
      .query('history')
      .withIndex('by_requestId', (q) => q.eq('requestId', args.requestId))
      .collect()

    for (const entry of history) {
      await ctx.db.delete(entry._id)
    }

    await ctx.db.delete(args.requestId)
  },
})

export const listRequests = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query('requests')
      .withIndex('by_projectId', (q) => q.eq('projectId', args.projectId))
      .order('desc')
      .collect()
    return requests
  },
})

export const getRequest = query({
  args: { requestId: v.id('requests') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.requestId)
  },
})
import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const createTag = mutation({
  args: {
    name: v.string(),
    color: v.union(
      v.literal('blue'),
      v.literal('red'),
      v.literal('green'),
      v.literal('purple'),
      v.literal('yellow'),
      v.literal('pink')
    ),
    icon: v.optional(v.string()),
    description: v.optional(v.string()),
    headers: v.object({}) as any,
    queryParams: v.object({}) as any,
  },
  handler: async (ctx, args) => {
    const tagId = await ctx.db.insert('tags', {
      name: args.name,
      color: args.color,
      icon: args.icon,
      description: args.description,
      headers: args.headers,
      queryParams: args.queryParams,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return tagId
  },
})

export const updateTag = mutation({
  args: {
    tagId: v.id('tags'),
    name: v.optional(v.string()),
    color: v.optional(
      v.union(
        v.literal('blue'),
        v.literal('red'),
        v.literal('green'),
        v.literal('purple'),
        v.literal('yellow'),
        v.literal('pink')
      )
    ),
    icon: v.optional(v.string()),
    description: v.optional(v.string()),
    headers: v.optional(v.object({}) as any),
    queryParams: v.optional(v.object({}) as any),
  },
  handler: async (ctx, args) => {
    const updateData: any = { updatedAt: Date.now() }
    if (args.name) updateData.name = args.name
    if (args.color) updateData.color = args.color
    if (args.icon !== undefined) updateData.icon = args.icon
    if (args.description !== undefined) updateData.description = args.description
    if (args.headers) updateData.headers = args.headers
    if (args.queryParams) updateData.queryParams = args.queryParams

    await ctx.db.patch(args.tagId, updateData)
    return args.tagId
  },
})

export const deleteTag = mutation({
  args: { tagId: v.id('tags') },
  handler: async (ctx, args) => {
    // Remove tag from all requests
    const requests = await ctx.db.query('requests').collect()
    for (const request of requests) {
      const newTagIds = request.tagIds.filter(id => id !== args.tagId)
      await ctx.db.patch(request._id, { tagIds: newTagIds })
    }

    await ctx.db.delete(args.tagId)
  },
})

export const listTags = query({
  handler: async (ctx) => {
    const tags = await ctx.db.query('tags').order('desc').collect()
    return tags
  },
})

export const getTag = query({
  args: { tagId: v.id('tags') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tagId)
  },
})
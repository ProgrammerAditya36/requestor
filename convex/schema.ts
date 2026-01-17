import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_createdAt', ['createdAt']),

  requests: defineTable({
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
    headers: v.any(), // Dynamic key-value pairs
    queryParams: v.any(),
    body: v.optional(v.string()),
    tagIds: v.array(v.id('tags')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_projectId', ['projectId'])
    .index('by_createdAt', ['createdAt']),

  tags: defineTable({
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
    headers: v.any(),
    queryParams: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_createdAt', ['createdAt']),

  history: defineTable({
    projectId: v.id('projects'),
    requestId: v.id('requests'),
    method: v.string(),
    url: v.string(),
    // Resolved values after tag merging
    resolvedUrl: v.string(),
    resolvedHeaders: v.any(),
    resolvedQueryParams: v.any(),
    resolvedBody: v.optional(v.string()),
    // Response data
    status: v.optional(v.number()),
    statusText: v.optional(v.string()),
    responseHeaders: v.optional(v.any()),
    responseBody: v.optional(v.string()),
    error: v.optional(v.string()),
    duration: v.number(), // milliseconds
    timestamp: v.number(),
    createdAt: v.number(),
  })
    .index('by_projectId', ['projectId'])
    .index('by_requestId', ['requestId'])
    .index('by_timestamp', ['timestamp']),

  shares: defineTable({
    projectId: v.id('projects'),
    historyId: v.id('history'),
    shareToken: v.string(), // unique token for public access
    isPublic: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_shareToken', ['shareToken']),
})
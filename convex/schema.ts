import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    selectedEnvironmentId: v.optional(v.id('environments')), // Track active env
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_createdAt', ['createdAt']),

  environments: defineTable({
    projectId: v.id('projects'),
    name: v.string(),
    variables: v.any(), // { "API_KEY": "value", "BASE_URL": "value", ... }
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_projectId', ['projectId']),

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
    headers: v.any(), // Can contain {{VAR}} templates
    queryParams: v.any(), // Can contain {{VAR}} templates
    body: v.optional(v.string()), // Can contain {{VAR}} templates
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
    headers: v.any(), // Can contain {{VAR}} templates
    queryParams: v.any(), // Can contain {{VAR}} templates
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_createdAt', ['createdAt']),

  history: defineTable({
    projectId: v.id('projects'),
    requestId: v.id('requests'),
    environmentId: v.optional(v.id('environments')), // Track which env was used
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
    timestamp: v.number(),
    createdAt: v.number(),
  })
    .index('by_projectId', ['projectId'])
    .index('by_requestId', ['requestId'])
    .index('by_timestamp', ['timestamp']),

  shares: defineTable({
    projectId: v.id('projects'),
    historyId: v.id('history'),
    shareToken: v.string(),
    isPublic: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_shareToken', ['shareToken']),
})
import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const createProject = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const projectId = await ctx.db.insert('projects', {
      name: args.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return projectId
  },
})

export const updateProject = mutation({
  args: {
    projectId: v.id('projects'),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      name: args.name,
      updatedAt: Date.now(),
    })
    return args.projectId
  },
})

export const deleteProject = mutation({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    // Delete all requests in this project
    const requests = await ctx.db
      .query('requests')
      .withIndex('by_projectId', (q) => q.eq('projectId', args.projectId))
      .collect()

    for (const request of requests) {
      await ctx.db.delete(request._id)
    }

    // Delete all history for this project
    const history = await ctx.db
      .query('history')
      .withIndex('by_projectId', (q) => q.eq('projectId', args.projectId))
      .collect()

    for (const entry of history) {
      await ctx.db.delete(entry._id)
    }

    // Delete the project
    await ctx.db.delete(args.projectId)
  },
})

export const listProjects = query({
  handler: async (ctx) => {
    const projects = await ctx.db
      .query('projects')
      .order('desc')
      .collect()
    return projects
  },
})

export const getProject = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId)
  },
})
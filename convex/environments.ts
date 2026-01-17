import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const createEnvironment = mutation({
  args: {
    projectId: v.id('projects'),
    name: v.string(),
    variables: v.any(),
  },
  handler: async (ctx, args) => {
    const envId = await ctx.db.insert('environments', {
      projectId: args.projectId,
      name: args.name,
      variables: args.variables,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return envId
  },
})

export const updateEnvironment = mutation({
  args: {
    environmentId: v.id('environments'),
    name: v.optional(v.string()),
    variables: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const updateData: any = { updatedAt: Date.now() }
    if (args.name) updateData.name = args.name
    if (args.variables) updateData.variables = args.variables

    await ctx.db.patch(args.environmentId, updateData)
    return args.environmentId
  },
})

export const deleteEnvironment = mutation({
  args: { environmentId: v.id('environments') },
  handler: async (ctx, args) => {
    // If this env is selected in any project, unset it
    const projects = await ctx.db.query('projects').collect()
    for (const project of projects) {
      if (project.selectedEnvironmentId === args.environmentId) {
        await ctx.db.patch(project._id, { selectedEnvironmentId: undefined })
      }
    }

    await ctx.db.delete(args.environmentId)
  },
})

export const listEnvironments = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const envs = await ctx.db
      .query('environments')
      .withIndex('by_projectId', (q) => q.eq('projectId', args.projectId))
      .order('desc')
      .collect()
    return envs
  },
})

export const getEnvironment = query({
  args: { environmentId: v.id('environments') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.environmentId)
  },
})

export const setActiveEnvironment = mutation({
  args: {
    projectId: v.id('projects'),
    environmentId: v.optional(v.id('environments')),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      selectedEnvironmentId: args.environmentId,
    })
    return args.projectId
  },
})
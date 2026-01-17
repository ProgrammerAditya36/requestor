import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// Generate random token
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
}

export const createShare = mutation({
  args: {
    projectId: v.id('projects'),
    historyId: v.id('history'),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const shareToken = generateToken()
    const shareId = await ctx.db.insert('shares', {
      projectId: args.projectId,
      historyId: args.historyId,
      shareToken,
      isPublic: args.isPublic,
      createdAt: Date.now(),
    })
    return { shareId, shareToken }
  },
})

export const getShareByToken = query({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    const shares = await ctx.db
      .query('shares')
      .withIndex('by_shareToken', (q) => q.eq('shareToken', args.shareToken))
      .take(1)

    if (shares.length === 0) return null

    const share = shares[0]
    const history = await ctx.db.get(share.historyId)

    return { share, history }
  },
})

export const deleteShare = mutation({
  args: { shareId: v.id('shares') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.shareId)
  },
})

export const listShares = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const shares = await ctx.db
      .query('shares')
      .filter((q) => q.eq(q.field('projectId'), args.projectId))
      .order('desc')
      .collect()

    const withHistory = await Promise.all(
      shares.map(async (share) => ({
        ...share,
        history: await ctx.db.get(share.historyId),
      }))
    )

    return withHistory
  },
})
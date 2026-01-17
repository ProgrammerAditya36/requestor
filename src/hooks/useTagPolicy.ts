import type { Tag } from '@/lib/types'

export function useTagPolicy(tags: Tag[]) {
  const mergeHeaders = (requestHeaders: Record<string, string>) => {
    const tagHeaders = tags.reduce(
      (acc, tag) => ({ ...acc, ...tag.headers }),
      {} as Record<string, string>
    )
    // Request headers take priority
    return { ...tagHeaders, ...requestHeaders }
  }

  const mergeParams = (requestParams: Record<string, string>) => {
    const tagParams = tags.reduce(
      (acc, tag) => ({ ...acc, ...tag.queryParams }),
      {} as Record<string, string>
    )
    // Request params take priority
    return { ...tagParams, ...requestParams }
  }

  return { mergeHeaders, mergeParams }
}
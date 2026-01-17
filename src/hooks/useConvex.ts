import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

// Projects
export function useProjects() {
  return useQuery(api.projects.listProjects)
}

export function useCreateProject() {
  return useMutation(api.projects.createProject)
}

export function useUpdateProject() {
  return useMutation(api.projects.updateProject)
}

export function useDeleteProject() {
  return useMutation(api.projects.deleteProject)
}

// Requests
export function useRequestsByProject(projectId: Id<'projects'> | null) {
  return useQuery(
    api.requests.listRequests,
    projectId ? { projectId } : 'skip'
  )
}

export function useCreateRequest() {
  return useMutation(api.requests.createRequest)
}

export function useUpdateRequest() {
  return useMutation(api.requests.updateRequest)
}

export function useDeleteRequest() {
  return useMutation(api.requests.deleteRequest)
}

// Tags
export function useTags() {
  return useQuery(api.tags.listTags)
}

export function useCreateTag() {
  return useMutation(api.tags.createTag)
}

export function useUpdateTag() {
  return useMutation(api.tags.updateTag)
}

export function useDeleteTag() {
  return useMutation(api.tags.deleteTag)
}

// Execution & History
// Note: Request execution is now done client-side (see src/lib/requestExecution.ts)
// This hook is no longer needed

export function useHistory(projectId: Id<'projects'> | null) {
  return useQuery(
    api.execution.listHistory,
    projectId ? { projectId, limit: 50 } : 'skip'
  )
}

export function useDeleteHistory() {
  return useMutation(api.execution.deleteHistory)
}

export function useSaveHistory() {
  return useMutation(api.execution.saveHistory)
}

// Shares
export function useCreateShare() {
  return useMutation(api.shares.createShare)
}

export function useDeleteShare() {
  return useMutation(api.shares.deleteShare)
}
// Environments
export function useEnvironmentsByProject(projectId: Id<'projects'> | null) {
	return useQuery(
	  api.environments.listEnvironments,
	  projectId ? { projectId } : 'skip'
	)
  }
  
  export function useCreateEnvironment() {
	return useMutation(api.environments.createEnvironment)
  }
  
  export function useUpdateEnvironment() {
	return useMutation(api.environments.updateEnvironment)
  }
  
  export function useDeleteEnvironment() {
	return useMutation(api.environments.deleteEnvironment)
  }
  
  export function useSetActiveEnvironment() {
	return useMutation(api.environments.setActiveEnvironment)
  }
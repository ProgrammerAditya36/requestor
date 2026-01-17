import { useState, useEffect, useCallback } from 'react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import type {  Request } from '@/lib/types'
import {
  Panel,
  Group,
  Separator,
} from 'react-resizable-panels'
import { Layout } from '@/components/Layout'
import { RequestEditor } from '@/components/RequestEditor'
import { ResponseViewer } from '@/components/ResponseViewer'
import { HistoryPanel } from '@/components/HistoryPanel'
import { EnvironmentSelector } from '@/components/EnvironmentSelector'
import { EnvironmentPage } from '@/components/EnvironmentPage'
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
  useRequestsByProject,
  useCreateRequest,
  useDeleteRequest,
  useUpdateRequest,
  useTags,
  useHistory,
  useDeleteHistory,
  useSaveHistory,
  useEnvironmentsByProject,
  useCreateEnvironment,
  useUpdateEnvironment,
  useDeleteEnvironment,
  useSetActiveEnvironment,
} from '../src/hooks/useConvex'
import { executeRequestClient } from '@/lib/requestExecution'
import type { Id } from '../convex/_generated/dataModel'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL, {
  unsavedChangesWarning: false,
})

interface HistoryEntry {
  id: Id<'history'>
  method: string
  url: string
  status?: number
  timestamp: number
  duration: number
}

type View = 'requests' | 'environments'

function AppContent() {
  const [view, setView] = useState<View>('requests')
  const [selectedProjectId, setSelectedProjectId] = useState<Id<'projects'> | null>(null)
  const [selectedRequestId, setSelectedRequestId] = useState<Id<'requests'> | null>(null)
  const [selectedHistoryId, setSelectedHistoryId] = useState<Id<'history'> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [localRequest, setLocalRequest] = useState<Partial<Request> | null>(null)
  const [response, setResponse] = useState<{
    status?: number
    statusText?: string
    headers?: Record<string, string>
    body?: string
    error?: string
  }>({})

  // Convex queries
  const projects = useProjects()
  const requests = useRequestsByProject(selectedProjectId)
  const tags = useTags()
  const history = useHistory(selectedProjectId)
  const environments = useEnvironmentsByProject(selectedProjectId)
  const createEnvironment = useCreateEnvironment()
  const updateEnvironment = useUpdateEnvironment()
  const deleteEnvironment = useDeleteEnvironment()
  const setActiveEnvironment = useSetActiveEnvironment()

  // Convex mutations
  const createProject = useCreateProject()
  const deleteProject = useDeleteProject()
  const createRequest = useCreateRequest()
  const deleteRequest = useDeleteRequest()
  const updateRequest = useUpdateRequest()
  const deleteHistory = useDeleteHistory()
  const saveHistory = useSaveHistory()
  const currentProject = projects?.find(p => p._id === selectedProjectId)
  const handleCreateEnvironment = async (name: string, variables: Record<string, string>) => {
    if (!selectedProjectId) return
    try {
      await createEnvironment({
        projectId: selectedProjectId,
        name,
        variables,
      })
    } catch (error) {
      console.error('Failed to create environment:', error)
      alert('Failed to create environment')
    }
  }
  const handleUpdateEnvironment = async (envId: Id<'environments'>, name?: string, variables?: Record<string, string>) => {
    try {
      await updateEnvironment({
        environmentId: envId,
        ...(name && { name }),
        ...(variables && { variables }),
      })
    } catch (error) {
      console.error('Failed to update environment:', error)
      alert('Failed to update environment')
    }
  }
  
  const handleDeleteEnvironment = async (envId: Id<'environments'>) => {
    if (confirm('Delete this environment?')) {
      try {
        await deleteEnvironment({ environmentId: envId })
      } catch (error) {
        console.error('Failed to delete environment:', error)
        alert('Failed to delete environment')
      }
    }
  }
  
  const handleSetActiveEnvironment = async (envId: Id<'environments'> | undefined) => {
    if (!selectedProjectId) return
    try {
      await setActiveEnvironment({
        projectId: selectedProjectId,
        environmentId: envId,
      })
    } catch (error) {
      console.error('Failed to set environment:', error)
      alert('Failed to set environment')
    }
  }
  // Set first project as selected on load
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0]._id)
    }
  }, [projects, selectedProjectId])

  // Set first request as selected when project changes
  useEffect(() => {
    if (requests && requests.length > 0 && !selectedRequestId) {
      setSelectedRequestId(requests[0]._id)
    } else if (requests && requests.length === 0) {
      setSelectedRequestId(null)
    }
  }, [requests, selectedRequestId])

  // Keyboard shortcut: Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setIsSidebarCollapsed((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const currentRequest = requests?.find((r) => r._id === selectedRequestId)

  // Sync local request state when selected request changes
  useEffect(() => {
    if (currentRequest) {
      setLocalRequest({
        id: currentRequest._id,
        projectId: currentRequest.projectId,
        name: currentRequest.name,
        method: currentRequest.method,
        url: currentRequest.url,
        headers: currentRequest.headers || {},
        queryParams: currentRequest.queryParams || {},
        body: currentRequest.body,
        tagIds: currentRequest.tagIds || [],
        createdAt: currentRequest.createdAt,
        updatedAt: currentRequest.updatedAt,
      })
    } else {
      setLocalRequest(null)
    }
  }, [currentRequest])

  const handleNewProject = async () => {
    const name = prompt('Project name:')
    if (name) {
      try {
        const newProjectId = await createProject({ name })
        setSelectedProjectId(newProjectId)
      } catch (error) {
        console.error('Failed to create project:', error)
        alert('Failed to create project')
      }
    }
  }

  const handleNewRequest = async () => {
    if (!selectedProjectId) return
    const name = prompt('Request name:') || 'New Request'
    try {
      const newRequestId = await createRequest({
        projectId: selectedProjectId,
        name,
        method: 'GET',
        url: '',
        headers: {},
        queryParams: {},
        tagIds: [],
      })
      setSelectedRequestId(newRequestId)
    } catch (error) {
      console.error('Failed to create request:', error)
      alert('Failed to create request')
    }
  }

  const handleDeleteProject = async (projectId: Id<'projects'>) => {
    if (confirm('Delete this project and all its requests?')) {
      try {
        await deleteProject({ projectId })
        if (selectedProjectId === projectId) {
          setSelectedProjectId(null)
        }
      } catch (error) {
        console.error('Failed to delete project:', error)
        alert('Failed to delete project')
      }
    }
  }

  const handleDeleteRequest = async (requestId: Id<'requests'>) => {
    if (confirm('Delete this request?')) {
      try {
        await deleteRequest({ requestId })
        if (selectedRequestId === requestId) {
          setSelectedRequestId(null)
        }
      } catch (error) {
        console.error('Failed to delete request:', error)
        alert('Failed to delete request')
      }
    }
  }

  // Update local state only - no database mutations on typing
  const handleUpdateRequest = useCallback((updated: Partial<Request>) => {
    if (!localRequest) return
    setLocalRequest({ ...localRequest, ...updated })
  }, [localRequest])

  const handleSendRequest = async () => {
    if (!selectedProjectId || !selectedRequestId || !localRequest) return

    // Save request to database before sending
    try {
      const methodsWithoutBody = ['GET', 'HEAD', 'OPTIONS']
      const canHaveBody = !methodsWithoutBody.includes(localRequest.method || 'GET')
      
      await updateRequest({
        requestId: selectedRequestId,
        ...(localRequest.name && { name: localRequest.name }),
        ...(localRequest.method && { method: localRequest.method }),
        ...(localRequest.url && { url: localRequest.url }),
        ...(localRequest.headers && { headers: localRequest.headers }),
        ...(localRequest.queryParams && { queryParams: localRequest.queryParams }),
        // Only save body if method allows it, otherwise set to undefined to clear it
        ...(canHaveBody && localRequest.body !== undefined 
          ? { body: localRequest.body }
          : { body: undefined }),
        ...(localRequest.tagIds && { tagIds: (localRequest.tagIds as string[]).map((id) => id as Id<'tags'>) }),
      })
    } catch (error) {
      console.error('Failed to save request:', error)
      // Continue anyway - user might want to send even if save fails
    }

    setIsLoading(true)
    setResponse({})

    try {
      // Get environment variables if selected
      const environmentVariables = currentProject?.selectedEnvironmentId
        ? environments?.find((e) => e._id === currentProject.selectedEnvironmentId)?.variables
        : undefined

      // Get tag data for selected tags
      const selectedTags = mappedTags.filter((t) => localRequest.tagIds?.includes(t.id))
      const tagHeaders = selectedTags.map((t) => t.headers || {})
      const tagParams = selectedTags.map((t) => t.queryParams || {})

      // Execute request on client side
      const result = await executeRequestClient({
        url: localRequest.url || '',
        method: localRequest.method || 'GET',
        headers: localRequest.headers || {},
        queryParams: localRequest.queryParams || {},
        body: localRequest.body,
        environmentVariables,
        tagHeaders,
        tagParams,
      })

      // Save history to database
      try {
        await saveHistory({
          projectId: selectedProjectId,
          requestId: selectedRequestId,
          environmentId: currentProject?.selectedEnvironmentId,
          method: localRequest.method || 'GET',
          url: localRequest.url || '',
          resolvedUrl: result.resolvedUrl,
          resolvedHeaders: result.resolvedHeaders,
          resolvedQueryParams: result.resolvedQueryParams,
          resolvedBody: result.resolvedBody,
          status: result.status,
          statusText: result.statusText,
          responseHeaders: result.headers,
          responseBody: result.body,
          error: result.error,
          duration: result.duration,
        })
      } catch (historyError) {
        console.error('Failed to save history:', historyError)
        // Continue even if history save fails
      }

      if (result.success) {
        setResponse({
          status: result.status,
          statusText: result.statusText,
          headers: result.headers,
          body: result.body,
        })
      } else {
        setResponse({
          error: result.error,
        })
      }
    } catch (error) {
      setResponse({
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteHistoryEntry = async (historyId: Id<'history'>) => {
    try {
      await deleteHistory({ historyId })
      if (selectedHistoryId === historyId) {
        setSelectedHistoryId(null)
      }
    } catch (error) {
      console.error('Failed to delete history:', error)
      alert('Failed to delete history')
    }
  }

  const historyData: HistoryEntry[] = (history || []).map((h) => ({
    id: h._id,
    method: h.method,
    url: h.url,
    status: h.status,
    timestamp: h.timestamp,
    duration: h.duration,
  }))

  // Map Convex documents to expected types
  const mappedProjects = (projects || []).map((p) => ({
    id: p._id,
    name: p.name,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }))

  const mappedRequests = (requests || []).map((r) => ({
    id: r._id,
    projectId: r.projectId,
    name: r.name,
    method: r.method,
    url: r.url,
    headers: r.headers || {},
    queryParams: r.queryParams || {},
    body: r.body,
    tagIds: r.tagIds || [],
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }))

  const mappedTags = (tags || []).map((t) => ({
    id: t._id,
    name: t.name,
    color: t.color,
    icon: t.icon,
    headers: t.headers || {},
    queryParams: t.queryParams || {},
    description: t.description,
  }))

  return (
    <Layout
      projects={mappedProjects}
      requests={mappedRequests}
      selectedProjectId={selectedProjectId ?? null}
      selectedRequestId={selectedRequestId ?? null}
      allTags={mappedTags}
      onSelectProject={(projectId) => setSelectedProjectId(projectId as Id<'projects'>)}
      onSelectRequest={(requestId) => setSelectedRequestId(requestId as Id<'requests'>)}
      onNewProject={handleNewProject}
      onNewRequest={handleNewRequest}
      onDeleteProject={(projectId) => handleDeleteProject(projectId as Id<'projects'>)}
      onDeleteRequest={(requestId) => handleDeleteRequest(requestId as Id<'requests'>)}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
    >
      {view === 'environments' ? (
        <EnvironmentPage
          environments={environments || []}
          selectedEnvironmentId={currentProject?.selectedEnvironmentId}
          onSelectEnvironment={handleSetActiveEnvironment}
          onCreateEnvironment={handleCreateEnvironment}
          onUpdateEnvironment={handleUpdateEnvironment}
          onDeleteEnvironment={handleDeleteEnvironment}
          onBack={() => setView('requests')}
        />
      ) : (
        /* Main Content Area with Resizable Panels */
        <Group orientation="horizontal" className="flex-1">
        {/* Left: Request Editor */}
        <Panel defaultSize={60} minSize={30}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto">
              {currentRequest ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-lg">Request</h2>
                    {selectedProjectId && (
                      <EnvironmentSelector
                        environments={environments || []}
                        selectedEnvironmentId={currentProject?.selectedEnvironmentId}
                        onSelectEnvironment={handleSetActiveEnvironment}
                        onManageEnvironments={() => setView('environments')}
                      />
                    )}
                  </div>
                  <RequestEditor
                  request={localRequest || {
                    id: currentRequest._id,
                    projectId: currentRequest.projectId,
                    name: currentRequest.name,
                    method: currentRequest.method,
                    url: currentRequest.url,
                    headers: currentRequest.headers || {},
                    queryParams: currentRequest.queryParams || {},
                    body: currentRequest.body,
                    tagIds: currentRequest.tagIds || [],
                    createdAt: currentRequest.createdAt,
                    updatedAt: currentRequest.updatedAt,
                  }}
                  onRequestChange={handleUpdateRequest}
                  allTags={mappedTags}
                  environmentVariables={
                    currentProject?.selectedEnvironmentId
                      ? environments?.find(
                          (e) => e._id === currentProject.selectedEnvironmentId
                        )?.variables
                      : undefined
                  }
                  onSend={handleSendRequest}
                  isLoading={isLoading}
                />
                </>
              ) : (
                <p className="text-muted-foreground">
                  Select or create a request
                </p>
              )}
            </div>
          </div>
        </Panel>

        {/* Resize Handle */}
        <Separator className="hover:bg-primary/50 bg-border w-1 transition-colors" />

        {/* Right: Response + History */}
        <Panel defaultSize={40} minSize={20}>
          <Group orientation="vertical" className="h-full">
            {/* Response Viewer */}
            <Panel defaultSize={50} minSize={20}>
              <div className="p-4 border-b border-border h-full overflow-y-auto">
                <ResponseViewer {...response} isLoading={isLoading} />
              </div>
            </Panel>

            {/* Resize Handle between Response and History */}
            <Separator className="hover:bg-primary/50 bg-border h-1 transition-colors" />

            {/* History */}
            <Panel defaultSize={50} minSize={20}>
              <div className="p-4 h-full overflow-y-auto">
                {historyData.length > 0 ? (
                  <HistoryPanel
                    history={historyData}
                    selectedHistoryId={selectedHistoryId ?? undefined}
                    onSelectHistory={(id) => setSelectedHistoryId(id as Id<'history'>)}
                    onCopyAsCurl={() => alert('Copy cURL - coming soon!')}
                    onShare={() => alert('Share - coming soon!')}
                    onDelete={(id) => handleDeleteHistoryEntry(id as Id<'history'>)}
                  />
                ) : (
                  <p className="py-8 text-muted-foreground text-center">
                    No request history yet
                  </p>
                )}
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>
      )}
    </Layout>
  )
}

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <AppContent />
    </ConvexProvider>
  )
}
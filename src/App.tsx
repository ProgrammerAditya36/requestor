import { useState, useEffect } from 'react'
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
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
  useRequestsByProject,
  useCreateRequest,
  useDeleteRequest,
  useUpdateRequest,
  useTags,
  useExecuteRequest,
  useHistory,
  useDeleteHistory,
} from '../src/hooks/useConvex'
import type { Id } from '../convex/_generated/dataModel'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

interface HistoryEntry {
  id: Id<'history'>
  method: string
  url: string
  status?: number
  timestamp: number
  duration: number
}

function AppContent() {
  const [selectedProjectId, setSelectedProjectId] = useState<Id<'projects'> | null>(null)
  const [selectedRequestId, setSelectedRequestId] = useState<Id<'requests'> | null>(null)
  const [selectedHistoryId, setSelectedHistoryId] = useState<Id<'history'> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
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

  // Convex mutations
  const createProject = useCreateProject()
  const deleteProject = useDeleteProject()
  const createRequest = useCreateRequest()
  const deleteRequest = useDeleteRequest()
  const updateRequest = useUpdateRequest()
  const executeRequest = useExecuteRequest()
  const deleteHistory = useDeleteHistory()

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

  const handleUpdateRequest = async (updated: Partial<Request>) => {
    if (!selectedRequestId) return
    try {
      await updateRequest({
        requestId: selectedRequestId,
        ...(updated.name && { name: updated.name }),
        ...(updated.method && { method: updated.method }),
        ...(updated.url && { url: updated.url }),
        ...(updated.headers && { headers: updated.headers }),
        ...(updated.queryParams && { queryParams: updated.queryParams }),
        ...(updated.body !== undefined && { body: updated.body }),
        ...(updated.tagIds && { tagIds: updated.tagIds.map((id) => id as Id<'tags'>) }),
      })
    } catch (error) {
      console.error('Failed to update request:', error)
      alert('Failed to update request')
    }
  }

  const handleSendRequest = async () => {
    if (!selectedProjectId || !selectedRequestId || !currentRequest) return

    setIsLoading(true)
    setResponse({})

    try {
      const result = await executeRequest({
        projectId: selectedProjectId,
        requestId: selectedRequestId,
        method: currentRequest.method,
        url: currentRequest.url,
        headers: currentRequest.headers,
        queryParams: currentRequest.queryParams,
        body: currentRequest.body,
        tagIds: currentRequest.tagIds,
      })

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
      {/* Main Content Area with Resizable Panels */}
      <Group orientation="horizontal" className="flex-1">
        {/* Left: Request Editor */}
        <Panel defaultSize={60} minSize={30}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto">
              {currentRequest ? (
                <RequestEditor
                  request={{
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
                  onSend={handleSendRequest}
                  isLoading={isLoading}
                />
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
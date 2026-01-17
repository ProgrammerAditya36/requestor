import type { Project, Request } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Folder, FileText, Trash2, ChevronLeft } from 'lucide-react'

interface SidebarProps {
  projects: Project[]
  requests: Request[]
  selectedProjectId: string | null
  selectedRequestId: string | null
  onSelectProject: (projectId: string) => void
  onSelectRequest: (requestId: string) => void
  onNewProject: () => void
  onNewRequest: () => void
  onDeleteProject: (projectId: string) => void
  onDeleteRequest: (requestId: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({
  projects,
  requests,
  selectedProjectId,
  selectedRequestId,
  onSelectProject,
  onSelectRequest,
  onNewProject,
  onNewRequest,
  onDeleteProject,
  onDeleteRequest,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const currentProject = projects.find(p => p.id === selectedProjectId)
  const projectRequests = currentProject
    ? requests.filter(r => r.projectId === selectedProjectId)
    : []

  if (isCollapsed) {
    return (
      <div className="flex flex-col justify-start items-center bg-sidebar pt-4 border-sidebar-border border-r w-16 h-screen">
        <Button
          onClick={onToggleCollapse}
          variant="ghost"
          size="sm"
          className="hover:bg-sidebar-primary/20 text-sidebar-foreground"
          title="Toggle Sidebar (Cmd+B)"
        >
          <ChevronLeft size={20} />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-sidebar border-sidebar-border border-r w-64 h-screen">
      {/* Header */}
      <div className="space-y-3 p-4 border-sidebar-border border-b">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-sidebar-foreground text-lg">Requestor</h1>
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="sm"
            className="hover:bg-sidebar-primary/20 text-sidebar-foreground"
            title="Toggle Sidebar (Cmd+B)"
          >
            <ChevronLeft size={18} />
          </Button>
        </div>
        <Button
          onClick={onNewProject}
          size="sm"
          className="bg-sidebar-primary hover:opacity-90 w-full text-sidebar-primary-foreground"
        >
          <Plus size={16} className="mr-1" /> New Project
        </Button>
      </div>

      {/* Projects List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {projects.length === 0 ? (
            <p className="text-sidebar-foreground/50 text-sm">
              No projects yet. Create one to get started!
            </p>
          ) : (
            projects.map(project => (
              <div key={project.id}>
                <button
                  onClick={() => onSelectProject(project.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedProjectId === project.id
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <Folder size={16} />
                  <span className="flex-1 text-left truncate">
                    {project.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteProject(project.id)
                    }}
                    className="opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </button>

                {/* Requests in this project */}
                {selectedProjectId === project.id && (
                  <div className="space-y-1 mt-1 ml-2 pl-3 border-sidebar-border border-l">
                    <Button
                      onClick={onNewRequest}
                      variant="ghost"
                      size="sm"
                      className="justify-start w-full text-xs"
                    >
                      <Plus size={14} className="mr-1" /> New Request
                    </Button>

                    {projectRequests.length === 0 ? (
                      <p className="p-2 text-sidebar-foreground/50 text-xs">
                        No requests yet
                      </p>
                    ) : (
                      projectRequests.map(request => (
                        <button
                          key={request.id}
                          onClick={() => onSelectRequest(request.id)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                            selectedRequestId === request.id
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/30'
                          }`}
                        >
                          <FileText size={12} />
                          <span className="flex-1 text-left truncate">
                            {request.name || 'Untitled'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteRequest(request.id)
                            }}
                            className="opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
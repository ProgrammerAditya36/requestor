import type { ReactNode } from 'react'
import type { Project, Request, Tag } from '@/lib/types'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  projects: Project[]
  requests: Request[]
  selectedProjectId: string | null
  selectedRequestId: string | null
  allTags: Tag[]
  onSelectProject: (projectId: string) => void
  onSelectRequest: (requestId: string) => void
  onNewProject: () => void
  onNewRequest: () => void
  onDeleteProject: (projectId: string) => void
  onDeleteRequest: (requestId: string) => void
  isSidebarCollapsed: boolean
  onToggleSidebarCollapse: () => void
  children: ReactNode
}

export function Layout({
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
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  children,
}: LayoutProps) {
  return (
    <div className="flex bg-background h-screen">
      <Sidebar
        projects={projects}
        requests={requests}
        selectedProjectId={selectedProjectId}
        selectedRequestId={selectedRequestId}
        onSelectProject={onSelectProject}
        onSelectRequest={onSelectRequest}
        onNewProject={onNewProject}
        onNewRequest={onNewRequest}
        onDeleteProject={onDeleteProject}
        onDeleteRequest={onDeleteRequest}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={onToggleSidebarCollapse}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
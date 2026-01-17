import type { TagColor } from '@/lib/tagColors'

export type Tag = {
  id: string
  name: string
  color: TagColor
  icon?: string // emoji or icon name
  headers: Record<string, string>
  queryParams: Record<string, string>
  description?: string
}

export type Request = {
  id: string
  projectId: string
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
  url: string
  headers: Record<string, string>
  queryParams: Record<string, string>
  body?: string
  tagIds: string[] // IDs of tags applied to this request
  createdAt: number
  updatedAt: number
}

export type Project = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}
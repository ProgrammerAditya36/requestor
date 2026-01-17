import { X } from 'lucide-react'
import { tagColors } from '@/lib/tagColors'
import type { TagColor } from '@/lib/tagColors'

interface TagBadgeProps {
  name: string
  color: TagColor
  icon?: string
  onRemove: () => void
}

export function TagBadge({
  name,
  color,
  icon,
  onRemove,
}: TagBadgeProps) {
  const colorStyle = tagColors[color]

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${colorStyle.badge} border ${colorStyle.border}`}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span>{name}</span>
      <button
        onClick={onRemove}
        className="hover:opacity-70 ml-1 transition-opacity"
        aria-label={`Remove ${name} tag`}
      >
        <X size={14} />
      </button>
    </div>
  )
}
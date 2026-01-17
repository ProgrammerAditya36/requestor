import type { Tag } from '@/lib/types'
import { tagColors } from '@/lib/tagColors'
import { Check } from 'lucide-react'

interface TagCardProps {
  tag: Tag
  isSelected: boolean
  onClick: () => void
}

export function TagCard({ tag, isSelected, onClick }: TagCardProps) {
  const colorStyle = tagColors[tag.color]

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? `${colorStyle.bg} ${colorStyle.border} ${colorStyle.text}`
          : 'bg-card border-border hover:border-primary'
      }`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {tag.icon && <span className="text-xl">{tag.icon}</span>}
            <h3 className="font-semibold text-base">{tag.name}</h3>
          </div>
          {tag.description && (
            <p className={`text-sm ${isSelected ? colorStyle.text : 'text-muted-foreground'}`}>
              {tag.description}
            </p>
          )}
          {(Object.keys(tag.headers).length > 0 ||
            Object.keys(tag.queryParams).length > 0) && (
            <div className={`mt-2 space-y-1 text-xs ${isSelected ? colorStyle.text : 'text-muted-foreground'}`}>
              {Object.keys(tag.headers).length > 0 && (
                <p>📋 Adds {Object.keys(tag.headers).length} header(s)</p>
              )}
              {Object.keys(tag.queryParams).length > 0 && (
                <p>🔗 Adds {Object.keys(tag.queryParams).length} param(s)</p>
              )}
            </div>
          )}
        </div>
        {isSelected && <Check size={20} className="mt-1 shrink-0" />}
      </div>
    </button>
  )
}
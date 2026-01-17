import { useState } from 'react'
import type { Tag } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TagCard } from './TagCard'
import { Search } from 'lucide-react'

interface TagSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allTags: Tag[]
  selectedTagIds: string[]
  onTagToggle: (tagId: string) => void
}

export function TagSelector({
  open,
  onOpenChange,
  allTags,
  selectedTagIds,
  onTagToggle,
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTags = allTags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Tags for this Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="top-2.5 left-3 absolute w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tags Grid */}
          <ScrollArea className="pr-4 h-[400px]">
            <div className="space-y-3">
              {filteredTags.length > 0 ? (
                filteredTags.map(tag => (
                  <TagCard
                    key={tag.id}
                    tag={tag}
                    isSelected={selectedTagIds.includes(tag.id)}
                    onClick={() => onTagToggle(tag.id)}
                  />
                ))
              ) : (
                <p className="py-8 text-muted-foreground text-center">
                  No tags found. Create one first!
                </p>
              )}
            </div>
          </ScrollArea>

          {/* Summary */}
          <div className="text-muted-foreground text-sm">
            {selectedTagIds.length} tag{selectedTagIds.length !== 1 ? 's' : ''} selected
          </div>

          {/* Close Button */}
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full"
            variant="default"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
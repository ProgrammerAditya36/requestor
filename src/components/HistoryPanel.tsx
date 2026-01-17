import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, Share2, Trash2 } from 'lucide-react'

interface HistoryEntry {
  id: string
  method: string
  url: string
  status?: number
  timestamp: number
  duration: number // ms
}

interface HistoryPanelProps {
  history: HistoryEntry[]
  selectedHistoryId?: string
  onSelectHistory: (id: string) => void
  onCopyAsCurl: (id: string) => void
  onShare: (id: string) => void
  onDelete: (id: string) => void
}

const methodColors: Record<string, string> = {
  GET: 'bg-blue-900 text-blue-100',
  POST: 'bg-green-900 text-green-100',
  PUT: 'bg-yellow-900 text-yellow-100',
  DELETE: 'bg-red-900 text-red-100',
  PATCH: 'bg-purple-900 text-purple-100',
  HEAD: 'bg-gray-900 text-gray-100',
  OPTIONS: 'bg-gray-900 text-gray-100',
}

export function HistoryPanel({
  history,
  selectedHistoryId,
  onSelectHistory,
  onCopyAsCurl,
  onShare,
  onDelete,
}: HistoryPanelProps) {
  const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-900 text-gray-100'
    if (status >= 200 && status < 300) return 'bg-green-900 text-green-100'
    if (status >= 400 && status < 500) return 'bg-yellow-900 text-yellow-100'
    return 'bg-red-900 text-red-100'
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  if (history.length === 0) {
    return (
      <Card className="flex justify-center items-center bg-card p-6 border-border min-h-96">
        <p className="text-muted-foreground">No request history yet</p>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col bg-card border-border overflow-hidden">
      <div className="bg-secondary/50 p-4 border-b border-border">
        <h3 className="font-semibold">Request History</h3>
      </div>

      <ScrollArea className="flex-1 h-96">
        <div className="space-y-2 p-4">
          {history.map(entry => (
            <button
              key={entry.id}
              onClick={() => onSelectHistory(entry.id)}
              className={`w-full text-left p-3 rounded-md border transition-colors ${
                selectedHistoryId === entry.id
                  ? 'bg-primary/10 border-primary'
                  : 'border-border hover:bg-secondary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Method Badge */}
                <Badge className={`${methodColors[entry.method]} shrink-0`}>
                  {entry.method}
                </Badge>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-foreground text-sm truncate">
                    {entry.url}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {entry.status && (
                      <Badge className={`text-xs ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </Badge>
                    )}
                    <span className="text-muted-foreground text-xs">
                      {formatTime(entry.timestamp)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {entry.duration}ms
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      onCopyAsCurl(entry.id)
                    }}
                    variant="ghost"
                    size="sm"
                    className="p-0 w-8 h-8"
                  >
                    <Copy size={14} />
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      onShare(entry.id)
                    }}
                    variant="ghost"
                    size="sm"
                    className="p-0 w-8 h-8"
                  >
                    <Share2 size={14} />
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(entry.id)
                    }}
                    variant="ghost"
                    size="sm"
                    className="p-0 w-8 h-8"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
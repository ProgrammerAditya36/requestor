import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Plus } from 'lucide-react'

interface KeyValueEditorProps {
  label: string
  pairs: Record<string, string>
  onChange: (pairs: Record<string, string>) => void
  placeholder?: string
}

export function KeyValueEditor({
  label,
  pairs,
  onChange,
  placeholder = 'Value',
}: KeyValueEditorProps) {
  // Use index-based stable IDs that don't change when keys change
  const entriesWithKeys = useMemo(() => {
    return Object.entries(pairs).map(([key, value], index) => ({
      id: index, // Use index as stable ID
      key,
      value,
    }))
  }, [pairs])

  const updatePair = (id: number, newKey: string, newValue: string) => {
    const entries = Object.entries(pairs)
    const updatedPairs: Record<string, string> = {}
    
    // Update the entry at the given index
    entries.forEach((entry, index) => {
      if (index === id) {
        if (newKey) {
          updatedPairs[newKey] = newValue
        }
      } else {
        updatedPairs[entry[0]] = entry[1]
      }
    })
    
    onChange(updatedPairs)
  }

  const removePair = (id: number) => {
    const entries = Object.entries(pairs)
    const updatedPairs: Record<string, string> = {}
    
    entries.forEach((entry, index) => {
      if (index !== id) {
        updatedPairs[entry[0]] = entry[1]
      }
    })
    
    onChange(updatedPairs)
  }

  const addPair = () => {
    onChange({ ...pairs, '': '' })
  }

  return (
    <div className="space-y-2">
      <label className="font-medium text-foreground text-sm">{label}</label>
      <div className="space-y-2">
        {entriesWithKeys.map((entry) => (
          <div key={entry.id} className="flex gap-2">
            <Input
              placeholder="Key"
              value={entry.key}
              onChange={(e) => updatePair(entry.id, e.target.value, entry.value)}
              className="flex-1"
            />
            <Input
              placeholder={placeholder}
              value={entry.value}
              onChange={(e) => updatePair(entry.id, entry.key, e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => removePair(entry.id)}
              variant="ghost"
              size="sm"
              className="px-2"
            >
              <X size={16} />
            </Button>
          </div>
        ))}
      </div>
      <Button
        onClick={addPair}
        variant="outline"
        size="sm"
        className="mt-2"
      >
        <Plus size={16} className="mr-1" /> Add {label}
      </Button>
    </div>
  )
}
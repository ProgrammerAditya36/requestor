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
  const entries = Object.entries(pairs)

  const updatePair = (index: number, key: string, value: string) => {
    const newEntries = [...entries]
    newEntries[index] = [key, value]
    onChange(Object.fromEntries(newEntries))
  }

  const removePair = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index)
    onChange(Object.fromEntries(newEntries))
  }

  const addPair = () => {
    onChange({ ...pairs, '': '' })
  }

  return (
    <div className="space-y-2">
      <label className="font-medium text-foreground text-sm">{label}</label>
      <div className="space-y-2">
        {entries.map(([key, value], index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Key"
              value={key}
              onChange={(e) => updatePair(index, e.target.value, value)}
              className="flex-1"
            />
            <Input
              placeholder={placeholder}
              value={value}
              onChange={(e) => updatePair(index, key, e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => removePair(index)}
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
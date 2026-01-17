import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface EnvironmentVariablesProps {
  variables: Record<string, string>
  onCopy?: (varName: string) => void
}

export function EnvironmentVariables({ variables, onCopy }: EnvironmentVariablesProps) {
  const [copiedVar, setCopiedVar] = useState<string | null>(null)

  const handleCopy = async (varName: string, value: string) => {
    try {
      await navigator.clipboard.writeText(`{{${varName}}}`)
      setCopiedVar(varName)
      setTimeout(() => setCopiedVar(null), 2000)
      onCopy?.(varName)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (Object.keys(variables).length === 0) {
    return null
  }

  return (
    <Card className="p-3 bg-secondary/50 border-border">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-muted-foreground">
          Available Variables
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(variables).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center gap-1 px-2 py-1 bg-background rounded border border-border text-xs"
          >
            <span className="font-mono">
              <span className="text-yellow-500 font-semibold">{'{{'}</span>
              <span className="text-primary">{key}</span>
              <span className="text-yellow-500 font-semibold">{'}}'}</span>
            </span>
            <Button
              onClick={() => handleCopy(key, value)}
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              title={`Copy {{${key}}}`}
            >
              {copiedVar === key ? (
                <Check size={12} className="text-green-500" />
              ) : (
                <Copy size={12} />
              )}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}

import type { Id } from '../../convex/_generated/dataModel'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

interface Environment {
  _id: Id<'environments'>
  name: string
  variables: Record<string, string>
}

interface EnvironmentSelectorProps {
  environments: Environment[]
  selectedEnvironmentId: Id<'environments'> | undefined
  onSelectEnvironment: (envId: Id<'environments'> | undefined) => void
  onManageEnvironments: () => void
}

export function EnvironmentSelector({
  environments,
  selectedEnvironmentId,
  onSelectEnvironment,
  onManageEnvironments,
}: EnvironmentSelectorProps) {
  const selectedEnv = environments.find((e) => e._id === selectedEnvironmentId)

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedEnvironmentId || 'none'}
        onValueChange={(value) => {
          if (value === 'none') {
            onSelectEnvironment(undefined)
          } else {
            onSelectEnvironment(value as Id<'environments'>)
          }
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select environment">
            {selectedEnv ? (
              <span className="flex items-center gap-2">
                🌍 {selectedEnv.name}
              </span>
            ) : (
              'No environment'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No environment</SelectItem>
          {environments.map((env) => (
            <SelectItem key={env._id} value={env._id}>
              {env.name} ({Object.keys(env.variables).length} vars)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={onManageEnvironments}
        variant="outline"
        size="sm"
        title="Manage environments"
      >
        <Settings size={14} />
      </Button>
    </div>
  )
}

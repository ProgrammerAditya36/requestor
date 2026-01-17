import { useState, useMemo } from 'react'
import type { Id } from '../../convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Trash2, Save, X, ArrowLeft } from 'lucide-react'
import { KeyValueEditor } from './KeyValueEditor'

interface Environment {
  _id: Id<'environments'>
  name: string
  variables: Record<string, string>
}

interface EnvironmentPageProps {
  environments: Environment[]
  selectedEnvironmentId: Id<'environments'> | undefined
  onSelectEnvironment: (envId: Id<'environments'> | undefined) => void
  onCreateEnvironment: (name: string, variables: Record<string, string>) => Promise<void>
  onUpdateEnvironment: (envId: Id<'environments'>, name?: string, variables?: Record<string, string>) => Promise<void>
  onDeleteEnvironment: (envId: Id<'environments'>) => Promise<void>
  onBack: () => void
}

export function EnvironmentPage({
  environments,
  selectedEnvironmentId,
  onSelectEnvironment,
  onCreateEnvironment,
  onUpdateEnvironment,
  onDeleteEnvironment,
  onBack,
}: EnvironmentPageProps) {
  const [editingEnvId, setEditingEnvId] = useState<Id<'environments'> | null>(null)
  const [newEnvName, setNewEnvName] = useState('')
  const [newEnvVars, setNewEnvVars] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)

  const editingEnv = editingEnvId ? environments.find(e => e._id === editingEnvId) : null
  const [editName, setEditName] = useState('')
  const [editVars, setEditVars] = useState<Record<string, string>>({})

  const startEditing = (envId: Id<'environments'>) => {
    const env = environments.find(e => e._id === envId)
    if (env) {
      setEditingEnvId(envId)
      setEditName(env.name)
      setEditVars({ ...env.variables })
    }
  }

  const cancelEditing = () => {
    setEditingEnvId(null)
    setEditName('')
    setEditVars({})
  }

  const saveEditing = async () => {
    if (!editingEnvId) return
    try {
      await onUpdateEnvironment(editingEnvId, editName, editVars)
      setEditingEnvId(null)
      setEditName('')
      setEditVars({})
    } catch (error) {
      console.error('Failed to update environment:', error)
      alert('Failed to update environment')
    }
  }

  const handleCreate = async () => {
    if (!newEnvName.trim()) {
      alert('Please enter an environment name')
      return
    }
    try {
      await onCreateEnvironment(newEnvName, newEnvVars)
      setNewEnvName('')
      setNewEnvVars({})
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to create environment:', error)
      alert('Failed to create environment')
    }
  }

  const handleDelete = async (envId: Id<'environments'>) => {
    if (confirm('Delete this environment? This action cannot be undone.')) {
      try {
        await onDeleteEnvironment(envId)
        if (selectedEnvironmentId === envId) {
          onSelectEnvironment(undefined)
        }
      } catch (error) {
        console.error('Failed to delete environment:', error)
        alert('Failed to delete environment')
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Environments</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Manage environment variables for your project. Variables can be used in requests using <code>{'{{'}VARIABLE_NAME{'}}'}</code> syntax.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Existing Environments */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Existing Environments</h2>
            {environments.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                No environments yet. Create one to get started.
              </Card>
            ) : (
              <div className="space-y-4">
                {environments.map((env) => (
                  <Card key={env._id} className="p-4">
                    {editingEnvId === env._id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Environment Name</label>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="e.g., Production, Development"
                          />
                        </div>
                        <div>
                          <KeyValueEditor
                            label="Variables"
                            pairs={editVars}
                            onChange={setEditVars}
                            placeholder="Variable value"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={saveEditing} size="sm">
                            <Save size={14} className="mr-2" />
                            Save
                          </Button>
                          <Button onClick={cancelEditing} variant="outline" size="sm">
                            <X size={14} className="mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{env.name}</h3>
                              {selectedEnvironmentId === env._id && (
                                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                                  Active
                                </span>
                              )}
                            </div>
                            {Object.keys(env.variables).length > 0 ? (
                              <div className="space-y-1">
                                {Object.entries(env.variables).map(([key, value]) => (
                                  <div key={key} className="flex items-center gap-2 text-sm">
                                    <code className="px-2 py-1 bg-secondary rounded text-xs">
                                      {`{{${key}}}`}
                                    </code>
                                    <span className="text-muted-foreground">=</span>
                                    <span className="text-muted-foreground font-mono text-xs">
                                      {value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground text-sm">No variables defined</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => onSelectEnvironment(env._id)}
                              variant={selectedEnvironmentId === env._id ? 'default' : 'outline'}
                              size="sm"
                            >
                              {selectedEnvironmentId === env._id ? 'Active' : 'Select'}
                            </Button>
                            <Button
                              onClick={() => startEditing(env._id)}
                              variant="outline"
                              size="sm"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(env._id)}
                              variant="outline"
                              size="sm"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Create New Environment */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create New Environment</h2>
              {!isCreating && (
                <Button onClick={() => setIsCreating(true)} size="sm">
                  <Plus size={14} className="mr-2" />
                  New Environment
                </Button>
              )}
            </div>
            {isCreating && (
              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Environment Name</label>
                    <Input
                      value={newEnvName}
                      onChange={(e) => setNewEnvName(e.target.value)}
                      placeholder="e.g., Production, Development, Staging"
                    />
                  </div>
                  <div>
                    <KeyValueEditor
                      label="Variables"
                      pairs={newEnvVars}
                      onChange={setNewEnvVars}
                      placeholder="Variable value"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreate} size="sm">
                      <Save size={14} className="mr-2" />
                      Create Environment
                    </Button>
                    <Button
                      onClick={() => {
                        setIsCreating(false)
                        setNewEnvName('')
                        setNewEnvVars({})
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <X size={14} className="mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

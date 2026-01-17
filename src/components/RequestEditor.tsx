import { useState } from 'react'
import type { Request, Tag } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { TagBadge, TagSelector, PolicyPreview } from '@/components/tags'
import { KeyValueEditor } from './KeyValueEditor'
import { JsonInputEditor } from './JsonInputEditor'
import { EnvironmentPreview } from './EnvironmentPreview'
import { UrlInput } from './UrlInput'
import { EnvironmentVariables } from './EnvironmentVariables'

interface RequestEditorProps {
	request: Partial<Request>
	onRequestChange: (request: Partial<Request>) => void
	allTags: Tag[]
	environmentVariables?: Record<string, string>
	onSend: () => void
	isLoading?: boolean
}

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const

export function RequestEditor({
	request,
	onRequestChange,
	allTags,
	environmentVariables,
	onSend,
	isLoading = false,
}: RequestEditorProps) {
	const [selectorOpen, setSelectorOpen] = useState(false)

	const selectedTags = allTags.filter(t => request.tagIds?.includes(t.id))

	const handleTagToggle = (tagId: string) => {
		const newTagIds = (request.tagIds || []).includes(tagId)
			? (request.tagIds || []).filter(id => id !== tagId)
			: [...(request.tagIds || []), tagId]
		onRequestChange({ ...request, tagIds: newTagIds })
	}

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<h2 className="font-semibold text-xl">Request</h2>
					<Button
						onClick={onSend}
						disabled={isLoading || !request.url}
						className="bg-primary hover:opacity-90"
					>
						{isLoading ? 'Sending...' : 'Send Request'}
					</Button>
				</div>

				{/* Name */}
				<div>
					<label className="font-medium text-foreground text-sm">
						Request Name
					</label>
					<Input
						placeholder="My API Request"
						value={request.name || ''}
						onChange={(e) =>
							onRequestChange({ ...request, name: e.target.value })
						}
						className="mt-1"
					/>
				</div>

				{/* Method + URL */}
				<div className="gap-3 grid grid-cols-[120px_1fr]">
					<div>
						<label className="font-medium text-foreground text-sm">
							Method
						</label>
						<Select
							value={request.method || 'GET'}
							onValueChange={(value) => {
								const newMethod = value as Request['method']
								const updates: Partial<Request> = {
									...request,
									method: newMethod,
								}
								// Reset body when switching to GET, HEAD, or OPTIONS
								if (['GET', 'HEAD', 'OPTIONS'].includes(newMethod)) {
									updates.body = undefined
								}
								onRequestChange(updates)
							}}
						>
							<SelectTrigger className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{httpMethods.map(method => (
									<SelectItem key={method} value={method}>
										{method}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<label className="font-medium text-foreground text-sm">URL</label>
						<UrlInput
							placeholder="https://api.example.com/users"
							value={request.url || ''}
							onChange={(url) =>
								onRequestChange({ ...request, url })
							}
							className="mt-1"
						/>
						{/* Show available environment variables */}
						{environmentVariables && Object.keys(environmentVariables).length > 0 && (
							<div className="mt-2">
								<EnvironmentVariables variables={environmentVariables} />
							</div>
						)}
					</div>
				</div>
			</div>

			<Separator />

			{/* Tags Section */}
			<div className="space-y-3">
				<div className="flex justify-between items-center">
					<h3 className="font-semibold">Tags</h3>
					<Button
						onClick={() => setSelectorOpen(true)}
						variant="outline"
						size="sm"
					>
						+ Add Tags
					</Button>
				</div>

				{selectedTags.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{selectedTags.map(tag => (
							<TagBadge
								key={tag.id}
								name={tag.name}
								color={tag.color}
								icon={tag.icon}
								onRemove={() => handleTagToggle(tag.id)}
							/>
						))}
					</div>
				) : (
					<p className="text-muted-foreground text-sm">
						No tags selected. Add tags to inject headers and params automatically.
					</p>
				)}
			</div>

			<Separator />

			{/* Headers */}
			<div className="space-y-3">
				<h3 className="font-semibold">Headers</h3>
				<KeyValueEditor
					label="Request Headers"
					pairs={request.headers || {}}
					onChange={(headers) => onRequestChange({ ...request, headers })}
					placeholder="Header value"
				/>
				{selectedTags.length > 0 && (
					<div className="bg-secondary/50 p-3 border border-border rounded-md">
						<p className="mb-2 text-muted-foreground text-xs">
							📋 Tags will add:
						</p>
						<div className="space-y-1">
							{Object.entries(
								selectedTags.reduce(
									(acc, tag) => ({ ...acc, ...tag.headers }),
									{}
								)
							).map(([key, value]) => (
								<p key={key} className="font-mono text-foreground text-xs">
									<span className="text-primary">{key}:</span>{' '}
									<span className="text-muted-foreground">{value as string}</span>
								</p>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Query Params */}
			<div className="space-y-3">
				<h3 className="font-semibold">Query Parameters</h3>
				<KeyValueEditor
					label="Query Params"
					pairs={request.queryParams || {}}
					onChange={(queryParams) =>
						onRequestChange({ ...request, queryParams })
					}
					placeholder="Param value"
				/>
				{selectedTags.length > 0 && (
					<div className="bg-secondary/50 p-3 border border-border rounded-md">
						<p className="mb-2 text-muted-foreground text-xs">
							🔗 Tags will add:
						</p>
						<div className="space-y-1">
							{Object.entries(
								selectedTags.reduce(
									(acc, tag) => ({ ...acc, ...tag.queryParams }),
									{}
								)
							).map(([key, value]) => (
								<p key={key} className="font-mono text-foreground text-xs">
									<span className="text-primary">{key}:</span>{' '}
									<span className="text-muted-foreground">{value as string}</span>
								</p>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Body */}
      {['POST', 'PUT', 'PATCH'].includes(request.method || '') && (
        <JsonInputEditor
          value={request.body || ''}
          onChange={(body) =>
            onRequestChange({ ...request, body })
          }
          placeholder='{\n  "name": "John",\n  "email": "john@example.com"\n}'
        />
      )}

			<Separator />

			{/* Environment Preview */}
			{environmentVariables && Object.keys(environmentVariables).length > 0 && (
				<div className="space-y-3">
					<h3 className="font-semibold">Final Request (After Variables)</h3>
					<EnvironmentPreview
						variables={environmentVariables}
						request={{
							url: request.url || '',
							headers: request.headers || {},
							queryParams: request.queryParams || {},
							body: request.body,
						}}
					/>
				</div>
			)}

			{/* Policy Preview */}
			{selectedTags.length > 0 && (
				<div className="space-y-3">
					<h3 className="font-semibold">Final Request (After Tags)</h3>
					<PolicyPreview
						tags={selectedTags}
						request={{
							url: request.url || '',
							headers: request.headers || {},
							queryParams: request.queryParams || {},
						}}
					/>
				</div>
			)}

			{/* Tag Selector Modal */}
			<TagSelector
				open={selectorOpen}
				onOpenChange={setSelectorOpen}
				allTags={allTags}
				selectedTagIds={request.tagIds || []}
				onTagToggle={handleTagToggle}
			/>
		</div>
	)
}
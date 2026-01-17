import { useState } from 'react'
import type { Request, Tag } from '@/lib/types'
import { RequestEditor } from '@/components/RequestEditor'

const mockTags: Tag[] = [
  {
    id: '1',
    name: 'Production Auth',
    color: 'red',
    icon: '🔐',
    description: 'Add production authentication',
    headers: { 'Authorization': 'Bearer prod-token-123' },
    queryParams: { 'env': 'prod' },
  },
  {
    id: '2',
    name: 'Dev Config',
    color: 'green',
    icon: '⚙️',
    description: 'Development configuration',
    headers: { 'X-Dev-Mode': 'true' },
    queryParams: { 'debug': 'true' },
  },
]

export default function App() {
  const [request, setRequest] = useState<Partial<Request>>({
    name: '',
    method: 'GET',
    url: '',
    headers: {},
    queryParams: {},
    tagIds: [],
  })

  const handleSend = () => {
    console.log('Sending request:', request)
    alert('Request would be sent! Check console.')
  }

  return (
    <div className="bg-background p-8 min-h-screen text-foreground">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-bold text-3xl">Requestor</h1>
        <RequestEditor
          request={request}
          onRequestChange={setRequest}
          allTags={mockTags}
          onSend={handleSend}
        />
      </div>
    </div>
  )
}
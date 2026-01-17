import { useState, useRef } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface JsonInputEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

// const syntaxHighlightJSON = (json: string): string => {
//   // This is just for display - the actual textarea is transparent over this
//   return json
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/"/g, '&quot;')
// }

export function JsonInputEditor({
  value,
  onChange,
  placeholder = '{\n  "name": "John",\n  "email": "john@example.com"\n}',
}: JsonInputEditorProps) {
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    // Define bracket pairs
    const pairs: Record<string, string> = {
      '"': '"',
      "'": "'",
      '{': '}',
      '[': ']',
      '(': ')',
    }

    const closingChars = new Set(['"', "'", '}', ']', ')'])

    const char = e.key

    // Auto-close brackets and quotes
    if (char in pairs && start === end) {
      e.preventDefault()
      const closing = pairs[char]
      const nextChar = value[start]

      // Check if the next character is already the closing bracket
      if (nextChar === closing) {
        // Just move cursor past it (skip-closing behavior)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1
        }, 0)
      } else {
        // Insert both opening and closing
        const newValue = value.substring(0, start) + char + closing + value.substring(end)
        onChange(newValue)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1
        }, 0)
      }
    }
    // Handle closing brackets - skip over if they exist
    else if (closingChars.has(char) && start === end) {
      const nextChar = value[start]
      if (nextChar === char) {
        e.preventDefault()
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1
        }, 0)
      }
    }
    // Tab indentation
    else if (e.key === 'Tab') {
      e.preventDefault()
      const newValue = value.substring(0, start) + '\t' + value.substring(end)
      onChange(newValue)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + (end === start ? 1 : 0)
      }, 0)
    }
    // Smart Enter with auto-indent
    else if (e.key === 'Enter') {
      e.preventDefault()
      const lines = value.substring(0, start).split('\n')
      const currentLine = lines[lines.length - 1]
      const indent = currentLine.match(/^\s*/)?.[0] || ''

      // Count braces to determine indentation
      const openBraces = (currentLine.match(/{/g) || []).length
      const closeBraces = (currentLine.match(/}/g) || []).length
      const openBrackets = (currentLine.match(/\[/g) || []).length
      const closeBrackets = (currentLine.match(/\]/g) || []).length
      const netOpen = openBraces - closeBraces + openBrackets - closeBrackets

      if (netOpen > 0 || currentLine.trim().endsWith('{') || currentLine.trim().endsWith('[')) {
        const newValue =
          value.substring(0, start) + '\n' + indent + '\t' + value.substring(start)
        onChange(newValue)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            start + indent.length + 2
        }, 0)
      } else {
        const newValue = value.substring(0, start) + '\n' + indent + value.substring(start)
        onChange(newValue)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + indent.length + 1
        }, 0)
      }
    }
  }

  const copyToClipboard = async () => {
    try {
      try {
        const parsed = JSON.parse(value)
        await navigator.clipboard.writeText(JSON.stringify(parsed, null, 2))
      } catch {
        await navigator.clipboard.writeText(value)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(value)
      onChange(JSON.stringify(parsed, null, 2))
    } catch (err) {
      alert('Invalid JSON: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(value)
      onChange(JSON.stringify(parsed))
    } catch (err) {
      alert('Invalid JSON: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="font-medium text-foreground text-sm">Body</label>
        <div className="flex items-center gap-1 ml-auto">
          <Button
            onClick={formatJSON}
            variant="outline"
            size="sm"
            className="h-8 text-xs"
          >
            Format
          </Button>
          <Button
            onClick={minifyJSON}
            variant="outline"
            size="sm"
            className="h-8 text-xs"
          >
            Minify
          </Button>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="h-8"
          >
            {copied ? (
              <>
                <Check size={14} className="mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy size={14} className="mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Syntax Highlighted Code Editor */}
      <div className="group relative border border-border rounded-md overflow-hidden">
        {/* Line numbers and background */}
        <div className="flex">
          {/* Line numbers gutter */}
          <div className="bg-secondary/50 px-3 py-3 border-r border-border font-mono text-muted-foreground text-xs text-right pointer-events-none select-none">
            {value.split('\n').map((_, i) => (
              <div key={i} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Textarea with syntax highlighting */}
          <div className="relative flex-1">
            {/* Syntax highlighting display layer */}
            <pre className="absolute inset-0 bg-secondary/30 p-3 overflow-hidden overflow-y-auto font-mono text-sm leading-6 whitespace-pre-wrap pointer-events-none">
              <code>
                {value.split('\n').map((line, i) => (
                  <div key={i}>
                    {line.split(/(\{|\}|\[|\]|:|,|"[^"]*"|'[^']*'|true|false|null|-?\d+\.?\d*)/g).map(
                      (token, j) => {
                        if (!token) return null

                        // Determine token type and apply color
                        if (token === '{' || token === '}' || token === '[' || token === ']') {
                          return (
                            <span key={j} className="text-foreground">
                              {token}
                            </span>
                          )
                        }
                        if (token === ':' || token === ',') {
                          return (
                            <span key={j} className="text-muted-foreground">
                              {token}
                            </span>
                          )
                        }
                        if (token === 'true' || token === 'false') {
                          return (
                            <span key={j} className="text-blue-400">
                              {token}
                            </span>
                          )
                        }
                        if (token === 'null') {
                          return (
                            <span key={j} className="text-purple-400">
                              {token}
                            </span>
                          )
                        }
                        if (token.match(/^-?\d+\.?\d*$/)) {
                          return (
                            <span key={j} className="text-green-400">
                              {token}
                            </span>
                          )
                        }
                        if (token.match(/^".*"$/) || token.match(/^'.*'$/)) {
                          // Check if it's a key (followed by :) or value
                          const isKey = line.substring(line.indexOf(token) + token.length).match(/^\s*:/)
                          return (
                            <span
                              key={j}
                              className={
                                isKey ? 'text-blue-300' : 'text-orange-400'
                              }
                            >
                              {token}
                            </span>
                          )
                        }
                        return (
                          <span key={j} className="text-foreground">
                            {token}
                          </span>
                        )
                      }
                    )}
                  </div>
                ))}
              </code>
            </pre>

            {/* Actual textarea - transparent text so highlighting shows through */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="relative bg-transparent p-3 border-0 focus:outline-none w-full min-h-[300px] overflow-y-auto font-mono text-transparent text-sm leading-6 caret-foreground resize-none"
              spellCheck="false"
              style={{ color: 'transparent' }}
            />
          </div>
        </div>

        {/* Info text */}
        <div className="bg-secondary/20 px-3 py-2 border-t border-border text-muted-foreground text-xs">
          💡 Auto-close: {'{}'} [] () "" '' | Tab to indent | Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}
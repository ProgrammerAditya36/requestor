import { useRef, useState, useEffect, useMemo } from 'react'

interface UrlInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function UrlInput({
  value,
  onChange,
  placeholder = 'https://api.example.com/users',
  className = '',
}: UrlInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const cursorPosRef = useRef<number | null>(null)
  const isInternalUpdateRef = useRef(false)
  
  // Sync with prop value when it changes externally
  useEffect(() => {
    if (!isInternalUpdateRef.current && value !== localValue) {
      setLocalValue(value)
    }
    isInternalUpdateRef.current = false
  }, [value])

  // Restore cursor position after render
  useEffect(() => {
    if (inputRef.current && cursorPosRef.current !== null) {
      inputRef.current.setSelectionRange(cursorPosRef.current, cursorPosRef.current)
      cursorPosRef.current = null
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    cursorPosRef.current = e.target.selectionStart
    isInternalUpdateRef.current = true
    setLocalValue(newValue)
    onChange(newValue)
  }

  // Memoize highlighted parts for performance
  const highlightedParts = useMemo(() => {
    if (!localValue) return []
    
    const parts: Array<{ text: string; isVariable: boolean }> = []
    let lastIndex = 0
    const regex = /\{\{(\w+)\}\}/g
    let match

    while ((match = regex.exec(localValue)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: localValue.substring(lastIndex, match.index), isVariable: false })
      }
      parts.push({ text: match[0], isVariable: true })
      lastIndex = regex.lastIndex
    }
    if (lastIndex < localValue.length) {
      parts.push({ text: localValue.substring(lastIndex), isVariable: false })
    }
    return parts
  }, [localValue])

  return (
    <div className="relative">
      {/* Highlighted overlay */}
      {localValue && (
        <div className="absolute inset-0 flex items-center px-3 overflow-hidden pointer-events-none">
          <span className="font-mono text-foreground text-sm whitespace-pre">
            {highlightedParts.map((part, i) => (
              <span
                key={i}
                className={part.isVariable ? 'text-yellow-500 font-semibold' : ''}
              >
                {part.text}
              </span>
            ))}
          </span>
        </div>
      )}
      {/* Actual input */}
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`relative w-full h-9 min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm font-mono shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 caret-foreground selection:bg-primary selection:text-primary-foreground ${className}`}
        style={{ color: localValue ? 'transparent' : undefined }}
        spellCheck="false"
      />
    </div>
  )
}

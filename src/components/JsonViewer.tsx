import { useState, type ReactNode } from 'react'
import { Copy, Check, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

type JsonViewerProps = {
  data: any
  isMinimized?: boolean
  showCopyButton?: boolean
  showMinimizeButton?: boolean
}

type DataType =
  | 'STRING'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'NULL'
  | 'OBJECT'
  | 'ARRAY'
  | 'UNDEFINED'

function getDataType(value: any): DataType {
  if (value === null) return 'NULL'
  if (value === undefined) return 'UNDEFINED'
  if (Array.isArray(value)) return 'ARRAY'
  if (typeof value === 'object') return 'OBJECT'
  if (typeof value === 'boolean') return 'BOOLEAN'
  if (typeof value === 'number') return 'NUMBER'
  return 'STRING'
}

function formatValue(value: any, dataType: DataType): string {
  if (dataType === 'NULL') return 'null'
  if (dataType === 'UNDEFINED') return 'undefined'
  if (dataType === 'BOOLEAN') return String(value)
  if (dataType === 'NUMBER') return String(value)
  if (dataType === 'STRING') return value
  if (dataType === 'ARRAY') return `[${value.length} items]`
  if (dataType === 'OBJECT') return `{${Object.keys(value).length} keys}`
  return String(value)
}

function isUrl(str: string): boolean {
  if (typeof str !== 'string') return false
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    const urlPattern =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?[=&%\[\]a-z\d_]+)?$/i
    return urlPattern.test(str.trim())
  }
}

function normalizeUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
}

function ValueCopyButton({
  keyName,
  value,
  dataType,
  alwaysVisible = false,
}: {
  keyName: string
  value: any
  dataType: DataType
  alwaysVisible?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const copyValue = async () => {
    try {
      let textToCopy: string
      if (dataType === 'OBJECT' || dataType === 'ARRAY') {
        textToCopy = `${keyName}: ${JSON.stringify(value, null, 2)}`
      } else {
        const valueStr =
          typeof value === 'string' ? `"${value}"` : String(value)
        textToCopy = `${keyName}: ${valueStr}`
      }
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <button
      type="button"
      onClick={copyValue}
      className={cn(
        'inline-flex justify-center items-center hover:bg-muted rounded w-5 h-5 transition-colors',
        alwaysVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      )}
      title={`Copy ${keyName}: ${dataType.toLowerCase()}`}
    >
      {copied ? (
        <Check className="size-3 text-green-600" />
      ) : (
        <Copy className="size-3 text-muted-foreground" />
      )}
    </button>
  )
}

function DataTypeTag({ type }: { type: DataType }) {
  const colorMap: Record<DataType, string> = {
    STRING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    NUMBER:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    BOOLEAN:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    NULL: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    OBJECT:
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    ARRAY: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    UNDEFINED: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
  }

  return (
    <span
      className={cn(
        'px-1.5 py-0.5 rounded font-medium text-[10px] uppercase',
        colorMap[type]
      )}
    >
      {type}
    </span>
  )
}

export default function JsonViewer({
  data,
  isMinimized: initialMinimized = false,
  showCopyButton = true,
  showMinimizeButton = false,
}: JsonViewerProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [isMinimized, setIsMinimized] = useState(initialMinimized)

  const toggleKey = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const copyToClipboard = async () => {
    try {
      const seen = new WeakSet()
      const safeStringify = (obj: any) => {
        return JSON.stringify(obj, (_key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular Reference]'
            }
            seen.add(value)
          }
          return value
        }, 2)
      }
      await navigator.clipboard.writeText(safeStringify(data))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const renderValue = (
    value: any,
    keyPath: string,
    isTopLevel = false,
    keyName?: string,
    seen: WeakSet<object> = new WeakSet()
  ): ReactNode => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return (
          <span className="text-yellow-600 dark:text-yellow-400 italic">
            [Circular Reference]
          </span>
        )
      }
      seen.add(value)
    }
    const dataType = getDataType(value)
    const formattedValue = formatValue(value, dataType)

    const isExpandable = dataType === 'OBJECT' || dataType === 'ARRAY'
    const shouldExpand =
      !isMinimized && (isTopLevel || (isExpandable && expandedKeys.has(keyPath)))

    if (isExpandable && !shouldExpand) {
      const handleToggle = () => {
        if (isTopLevel) {
          setIsMinimized(!isMinimized)
        } else {
          toggleKey(keyPath)
        }
      }
      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggle}
            className="inline-flex items-center gap-1 hover:bg-muted -ml-1 px-1 rounded"
          >
            <ChevronDown className="size-3 -rotate-90 transition-transform" />
            <span className="text-muted-foreground">{formattedValue}</span>
          </button>
          <DataTypeTag type={dataType} />
        </div>
      )
    }

    if (dataType === 'OBJECT') {
      const entries = Object.entries(value)
      const displayKey =
        keyName || keyPath.split('.').pop() || keyPath.split('[')[0] || 'object'
      const handleToggle = () => {
        if (isTopLevel) {
          setIsMinimized(!isMinimized)
        } else {
          toggleKey(keyPath)
        }
      }
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggle}
              className="inline-flex items-center gap-1 hover:bg-muted -ml-1 px-1 rounded"
            >
              <ChevronDown
                className={cn(
                  'size-3 transition-transform',
                  !shouldExpand && '-rotate-90'
                )}
              />
              <span className="text-muted-foreground">{formattedValue}</span>
            </button>
            <DataTypeTag type={dataType} />
            {!isTopLevel && showCopyButton && (
              <ValueCopyButton
                keyName={displayKey}
                value={value}
                dataType={dataType}
              />
            )}
          </div>
          {shouldExpand && (
            <div className="space-y-1 mt-1 ml-4 pl-3 border-muted border-l-2">
              {entries.map(([k, v]) => (
                <div
                  key={k}
                  className="group flex justify-between items-start gap-4 py-1"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{k}</span>
                      <span className="text-muted-foreground">:</span>
                      <div className="flex-1 min-w-0">
                        {renderValue(v, `${keyPath}.${k}`, false, k, seen)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (dataType === 'ARRAY') {
      const displayKey =
        keyName || keyPath.split('.').pop() || keyPath.split('[')[0] || 'array'
      const handleToggle = () => {
        if (isTopLevel) {
          setIsMinimized(!isMinimized)
        } else {
          toggleKey(keyPath)
        }
      }
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggle}
              className="inline-flex items-center gap-1 hover:bg-muted -ml-1 px-1 rounded"
            >
              <ChevronDown
                className={cn(
                  'size-3 transition-transform',
                  !shouldExpand && '-rotate-90'
                )}
              />
              <span className="text-muted-foreground">{formattedValue}</span>
            </button>
            <DataTypeTag type={dataType} />
            {!isTopLevel && showCopyButton && (
              <ValueCopyButton
                keyName={displayKey}
                value={value}
                dataType={dataType}
              />
            )}
          </div>
          {shouldExpand && (
            <div className="space-y-1 mt-1 ml-4 pl-3 border-muted border-l-2">
              {value.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="group flex justify-between items-start gap-4 py-1"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        {idx}:
                      </span>
                      <div className="flex-1 min-w-0">
                        {renderValue(
                          item,
                          `${keyPath}[${idx}]`,
                          false,
                          `${displayKey}[${idx}]`,
                          seen
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    const displayValue =
      dataType === 'STRING' ? (
        isUrl(formattedValue) ? (
          <a
            href={normalizeUrl(formattedValue)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation()
              window.open(
                normalizeUrl(formattedValue),
                '_blank',
                'noopener,noreferrer'
              )
            }}
            className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 underline cursor-pointer"
          >
            <span>"{formattedValue}"</span>
            <ExternalLink className="size-3" />
          </a>
        ) : (
          <span className="text-orange-600 dark:text-orange-400">
            "{formattedValue}"
          </span>
        )
      ) : dataType === 'NUMBER' ? (
        <span className="text-green-600 dark:text-green-400">
          {formattedValue}
        </span>
      ) : dataType === 'BOOLEAN' ? (
        <span className="text-blue-600 dark:text-blue-400">
          {formattedValue}
        </span>
      ) : dataType === 'NULL' ? (
        <span className="text-purple-600 dark:text-purple-400">
          {formattedValue}
        </span>
      ) : (
        <span className="text-muted-foreground">{formattedValue}</span>
      )

    if (!isTopLevel) {
      const displayKey =
        keyName || keyPath.split('.').pop() || keyPath.split('[')[0] || 'value'
      return (
        <div className="group flex items-center gap-2">
          <span className="flex-1 min-w-0">{displayValue}</span>
          <DataTypeTag type={dataType} />
          {showCopyButton && (
            <ValueCopyButton
              keyName={displayKey}
              value={value}
              dataType={dataType}
            />
          )}
        </div>
      )
    }

    return <span className="flex-1 min-w-0">{displayValue}</span>
  }

  const renderTopLevel = () => {
    if (typeof data !== 'object' || data === null) {
      return (
        <div className="group flex justify-between items-center gap-4 py-1">
          <div className="flex-1 min-w-0">
            {renderValue(data, 'root', true, undefined, new WeakSet())}
          </div>
        </div>
      )
    }

    if (Array.isArray(data)) {
      return renderValue(data, 'root', true, undefined, new WeakSet())
    }

    if (isMinimized) {
      const dataType = getDataType(data)
      const formattedValue = formatValue(data, dataType)
      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="inline-flex items-center gap-1 hover:bg-muted -ml-1 px-1 rounded"
          >
            <ChevronDown className="size-3 transition-transform" />
            <span className="text-muted-foreground">{formattedValue}</span>
          </button>
          <DataTypeTag type={dataType} />
        </div>
      )
    }

    const entries = Object.entries(data)
    return (
      <div className="space-y-0">
        {entries.map(([key, value]) => {
          return (
            <div
              key={key}
              className="group flex justify-between items-start gap-4 hover:bg-muted/30 px-2 py-2 border-muted/30 last:border-0 border-b rounded"
            >
              <div className="flex flex-1 items-start gap-2 min-w-0">
                <span className="font-medium text-foreground shrink-0">
                  {key}
                </span>
                <span className="text-muted-foreground shrink-0">:</span>
                <div className="flex flex-1 items-center gap-2 min-w-0">
                  {renderValue(value, `root.${key}`, false, key, new WeakSet())}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center gap-2">
        {!isMinimized && showMinimizeButton && (
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="inline-flex items-center gap-1 hover:bg-muted px-2 py-1 border rounded text-xs transition-colors"
            title={isMinimized ? 'Expand JSON' : 'Minimize JSON'}
          >
            <>
              <ChevronUp className="size-3" />
              Minimize
            </>
          </button>
        )}
        {showCopyButton && (
          <button
            type="button"
            onClick={copyToClipboard}
            className="inline-flex items-center gap-1 hover:bg-muted px-2 py-1 border rounded text-xs transition-colors"
            title="Copy entire JSON to clipboard"
          >
            {copied ? (
              <>
                <Check className="size-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3" />
                Copy JSON
              </>
            )}
          </button>
        )}
      </div>
      <div className="bg-background p-4 border rounded-md max-h-96 overflow-auto text-sm">
        {renderTopLevel()}
      </div>
    </div>
  )
}
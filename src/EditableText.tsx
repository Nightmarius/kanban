import { useRef, useState, useEffect } from 'react'

interface EditableTextProps {
  value: string
  onSave: (value: string) => void
  onCancel?: () => void
  className?: string
}

export function EditableText({ value, onSave, onCancel, className = '' }: EditableTextProps) {
  const [text, setText] = useState(value)
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setText(value)
  }, [value])

  return (
    <textarea
      ref={ref as React.RefObject<HTMLTextAreaElement>}
      value={text}
      className={`w-full field-sizing-content resize-none overflow-hidden outline-none rounded text-text ${className}`}
      onBlur={() => {
        if (text !== value) onSave(text)
        else onCancel?.()
      }}
      onChange={(e) => setText(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          onSave(e.currentTarget.value)
        }
        if (e.key === 'Escape') {
          setText(value)
          onCancel?.()
        }
      }}
    />
  )
}

import { useRef, useState, useEffect } from 'react'

interface EditableTextProps {
  value: string
  onSave: (value: string) => void
  onCancel?: () => void
  className?: string
  inputType?: 'text' | 'textarea'
}

export function EditableText({ 
  value, 
  onSave, 
  onCancel, 
  className = '', 
  inputType = 'text' 
}: EditableTextProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing) {
      ref.current?.focus()
      
      if (inputType === 'textarea' && ref.current instanceof HTMLTextAreaElement) {
        const el = ref.current
        el.style.height = 'auto'
        el.style.height = el.scrollHeight + 'px'
        
        function autoResize() {
          el.style.height = 'auto'
          el.style.height = el.scrollHeight + 'px'
        }
        
        el.addEventListener('input', autoResize)
        return () => el.removeEventListener('input', autoResize)
      }
    }
  }, [editing, inputType])

  if (!editing) {
    return (
      <div
        className={`cursor-text rounded px-1 py-0.5 hover:brightness-125 active:bg-accent/20 ${className}`}
        onClick={() => setEditing(true)}
      >
        {value}
      </div>
    )
  }

  if (inputType === 'textarea') {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        className={`w-full resize-none overflow-hidden outline-none bg-white/10 rounded px-2 py-1 ${className}`}
        onBlur={() => {
          setEditing(false)
          if (draft !== value) onSave(draft)
          else onCancel?.()
        }}
        onChange={(e) => setDraft(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            setEditing(false)
            onSave(e.currentTarget.value)
          }
          if (e.key === 'Escape') {
            setDraft(value)
            onCancel?.()
          }
        }}
      />
    )
  }

  return (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      value={draft}
      className={`w-full outline-none bg-white/10 rounded px-2 py-1 ${className}`}
      onBlur={() => {
        setEditing(false)
        if (draft !== value) onSave(draft)
        else onCancel?.()
      }}
      onChange={(e) => setDraft(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          setEditing(false)
          onSave(e.currentTarget.value)
        }
        if (e.key === 'Escape') {
          setDraft(value)
          onCancel?.()
        }
      }}
    />
  )
}

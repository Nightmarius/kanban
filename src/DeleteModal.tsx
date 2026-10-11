import { useRef, useState, useEffect } from 'react'

interface NewBoardModalProps {
  open: boolean
  onClose: () => void
  onCreate: (name: string) => void
}

export function DeleteModal({ open, onClose, onCreate }: NewBoardModalProps) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  function submit() {
    if (name.trim()) onCreate(name.trim())
  }

  if (!open) return null

  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-100' onClick={onClose}>
      <div className='bg-card rounded-lg p-6 shadow-[0_4px_12px_rgba(0,0,0,0.3)] min-w-[360px] text-text' onClick={(e) => e.stopPropagation()}>
        <h2>Create New Board</h2>
        <input
          ref={inputRef}
          value={name}
          placeholder='Board name...'
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
            if (e.key === 'Escape') onClose()
          }}
        />
        <div className='flex gap-2 mt-4'>
          <button className='px-5 py-2 rounded border border-white/10 bg-transparent text-text cursor-pointer text-sm hover:bg-bg transition-colors' onClick={onClose}>
            Cancel
          </button>
          <button className='px-5 py-2 rounded border-none bg-accent text-white cursor-pointer text-sm font-medium hover:bg-hover transition-colors' onClick={submit}>
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

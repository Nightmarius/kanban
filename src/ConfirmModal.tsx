import { useState, useEffect } from 'react'
import { Button } from './Button'

interface ConfirmConfig {
  title: string
  message: string
  confirmLabel?: string
  onConfirm(): void
  onClose(): void
}

let state: ConfirmConfig | null = null
const listeners = new Set<(s: ConfirmConfig | null) => void>()

export function showConfirm(config: Omit<ConfirmConfig, 'onConfirm' | 'onClose'>): Promise<boolean> {
  return new Promise((resolve) => {
    state = {
      ...config,
      onConfirm: () => {
        resolve(true)
        setState(null)
      },
      onClose: () => {
        resolve(false)
        setState(null)
      },
    }
    notifyAll()
  })
}

export function subscribe(fn: (s: ConfirmConfig | null) => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setState(s: ConfirmConfig | null): void {
  state = s
  listeners.forEach((fn) => fn(s))
}

function notifyAll() {
  listeners.forEach((fn) => fn(state))
}

function useGlobalConfirm(): ConfirmConfig | null {
  const [s, setS] = useState<ConfirmConfig | null>(state)
  useEffect(() => {
    const sub = (c: ConfirmConfig | null) => setS(c)
    subscribe(sub)
    return () => {}
  }, [])
  return s
}

export function ConfirmModal() {
  const config = useGlobalConfirm()
  if (!config) return null

  return (
    <div className='fixed inset-0 bg-bg/50 flex items-center justify-center z-4' onClick={config.onClose}>
      <div className='bg-card rounded-lg shadow-lg shadow-bg min-w-72 w-100 ' onClick={(e) => e.stopPropagation()}>
        <h2 className='p-4 pb-2 border-b-2 border-item text-xl font-semibold'>{config.title}</h2>
        <div className='p-4 flex flex-col gap-2'>
          <p>{config.message}</p>
          <div className='mt-2 flex justify-between'>
            <Button text='Cancel' type='Outline' onClick={config.onClose} />
            <Button text={config.confirmLabel ?? 'OK'} onClick={config.onConfirm} />
          </div>
        </div>
      </div>
    </div>
  )
}

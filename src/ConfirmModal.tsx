import { useState, useEffect } from 'react'

interface ConfirmConfig {
  title: string
  message?: string
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

function ConfirmModal() {
  const config = useGlobalConfirm()
  if (!config) return null

  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-100' onClick={config.onClose}>
      <div className='bg-card rounded-lg p-6 shadow-[0_4px_12px_rgba(0,0,0,0.3)] min-w-90 w-3/4 max-w-full text-text' onClick={(e) => e.stopPropagation()}>
        <h2 className='m-0 mb-4 text-xl'>{config.title}</h2>
        {config.message && <p className='m-0 mb-6 opacity-70'>{config.message}</p>}
        <div className='flex gap-2 justify-between mt-4'>
          <button className='px-5 py-2 rounded border-2 bg-transparent text-text cursor-pointer text-sm hover:bg-bg transition-colors' onClick={config.onClose}>
            Cancel
          </button>
          <button className={'px-5 py-2 rounded border-none cursor-pointer text-sm font-medium transition-colors bg-accent hover:bg-hover'} onClick={config.onConfirm}>
            {config.confirmLabel ?? 'OK'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ConfirmModal />
    </>
  )
}

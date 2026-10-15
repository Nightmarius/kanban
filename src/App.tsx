import { useState, useRef, useEffect } from 'react'
import * as store from './store'
import type { BoardType, KanbanData } from './types'
import { Board } from './Board'
import { ConfirmProvider, showConfirm } from './ConfirmModal'
import { Button } from './Button'

declare global {
  interface Window {
    electronAPI?: {
      openFileDialog: () => Promise<string | null>
      readFile: (path: string) => Promise<string>
      writeFile: (path: string, content: string) => Promise<boolean>
      onFileOpened: (callback: (data: { path: string }) => void) => void
    }
  }
}

export function App() {
  return (
    <ConfirmProvider>
      <AppContent />
    </ConfirmProvider>
  )
}

function AppContent() {
  const [data, setData] = useState<KanbanData>(() => store.getState())
  const [activeBoardIndex, setActiveBoardIndex] = useState<number>(0)
  const importInputRef = useRef<HTMLInputElement>(null)
  const isElectron = typeof window !== 'undefined' && window.electronAPI

  useEffect(() => {
    if (isElectron) {
      window.electronAPI.onFileOpened(async (fileData) => {
        try {
          const content = await window.electronAPI.readFile(fileData.path)
          handleImport(fileData.path, content)
        } catch (e) {
          console.error(e)
          alert('Failed to read file.')
        }
      })
    }
  }, [isElectron])

  useEffect(() => store.subscribe((s) => setData(s)), [])

  const activeBoard = data.boards[activeBoardIndex] ?? null
  
  // Autosave debounce: throttle writes to same file to max once per second
  const autosaveState = useRef<{lastSaveTime: number; lastBoardContent: string}>({
    lastSaveTime: 0,
    lastBoardContent: ''
  })

  useEffect(() => {
    if (!isElectron || !activeBoard?.savedPath) return
    
    // Format current content
    const content = formatBoardAsMd(activeBoard)
    
    throttleAutosave(activeBoard.savedPath, content, autosaveState.current)
  })

  async function throttleAutosave(path: string, content: string, state: typeof autosaveState.current) {
    // If this exact content was already saved recently, skip
    if (state.lastBoardContent === content && Date.now() - state.lastSaveTime < 500) {
      return
    }
    
    try {
      const now = Date.now()
      console.log('[autosave]', now, '- writing to:', path)
      
      // Save with short retry in case of concurrent writes
      await window.electronAPI.writeFile(path, content)
      
      state.lastSaveTime = now
      state.lastBoardContent = content
      
      console.log('[autosave] success')
    } catch (e) {
      console.error('[autosave] failed for', path + ':', e)
    }
  }

  function handleImport(name: string, text: string) {
    try {
      const board = parseBoardFromMd(text)
      const pathParts = name.split(isElectron ? /[\\/]/ : '/')
      board.name = pathParts[pathParts.length - 1].replace(/\.md$/i, '')
      
      // Track the file path in Electron for autosave
      if (isElectron && window.electronAPI) {
        board.savedPath = name
      }
      
      setActiveBoardIndex(data.boards.length)
      store.addBoard(board)
    } catch (e) {
      console.error(e)
      alert('Invalid kanban .md file.')
    }
  }

  function formatBoardAsMd(board: BoardType): string {
    return [
      ...board.columns
        .map((col) => {
          const lines: string[] = [`# ${col.name}`, '']
          for (let i = 0; i < col.items.length; i++) {
            lines.push(`- [${i < col.done ? 'x' : ' '}] ${col.items[i]}`)
          }
          lines.push('')
          return lines
        })
        .flat(),
    ].join('\n')
  }

  function saveAsFile(content: string, filename?: string) {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || 'board.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  function parseBoardFromMd(text: string): BoardType {
    const lines = text.split('\n')
    let board: BoardType | null = { name: 'None', columns: [] }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (board && line.startsWith('# ')) {
        const name = line.slice(2).trim()
        board.columns.push({ name, done: 0, items: [] })
      } else if (board && line.startsWith('- [')) {
        if (line.startsWith('- [x')) board.columns[board.columns.length - 1].done++
        const text = line.slice(5).trim()
        board.columns[board.columns.length - 1].items.push(text)
      }
    }
    return board
  }

  function handleSave() {
    saveAsFile(formatBoardAsMd(activeBoard!), activeBoard?.name)
  }

  async function deleteBoard(index: number) {
    const confirmed = await showConfirm({
      title: 'Delete Board',
      message: `Are you sure you want to delete "${data.boards[index].name}" with all contained columns and items? This action can not be undone.`,
      confirmLabel: 'Delete',
    })
    if (!confirmed) return
    const nextIndex = store.deleteBoard(index)
    if (nextIndex !== null) setActiveBoardIndex(nextIndex)
  }

  async function handleNewImportFile() {
    if (isElectron && window.electronAPI) {
      const filePath = await window.electronAPI.openFileDialog()
      if (filePath) {
        try {
          const content = await window.electronAPI.readFile(filePath)
          handleImport(filePath, content)
        } catch (e) {
          console.error(e)
          alert('Failed to read file.')
        }
      }
    } else {
      importInputRef.current?.click()
    }
  }

  return (
    <div className='relative bg-bg main-content'>
      {activeBoard ? (
        <Board boards={data.boards} boardIndex={activeBoardIndex} onSave={handleSave} onImport={handleNewImportFile} onActivate={setActiveBoardIndex} onDelete={deleteBoard} />
      ) : (
        <div className='flex flex-col items-center justify-center h-[60vh] gap-4'>
          <h2 className='text-text m-0 text-3 font-bold'>No boards yet</h2>
          <div className='flex gap-2'>
            <Button text='Import .md' type='Outline' onClick={handleNewImportFile} />
            <Button
              text='Add New Board'
              onClick={() => {
                setActiveBoardIndex(data.boards.length)
                store.addBoard()
              }}
            />
          </div>
        </div>
      )}
      <input
        ref={importInputRef}
        type='file'
        accept='.md'
        className='hidden'
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = () => handleImport(file.name, reader.result as string)
          reader.readAsText(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

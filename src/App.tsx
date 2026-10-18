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
  const [data, setData] = useState<KanbanData>(() => store.getState())
  const [activeBoardIndex, setActiveBoardIndex] = useState<number>(0)
  const importInputRef = useRef<HTMLInputElement>(null)
  const isElectron = typeof window !== 'undefined' && window.electronAPI
  const initialized = useRef(false)

  useEffect(() => store.subscribe((s) => setData(s)), [])

  const activeBoard = data.boards[activeBoardIndex] ?? null

  useEffect(() => {
    if (isElectron && !initialized.current && window.electronAPI) {
      initialized.current = true
      for (let i = 0; i < data.boards.length; i++) {
        const path = data.boards[i].savedPath
        if (path) {
          try {
            window.electronAPI?.readFile(path).then((content) => {
              const board = parseBoardFromMd(content)
              store.updateColumns(board.columns, i)
            })
          } catch (e) {
            console.error(`Failed to reload board from ${path}:`, e)
          }
        }
      }
    }
  }, [isElectron])

  useEffect(() => {
    if (!isElectron || !activeBoard?.savedPath || !initialized.current) return
    const content = formatBoardAsMd(activeBoard)
    window.electronAPI?.writeFile(activeBoard.savedPath, content)
  }, [isElectron, activeBoard])

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
    const shouldConfirm = data.boards[index].columns.length > 0 || !data.boards[index].savedPath
    if (shouldConfirm) {
      const confirmed = await showConfirm({
        title: 'Delete Board',
        message: `Are you sure you want to delete "${data.boards[index].name}" with all contained columns and items? This action can not be undone.`,
        confirmLabel: 'Delete',
      })
      if (!confirmed) return
    }
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
    <ConfirmProvider>
      <div className='bg-bg'>
        {activeBoard ? (
          <Board boards={data.boards} boardIndex={activeBoardIndex} onSave={handleSave} onImport={handleNewImportFile} onActivate={setActiveBoardIndex} onDelete={deleteBoard} />
        ) : (
          <div className='flex flex-col items-center justify-center h-[60vh] gap-6'>
            <h2 className='text-text text-xl font-bold'>No boards yet</h2>
            <div className='flex gap-3'>
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
    </ConfirmProvider>
  )
}

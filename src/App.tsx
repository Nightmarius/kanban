import { useState, useRef, useEffect } from 'react'
import * as store from './store'
import type { BoardType, KanbanData } from './types'
import { Board } from './Board'
import { ConfirmProvider, showConfirm } from './ConfirmModal'
import { Button } from './Button'

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

  useEffect(() => store.subscribe((s) => setData(s)), [])

  const activeBoard = data.boards[activeBoardIndex] ?? null

  function handleImport(name: string, text: string) {
    try {
      const board = parseBoardFromMd(text)
      board.name = name.slice(0, -3)
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

  function handleNewImportFile() {
    importInputRef.current?.click()
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

import { useState } from 'react'
import * as store from './store'
import type { BoardType } from './types'
import { DeleteButton } from './Button'
import { Button } from './Button'

interface BoardPickerProps {
  boards: BoardType[]
  activeBoardIndex: number | null
  onActivate: (index: number) => void
  onImport: () => void
  onDelete: (index: number) => void
}

export function BoardPicker({ boards, activeBoardIndex, onActivate, onImport, onDelete }: BoardPickerProps) {
  const [open, setOpen] = useState(false)
  function onNewBoard() {
    onActivate(boards.length)
    store.addBoard()
    setOpen(false)
  }

  return (
    <>
      <Button text='☰' onClick={() => setOpen((v) => !v)} />
      {open && (
        <>
          <div className='fixed inset-0 z-2 bg-bg/50' onClick={() => setOpen(false)} />
          <nav className='fixed top-3 left-3 z-3 p-2 flex flex-col gap-3 w-56 bg-card rounded shadow-lg shadow-bg' onClick={(e) => e.stopPropagation()}>
            {boards.map((board, index) => (
              <div
                key={index}
                data-active={index === activeBoardIndex}
                className={`flex justify-between p-2 gap-3 rounded ${index === activeBoardIndex ? 'bg-accent' : 'hover:bg-item cursor-pointer'}`}
                onClick={() => {
                  if (index === activeBoardIndex) return
                  onActivate(index)
                  setOpen(false)
                }}
              >
                <button className={`rounded whitespace-nowrap overflow-hidden ${index === activeBoardIndex ? 'font-semibold' : 'cursor-pointer'}`}>{board.name}</button>
                {boards.length > 1 && (
                  <DeleteButton
                    onClick={() => {
                      onDelete(index)
                      setOpen(false)
                    }}
                  />
                )}
              </div>
            ))}
            <Button
              text='Import .md'
              type='Outline'
              onClick={() => {
                onImport()
                setOpen(false)
              }}
            />
            <Button text='Add New Board' type='Outline' onClick={onNewBoard} />
          </nav>
        </>
      )}
    </>
  )
}

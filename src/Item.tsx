import * as store from './store'
import { EditableText } from './EditableText'

interface ItemProps {
  item: string
  index: number
  colId: string
  boardId: string
}

export function Item({ item, index, colId, boardId }: ItemProps) {
  return (
    <div
      className='cursor-grab rounded-sm bg-item p-3 text-sm leading-relaxed flex items-start gap-2 select-none drop-target'
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify({ colId, index }))}
    >
      <EditableText
        value={item}
        onSave={(text) => {
          console.log(text)
          if (text.trim()) store.updateItem(boardId, colId, index, text)
        }}
        className='text-sm word-break-break-word'
      />
      <div className='flex gap-x-0.5'>
        <button className='text-text cursor-pointer size-6' onClick={() => store.deleteItem(boardId, colId, index)} title='Delete'>
          ✕
        </button>
      </div>
    </div>
  )
}

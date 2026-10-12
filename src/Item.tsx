import * as store from './store'
import { EditableText } from './EditableText'
import { DeleteButton } from './DeleteButton'

interface ItemProps {
  item: string
  index: number
  colId: string
  boardId: string
  done: boolean
}

export function Item({ item, index, colId, boardId, done }: ItemProps) {
  return (
    <div
      className={'rounded-sm p-3 text-sm leading-relaxed flex items-start gap-2 select-none drop-target ' + (done ? 'bg-accent' : 'bg-item cursor-grab')}
      draggable={!done}
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
        {!done && colId == 0 && (
          <button className='text-text cursor-pointer size-6' onClick={() => store.finishItem(boardId, colId, index)} title='Done'>
            ✓
          </button>
        )}
        <DeleteButton onClick={() => store.deleteItem(boardId, colId, index)} />
      </div>
    </div>
  )
}

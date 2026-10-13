import * as store from './store'
import { EditableText } from './EditableText'
import { DeleteButton } from './DeleteButton'

interface ItemProps {
  item: string
  itemIndex: number
  colIndex: number
  boardIndex: number
  done: boolean
}

export function Item({ item, itemIndex, colIndex, boardIndex, done }: ItemProps) {
  return (
    <div
      className={'rounded-sm px-3 py-1 flex items-center gap-2 drop-target ' + (done ? 'bg-accent' : 'bg-item cursor-grab')}
      draggable={!done}
      onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify({ colIndex, itemIndex }))}
    >
      <EditableText
        value={item}
        onSave={(text) => {
          if (text.trim()) store.updateItem(boardIndex, colIndex, itemIndex, text)
        }}
        className='text-sm word-break-break-word'
      />
      {!done && colIndex == 0 && (
        <button className='text-text cursor-pointer size-7 hover:text-accent' onClick={() => store.finishItem(boardIndex, colIndex, itemIndex)} title='Done'>
          ✓
        </button>
      )}
      <DeleteButton onClick={() => store.deleteItem(boardIndex, colIndex, itemIndex)} />
    </div>
  )
}

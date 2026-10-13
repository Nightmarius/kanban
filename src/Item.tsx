import * as store from './store'
import { EditableText } from './EditableText'
import { Button, DeleteButton } from './Button'

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
      className={'rounded-sm px-3 py-2 flex items-center gap-2 drop-target ' + (done ? 'bg-accent' : 'bg-item cursor-grab')}
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
      {!done && colIndex === 0 && <Button text='✓' type='Icon' onClick={() => store.finishItem(boardIndex, colIndex, itemIndex)} />}
      <DeleteButton onClick={() => store.deleteItem(boardIndex, colIndex, itemIndex)} />
    </div>
  )
}

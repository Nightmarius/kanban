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
      className={'rounded px-2 py-1 flex items-center gap-1 drop-target ' + (done ? 'bg-accent' : 'bg-item cursor-grab')}
      draggable={!done}
      onDragStart={(e) => e.dataTransfer.setData('text/json', JSON.stringify({ colIndex, itemIndex }))}
    >
      <EditableText
        value={item}
        onSave={(text) => {
          if (text.trim()) store.updateItem(boardIndex, colIndex, itemIndex, text)
        }}
        className='text-sm wrap-break-word'
      />
      {!done && colIndex === 0 && <Button text='✓' type='Icon' onClick={() => store.finishItem(boardIndex, colIndex, itemIndex)} />}
      <DeleteButton onClick={() => store.deleteItem(boardIndex, colIndex, itemIndex)} />
    </div>
  )
}

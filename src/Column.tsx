import { useRef, useState } from 'react';
import * as store from './store';
import type { Column as ColumnType } from './types';
import { Card } from './Card';
import { NewItemForm } from './NewItemForm';

interface RenameTarget {
  colId: string;
  name: string;
}

interface ColumnProps {
  column: ColumnType;
  colIdx: number;
  boardId: string;
  totalColumns: number;
  renamingColumn: RenameTarget | null;
  setRenamingColumn: (r: RenameTarget | null) => void;
  draggingCard: { boardId: string; colId: string; itemIdx: number } | null;
  dragTargetIdx: number | null;
  onDrop: (colIdx: number, info: { colId: string; itemIdx: number }) => void;
  onDragOver: (colIdx: number) => void;
}

export function Column({ column, colIdx, boardId, totalColumns, renamingColumn, setRenamingColumn, draggingCard, dragTargetIdx, onDrop, onDragOver }: ColumnProps) {
  const [hovered, setHovered] = useState(false);

  const isDragTarget = dragTargetIdx === colIdx;

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setHovered(false);
    let info: { colId: string; itemIdx: number } | undefined;
    try {
      info = JSON.parse(e.dataTransfer.getData('text/plain'));
    } catch {
      return;
    }
    if (!info) return;
    onDrop(colIdx, info);
  }

  function handleDragEnter() {
    if (draggingCard) {
      setHovered(true);
      onDragOver(colIdx);
    }
  }

  return (
    <div
      className={`column ${isDragTarget ? 'drag-over' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={(e) => {
        e.preventDefault();
        handleDragEnter();
      }}
      onDrop={handleDrop}
      onDragLeave={() => setHovered(false)}
    >
      <ColumnHeader column={column} boardId={boardId} totalColumns={totalColumns} renamingColumn={renamingColumn} setRenamingColumn={setRenamingColumn} />

      <div className='items'>
        {column.items.map((item, itemIdx) => (
          <Card
            key={item.id}
            card={item}
            itemIdx={itemIdx}
            boardId={boardId}
            colId={column.id}
            dragging={draggingCard !== null && draggingCard.colId === column.id && draggingCard.itemIdx === itemIdx}
          />
        ))}

        <NewItemForm boardId={boardId} colId={column.id} />
      </div>
    </div>
  );
}

/* ── Column Header ── */

function ColumnHeader({
  column,
  boardId,
  totalColumns,
  renamingColumn,
  setRenamingColumn,
}: {
  column: ColumnType;
  boardId: string;
  totalColumns: number;
  renamingColumn: RenameTarget | null;
  setRenamingColumn: (r: RenameTarget | null) => void;
}) {
  return (
    <div className='column-header'>
      {renamingColumn?.colId === column.id ? (
        <EditableName
          value={renamingColumn.name}
          onSave={(name) => {
            if (name.trim()) store.renameColumn(boardId, column.id, name.trim());
            setRenamingColumn(null);
          }}
          onCancel={() => setRenamingColumn(null)}
        />
      ) : (
        <span className='column-name' onClick={() => setRenamingColumn({ colId: column.id, name: column.name })}>
          {column.name}
        </span>
      )}

      <DeleteColumnButton columnName={column.name} colId={column.id} boardId={boardId} totalColumns={totalColumns} itemCount={column.items.length} />
    </div>
  );
}

/* ── Inline editable name ── */

function EditableName({ value, onSave, onCancel }: { value: string; onSave: (name: string) => void; onCancel: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);

  return (
    <input
      ref={inputRef}
      className='column-name-input'
      defaultValue={value}
      autoFocus
      onBlur={() => onSave(draft)}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSave(draft);
        if (e.key === 'Escape') onCancel();
      }}
    />
  );
}

function DeleteColumnButton({ columnName, colId, boardId, totalColumns, itemCount }: { columnName: string; colId: string; boardId: string; totalColumns: number; itemCount: number }) {
  function handleDelete() {
    if (totalColumns > 1) {
      const shouldConfirm = itemCount > 0;
      let msg = `Delete "${columnName}"?`;
      if (shouldConfirm) {
        msg = `Delete "${columnName}" (${itemCount} item${itemCount === 1 ? '' : 's'})?`;
        confirm(msg) && store.deleteColumn(boardId, colId);
      } else {
        store.deleteColumn(boardId, colId);
      }
    } else {
      store.addColumnAfter(boardId, colId);
    }
  }
  return (
    <button className='btn-icon danger' onClick={handleDelete} title={totalColumns > 1 ? 'Delete column' : 'Insert before'}>
      {totalColumns > 1 ? '✕' : '+'}
    </button>
  );
}

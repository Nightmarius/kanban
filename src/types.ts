export interface ColumnType {
  name: string
  done: number
  items: string[]
}

export interface BoardType {
  name: string
  columns: ColumnType[]
  savedPath?: string
}

export interface KanbanData {
  boards: BoardType[]
}

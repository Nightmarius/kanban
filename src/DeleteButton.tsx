import { MouseEventHandler } from 'react'

export function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button className='w-7 h-7 flex items-center justify-center bg-transparent text-text cursor-pointer hover:text-accent' onClick={onClick} title='Delete'>
      ✕
    </button>
  )
}

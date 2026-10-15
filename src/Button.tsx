export function Button({ text, onClick, type = 'Default' }: { text: string; onClick: () => void; type?: 'Default' | 'Outline' | 'Icon' }) {
  let classes = 'h-12 px-6 py-2 bg-accent hover:bg-card'
  if (type === 'Outline') classes = 'h-12 px-6 py-2 border-2 border-accent hover:bg-accent'
  if (type === 'Icon') classes = 'size-6 hover:text-accent'

  return (
    <button className={'rounded text-text text-nowrap cursor-pointer ' + classes} onClick={onClick}>
      {text}
    </button>
  )
}

export function DeleteButton({ onClick }: { onClick: () => void }) {
  return <Button text='✕' type='Icon' onClick={onClick} />
}

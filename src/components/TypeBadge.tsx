import { TYPE_DOT } from '@/lib/types'
import { cn } from '@/lib/utils'

export function TypeBadge({ type, size = 'sm' }: { type: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-line bg-chip px-2.5 py-1 font-semibold uppercase tracking-widest text-ink',
        size === 'sm' ? 'text-[10px]' : 'text-xs px-3 py-1.5',
      )}
    >
      <span className={cn('size-1.5 rounded-full', TYPE_DOT[type] ?? 'bg-ink/40')} />
      {type}
    </span>
  )
}

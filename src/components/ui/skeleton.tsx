import { cn } from '@/lib/utils'

/**
 * Canonical shadcn Skeleton — placeholder shown while content loads.
 * Usage: `<Skeleton className="h-[20px] w-[100px] rounded-full" />`
 * See https://ui.shadcn.com/docs/components/base/skeleton
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-chip', className)}
      {...props}
    />
  )
}

export { Skeleton }

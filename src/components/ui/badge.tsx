import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-colors',
  {
      variants: {
        variant: {
          default: 'border-line bg-chip text-ink',
          outline: 'border-line text-muted',
          signal: 'border-[#FF3355]/40 bg-[#FF3355]/15 text-rose',
          volt: 'border-[#FFD02F]/40 bg-[#FFD02F]/12 text-gold',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

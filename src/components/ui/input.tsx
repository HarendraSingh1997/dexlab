import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-xl border border-line bg-chip px-4 py-2 text-sm text-ink placeholder:text-muted/70 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3355]/70 focus-visible:border-[#FF3355]/50 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }

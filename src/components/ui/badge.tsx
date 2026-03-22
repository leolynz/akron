import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-[var(--radius-full)] px-2.5 py-0.5 text-[length:var(--typography-size-xs)] font-[var(--typography-weight-medium)] transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]',
        secondary: 'bg-[var(--color-muted)] text-[var(--color-foreground)]',
        accent: 'bg-[var(--color-accent)] text-[var(--color-accent-foreground)]',
        destructive: 'bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)]',
        warning: 'bg-[var(--color-warning)] text-[var(--color-warning-foreground)]',
        outline: 'border border-[var(--color-border)] text-[var(--color-foreground)]',
        high: 'bg-[var(--color-severity-high)] text-white',
        medium: 'bg-[var(--color-severity-medium)] text-white',
        low: 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

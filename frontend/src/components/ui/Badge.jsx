import { cn } from '@/utils/cn'

const variants = {
  neutral: 'border-line bg-white/[0.03] text-muted',
  cyan: 'border-cyan/25 bg-cyan/[0.09] text-cyan-300',
  petrol: 'border-petrol/25 bg-petrol/[0.09] text-petrol-400',
  success: 'border-success/25 bg-success/[0.09] text-success',
  warning: 'border-warning/25 bg-warning/[0.09] text-warning',
  critical: 'border-critical/25 bg-critical/[0.09] text-critical',
  outline: 'border-line bg-transparent text-ink',
}

const sizes = {
  xs: 'px-1.5 py-0.5 text-[10px] gap-1.5',
  sm: 'px-2 py-0.5 text-[11px] gap-1.5',
  md: 'px-2.5 py-1 text-xs gap-1.5',
}

export function Badge({ children, variant = 'neutral', size = 'sm', dot = false, pulse = false, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-md border font-sans font-medium leading-4',
        variants[variant] ?? variants.neutral,
        sizes[size] ?? sizes.sm,
        className,
      )}
    >
      {dot ? (
        <span className="relative flex h-1.5 w-1.5">
          {pulse ? (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          ) : null}
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      ) : null}
      {children}
    </span>
  )
}

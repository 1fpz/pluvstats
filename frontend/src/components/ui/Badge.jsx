import { cn } from '@/utils/cn'

const variants = {
  neutral: 'border-line bg-navy-800/60 text-muted',
  cyan: 'border-cyan/30 bg-cyan/10 text-cyan-300',
  petrol: 'border-petrol/30 bg-petrol/10 text-petrol-400',
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  critical: 'border-critical/30 bg-critical/10 text-critical',
  outline: 'border-line bg-transparent text-ink',
}

const sizes = {
  xs: 'px-2 py-0.5 text-[10px] gap-1.5',
  sm: 'px-2.5 py-1 text-[11px] gap-1.5',
  md: 'px-3 py-1.5 text-xs gap-2',
}

export function Badge({ children, variant = 'neutral', size = 'sm', dot = false, pulse = false, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border font-mono font-medium uppercase tracking-[0.08em]',
        variants[variant] ?? variants.neutral,
        sizes[size] ?? sizes.sm,
        className,
      )}
    >
      {dot ? (
        <span className="relative flex h-1.5 w-1.5">
          {pulse ? (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-70" />
          ) : null}
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      ) : null}
      {children}
    </span>
  )
}

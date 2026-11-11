import { cn } from '@/utils/cn'

export function SegmentedControl({ options, value, onChange, ariaLabel, size = 'md', className }) {
  return (
    <div
      className={cn('inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-line bg-navy-950 p-0.5', className)}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const active = option.value === value
        const Icon = option.icon
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[6px] font-medium transition',
              size === 'sm' ? 'h-7 px-2.5 text-[11px]' : 'h-8 px-3 text-xs',
              active
                ? 'bg-white/[0.08] text-ink'
                : 'text-muted hover:bg-white/[0.04] hover:text-ink',
            )}
          >
            {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

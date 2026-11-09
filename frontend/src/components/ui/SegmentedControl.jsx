import { cn } from '@/utils/cn'

export function SegmentedControl({ options, value, onChange, ariaLabel, size = 'md', className }) {
  return (
    <div
      className={cn('inline-flex flex-wrap items-center gap-1 rounded-xl border border-line bg-navy-950/50 p-1', className)}
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
              'inline-flex items-center gap-1.5 rounded-lg font-medium transition',
              size === 'sm' ? 'h-7 px-2.5 text-[11px]' : 'h-8 px-3 text-xs',
              active
                ? 'bg-cyan/15 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(0,166,204,0.25)]'
                : 'text-muted hover:bg-navy-800/70 hover:text-ink',
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

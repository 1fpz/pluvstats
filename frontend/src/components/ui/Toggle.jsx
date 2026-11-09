import { cn } from '@/utils/cn'

export function Toggle({ checked, onChange, label, description, disabled = false, id }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-xs font-medium text-ink">
          {label}
        </label>
        {description ? <p className="mt-1 text-[11px] leading-relaxed text-muted">{description}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition',
          checked ? 'border-cyan/50 bg-cyan/30' : 'border-line bg-navy-700',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 rounded-full shadow transition',
            checked ? 'translate-x-6 bg-cyan' : 'translate-x-1 bg-muted',
          )}
        />
      </button>
    </div>
  )
}

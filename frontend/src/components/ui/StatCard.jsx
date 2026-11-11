import { cn } from '@/utils/cn'

const tones = {
  cyan: 'bg-cyan',
  petrol: 'bg-petrol-400',
  warning: 'bg-warning',
  critical: 'bg-critical',
  neutral: 'bg-muted/70',
  success: 'bg-success',
}

export function StatCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  tone = 'cyan',
  trend,
  className,
  onClick,
  footer,
}) {
  return (
    <div
      className={cn(
        'panel group relative overflow-hidden p-4 sm:p-5',
        onClick && 'cursor-pointer transition hover:border-white/[0.14] hover:bg-navy-850',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', tones[tone] ?? tones.cyan)} aria-hidden="true" />
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-muted">{label}</p>
        </div>
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-muted/60" aria-hidden="true" /> : null}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[28px] font-semibold tabular-nums leading-none tracking-[-0.03em] text-mist">
          {value}
        </span>
        {unit ? <span className="text-[11px] font-medium text-muted">{unit}</span> : null}
        {trend ? (
          <span
            className={cn(
              'ml-auto text-[10px] font-medium',
              trend === 'up' ? 'text-warning' : trend === 'down' ? 'text-success' : 'text-muted',
            )}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
          </span>
        ) : null}
      </div>

      {hint ? <p className="mt-2 truncate text-[11.5px] leading-relaxed text-muted">{hint}</p> : null}
      {footer}
    </div>
  )
}

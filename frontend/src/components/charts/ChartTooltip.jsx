import { cn } from '@/utils/cn'

export function ChartTooltip({ active, payload, label, labelFormatter, valueFormatter, hideLabel = false }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-line bg-navy-950/95 px-3 py-2 shadow-float backdrop-blur">
      {!hideLabel && label !== undefined ? (
        <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.06em] text-muted">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey ?? entry.name} className="flex items-center gap-2 text-[11px]">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: entry.color ?? entry.stroke }}
              aria-hidden="true"
            />
            <span className="text-muted">{entry.name}</span>
            <span className={cn('ml-auto font-medium tabular-nums text-ink')}>
              {valueFormatter ? valueFormatter(entry.value, entry) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

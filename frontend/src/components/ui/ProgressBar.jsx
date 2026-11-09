import { cn } from '@/utils/cn'

const tones = {
  cyan: 'bg-cyan',
  petrol: 'bg-petrol',
  warning: 'bg-warning',
  critical: 'bg-critical',
  success: 'bg-success',
  neutral: 'bg-muted',
}

export function ProgressBar({ value, max = 100, tone = 'cyan', label, className, showValue = false }) {
  const safeMax = Number(max) > 0 ? Number(max) : 100
  const pct = Math.min(100, Math.max(0, (Number(value) / safeMax) * 100))
  return (
    <div className={cn('space-y-1.5', className)}>
      {label || showValue ? (
        <div className="flex items-center justify-between gap-2 text-[10px] text-muted">
          <span>{label}</span>
          {showValue ? <span className="font-mono">{Math.round(pct)}%</span> : null}
        </div>
      ) : null}
      <div
        className="h-1.5 overflow-hidden rounded-full bg-navy-700/80"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', tones[tone] ?? tones.cyan)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

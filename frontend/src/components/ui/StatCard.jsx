import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '@/utils/cn'

const tones = {
  cyan: 'text-cyan-300 border-cyan/20 bg-cyan/[0.07]',
  petrol: 'text-petrol-400 border-petrol/20 bg-petrol/[0.07]',
  warning: 'text-warning border-warning/20 bg-warning/[0.07]',
  critical: 'text-critical border-critical/20 bg-critical/[0.07]',
  neutral: 'text-muted border-line bg-navy-800/60',
  success: 'text-success border-success/20 bg-success/[0.07]',
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
  const trendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus
  const TrendIcon = trendIcon
  return (
    <div
      className={cn(
        'panel relative overflow-hidden p-4',
        onClick && 'cursor-pointer transition hover:border-cyan/30 hover:bg-navy-850/80',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow truncate">{label}</p>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="font-mono text-[26px] font-semibold tabular-nums leading-none text-mist">{value}</span>
            {unit ? <span className="font-mono text-[11px] text-muted">{unit}</span> : null}
          </div>
        </div>
        <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl border', tones[tone] ?? tones.cyan)}>
          {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        {hint ? <p className="min-w-0 truncate text-[11px] text-muted">{hint}</p> : <span />}
        {trend ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-mono text-[10px]',
              trend === 'up' ? 'text-warning' : trend === 'down' ? 'text-success' : 'text-muted',
            )}
          >
            <TrendIcon className="h-3 w-3" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      {footer}
    </div>
  )
}

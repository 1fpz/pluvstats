import { Link } from 'react-router-dom'
import { Check, CheckCheck, ScanLine, TrendingUp, WifiOff, Waves, ArrowUpRight } from 'lucide-react'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { alertTypeMeta, severityMeta } from '@/utils/severity'
import { formatCm, formatRate, formatRelativeTime, formatTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const TYPE_ICON = {
  water_level: Waves,
  rise_rate: TrendingUp,
  communication: WifiOff,
  invalid_reading: ScanLine,
  sensor_failure: ScanLine,
}

export function AlertItem({
  alert,
  compact = false,
  onAcknowledge,
  onResolve,
  busy = false,
  showActions = false,
  className,
}) {
  const meta = severityMeta[alert.severity] ?? severityMeta.normal
  const Icon = TYPE_ICON[alert.type] ?? Waves
  const active = alert.status !== 'resolved'
  const metrics = alert.metrics ?? {}

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-xl border bg-navy-900/50 transition hover:bg-navy-850/70',
        meta.border,
        !active && 'opacity-65',
        className,
      )}
    >
      <span className={cn('absolute inset-y-0 left-0 w-0.5', meta.dot)} aria-hidden="true" />
      <div className={cn('pl-4', compact ? 'p-3' : 'p-4')}>
        <div className="flex items-start gap-3">
          <span className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border', meta.bg, meta.border, meta.text)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <SeverityBadge severity={alert.severity} size="xs" pulse={alert.severity === 'critical' && active} />
              <SourceBadge source={alert.source} size="xs" showIcon={false} />
              {alert.status === 'acknowledged' ? (
                <Badge variant="neutral" size="xs">
                  Reconhecido
                </Badge>
              ) : null}
              {alert.status === 'resolved' ? (
                <Badge variant="success" size="xs">
                  Resolvido
                </Badge>
              ) : null}
              <span className="ml-auto shrink-0 font-mono text-[9px] text-muted">
                {alert.openedAt ? formatTime(alert.openedAt) : '—'}
              </span>
            </div>
            <h3 className={cn('mt-1.5 font-medium text-ink', compact ? 'text-[12px]' : 'text-[13px]')}>
              {alert.title}
            </h3>
            <p className="mt-0.5 text-[10px] text-muted">
              {alert.sensorName}
              <span className="mx-1 text-line">·</span>
              {alertTypeMeta[alert.type]?.label ?? alert.type}
              <span className="mx-1 text-line">·</span>
              {formatRelativeTime(alert.lastObservedAt ?? alert.openedAt)}
            </p>
            {!compact ? (
              <>
                <p className="mt-2 text-[11px] leading-relaxed text-muted">{alert.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {metrics.waterLevelCm !== undefined && metrics.waterLevelCm !== null ? (
                    <span className="rounded-md border border-line bg-navy-950/50 px-1.5 py-0.5 text-muted">
                      nível {formatCm(metrics.waterLevelCm)}
                    </span>
                  ) : null}
                  {metrics.rateCmPerMin !== undefined && metrics.rateCmPerMin !== null ? (
                    <span className="rounded-md border border-line bg-navy-950/50 px-1.5 py-0.5 text-muted">
                      {formatRate(metrics.rateCmPerMin)}
                    </span>
                  ) : null}
                  {metrics.readingAgeSeconds !== undefined && metrics.readingAgeSeconds !== null ? (
                    <span className="rounded-md border border-line bg-navy-950/50 px-1.5 py-0.5 text-muted">
                      sem leitura há {Math.round(metrics.readingAgeSeconds)}s
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 border-l border-line pl-2 text-[10px] leading-relaxed text-cyan-300/80">
                  {alert.recommendation}
                </p>
              </>
            ) : null}
            {showActions && active ? (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {alert.status === 'active' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Check}
                    loading={busy}
                    onClick={() => onAcknowledge?.(alert)}
                  >
                    Reconhecer
                  </Button>
                ) : null}
                <Button size="sm" variant="subtle" icon={CheckCheck} loading={busy} onClick={() => onResolve?.(alert)}>
                  Resolver
                </Button>
                <Link
                  to={`/sensores?selected=${alert.sensorId}`}
                  className="ml-auto inline-flex items-center gap-0.5 text-[10px] font-medium text-cyan-300 hover:text-cyan-400"
                >
                  Sensor
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}

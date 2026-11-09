import { ArrowUpRight, Cpu, Droplets, Gauge, Radio, Waves } from 'lucide-react'
import { Sparkline } from '@/components/charts/Sparkline'
import { SensorStatusBadge } from '@/components/ui/SensorStatusBadge'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { thresholds } from '@/config'
import { formatCm, formatRate, formatRelativeTime } from '@/utils/formatters'
import { severityMeta } from '@/utils/severity'
import { cn } from '@/utils/cn'

export function SensorCard({ sensor, onSelect, className, footer = true }) {
  const severity = sensor.alertSeverity ?? 'normal'
  const meta = severityMeta[severity]
  const history = (sensor.history ?? []).map((point) => point.levelCm)
  const hasLevel = Number.isFinite(sensor.levelCm)
  const isHardware = sensor.source === 'hardware'

  return (
    <article className={cn('panel-interactive group flex flex-col overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => onSelect?.(sensor)}
        className="flex flex-1 flex-col p-4 text-left"
        aria-label={`Abrir detalhes do sensor ${sensor.shortName ?? sensor.name}`}
      >
        <div className="flex w-full items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
              <p className="truncate font-display text-[13px] font-semibold text-mist">
                {sensor.shortName ?? sensor.name}
              </p>
            </div>
            <p className="mt-0.5 truncate text-[10px] text-muted">
              {sensor.id} · {sensor.neighborhood}
            </p>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted/50 transition group-hover:text-cyan-300" aria-hidden="true" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <SensorStatusBadge status={sensor.status} />
          <SourceBadge source={sensor.source} />
          {!hasLevel ? <SeverityBadge severity={severity} size="xs" /> : null}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Nível atual</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className={cn('font-mono text-[28px] font-semibold leading-none tabular-nums', hasLevel ? meta.text : 'text-muted')}>
                {hasLevel ? formatCm(sensor.levelCm) : '—'}
              </span>
            </div>
            <p className="mt-1.5 flex items-center gap-1 font-mono text-[10px] text-muted">
              <Gauge className="h-3 w-3" aria-hidden="true" />
              {formatRate(sensor.rateCmPerMin)}
            </p>
          </div>
          <div className="text-right">
            {history.length > 1 ? (
              <Sparkline values={history} stroke={meta.hex} width={104} height={38} />
            ) : (
              <div className="flex h-[38px] w-[104px] items-center justify-center rounded border border-dashed border-line text-[9px] text-muted">
                sem série
              </div>
            )}
            <p className="mt-1 font-mono text-[9px] text-muted">
              {sensor.lastReadingAt ? formatRelativeTime(sensor.lastReadingAt) : 'sem leitura'}
            </p>
          </div>
        </div>

        {hasLevel ? (
          <ProgressBar
            className="mt-3 w-full"
            value={sensor.levelCm}
            max={thresholds.waterLevelCm.critical * 1.25}
            tone={meta.tone === 'critical' && severity !== 'critical' ? 'warning' : meta.tone}
            label={`Limite crítico ${thresholds.waterLevelCm.critical} cm`}
            showValue
          />
        ) : (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-warning/25 bg-warning/[0.04] px-2.5 py-2 text-[10px] leading-relaxed text-muted">
            <Radio className="h-3.5 w-3.5 shrink-0 text-warning" aria-hidden="true" />
            {isHardware
              ? 'Nenhuma leitura física válida recebida. Dispositivo não validado.'
              : 'Simulação sem leitura disponível.'}
          </div>
        )}
      </button>

      {footer ? (
        <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-2.5">
          <span className="flex items-center gap-1.5 font-mono text-[9px] text-muted">
            {isHardware ? <Cpu className="h-3 w-3" aria-hidden="true" /> : <Waves className="h-3 w-3" aria-hidden="true" />}
            {sensor.deviceId}
          </span>
          <span className="flex items-center gap-1 font-mono text-[9px] text-muted">
            <Droplets className="h-3 w-3" aria-hidden="true" />
            {sensor.distanceCm !== null && sensor.distanceCm !== undefined ? `${sensor.distanceCm} cm` : '—'}
          </span>
        </div>
      ) : null}
    </article>
  )
}

import { useId, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, ArrowUpRight, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/Card'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { EmptyState } from '@/components/ui/EmptyState'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { thresholds } from '@/config'
import { formatCm, formatRate, formatRelativeTime, formatTime } from '@/utils/formatters'
import { severityMeta } from '@/utils/severity'
import { cn } from '@/utils/cn'

const THRESHOLD_LINES = [
  { key: 'attention', value: thresholds.waterLevelCm.attention, label: 'Atenção' },
  { key: 'alert', value: thresholds.waterLevelCm.alert, label: 'Alerta' },
  { key: 'critical', value: thresholds.waterLevelCm.critical, label: 'Crítico' },
]

export function LevelChart({
  sensors = [],
  selectedSensorId,
  onSelectedChange,
  title = 'Série temporal de nível',
  description = 'Histórico simulado do sensor selecionado, em centímetros.',
  height = 250,
  showHeader = true,
  className,
}) {
  const simulatedSensors = sensors.filter((sensor) => sensor.source === 'simulation')
  const [internalId, setInternalId] = useState(null)
  const currentId =
    selectedSensorId ?? internalId ?? simulatedSensors[0]?.id ?? null
  const selected =
    simulatedSensors.find((sensor) => sensor.id === currentId) ?? simulatedSensors[0] ?? null
  const gradientId = `level-${useId().replace(/:/g, '')}`

  const data = useMemo(() => {
    if (!selected?.history) return []
    return selected.history
      .filter((point) => Number.isFinite(point.levelCm))
      .map((point) => ({
        t: new Date(point.t).getTime(),
        level: point.levelCm,
        rate: point.rateCmPerMin,
      }))
  }, [selected])

  const severity = selected?.alertSeverity ?? 'normal'
  const meta = severityMeta[severity]

  const body = (
    <>
      {showHeader ? (
        <CardHeader
          icon={Activity}
          title={title}
          description={description}
          actions={
            simulatedSensors.length > 0 ? (
              <select
                aria-label="Selecionar sensor para o gráfico"
                value={selected?.id ?? ''}
                onChange={(event) => {
                  setInternalId(event.target.value)
                  onSelectedChange?.(event.target.value)
                }}
                className="h-8 max-w-[190px] rounded-lg border border-line bg-navy-950 px-2 text-[11px] text-ink focus:border-cyan/50 focus:outline-none"
              >
                {simulatedSensors.map((sensor) => (
                  <option key={sensor.id} value={sensor.id}>
                    {sensor.id} · {sensor.shortName}
                  </option>
                ))}
              </select>
            ) : null
          }
        />
      ) : null}

      <CardBody className={showHeader ? 'pt-4' : ''}>
        {!selected || data.length < 2 ? (
          <EmptyState
            icon={Waves}
            compact
            title="Série indisponível"
            description="Nenhuma série simulada está disponível no momento."
          />
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <SourceBadge source={selected.source} />
                <SeverityBadge severity={severity} />
                <span className="text-[10px] text-muted">{selected.deviceId}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={cn('text-xl font-semibold tabular-nums tracking-[-0.02em]', meta.text)}>
                  {formatCm(selected.levelCm)}
                </span>
                <span className="text-[10px] tabular-nums text-muted">{formatRate(selected.rateCmPerMin)}</span>
              </div>
            </div>

            <div style={{ height }} className="-ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={meta.hex} stopOpacity={0.32} />
                      <stop offset="100%" stopColor={meta.hex} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" vertical={false} />
                  <XAxis
                    dataKey="t"
                    type="number"
                    scale="time"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(value) => formatTime(value).slice(0, 5)}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={36}
                  />
                  <YAxis
                    domain={[0, Math.max(90, thresholds.waterLevelCm.critical + 20)]}
                    axisLine={false}
                    tickLine={false}
                    width={34}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        labelFormatter={(value) => formatTime(value)}
                        valueFormatter={(value) => formatCm(value, 1)}
                      />
                    }
                    cursor={{ stroke: 'rgba(143,208,202,0.22)', strokeDasharray: '3 3' }}
                  />
                  {THRESHOLD_LINES.map((line) => (
                    <ReferenceLine
                      key={line.key}
                      y={line.value}
                      stroke={severityMeta[line.key].hex}
                      strokeOpacity={0.4}
                      strokeDasharray="4 5"
                      label={{
                        value: line.label,
                        position: 'insideTopRight',
                        fill: severityMeta[line.key].hex,
                        fontSize: 9,
                        fontFamily: 'Public Sans, system-ui, sans-serif',
                      }}
                    />
                  ))}
                  <Area
                    type="monotone"
                    dataKey="level"
                    name="Nível"
                    stroke={meta.hex}
                    strokeWidth={2}
                    fill={`url(#${gradientId})`}
                    dot={false}
                    activeDot={{ r: 3, strokeWidth: 0, fill: meta.hex }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[9.5px] text-muted">
              <span className="tabular-nums">
                {formatCm(selected.levelCm)} · atualizado {formatRelativeTime(selected.lastReadingAt)}
              </span>
              <span className="flex items-center gap-3">
                {THRESHOLD_LINES.map((line) => (
                  <span key={line.key} className="flex items-center gap-1">
                    <span
                      className="h-px w-3 border-t border-dashed"
                      style={{ borderColor: severityMeta[line.key].hex }}
                    />
                    {line.label} {line.value}
                  </span>
                ))}
              </span>
            </div>
          </>
        )}
      </CardBody>

      {showHeader ? (
        <CardFooter className="py-2.5">
          <span className="text-[10px] text-muted">
            Modelo experimental de cenário, não hidráulica calibrada.
          </span>
          <Link
            to={`/sensores?selected=${selected?.id ?? ''}`}
            className="inline-flex items-center gap-0.5 text-[10.5px] font-medium text-muted hover:text-ink"
          >
            Detalhes
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </CardFooter>
      ) : null}
    </>
  )

  if (!showHeader) return <div className={className}>{body}</div>

  return <Card className={className}>{body}</Card>
}

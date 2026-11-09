import { CloudRain, Droplets, RefreshCw, Thermometer, Wind, Cloud } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Loading'
import { WeatherIcon } from './WeatherIcon'
import { useWeather } from '@/hooks'
import { formatNumber, formatRelativeTime, formatTime } from '@/utils/formatters'

export function WeatherPanel({ className }) {
  const { data, loading, error, fromCache, refresh } = useWeather()

  return (
    <Card className={className}>
      <CardHeader
        icon={CloudRain}
        title="Meteorologia externa"
        description="Open-Meteo · Santo André/SP · não é leitura do sensor"
        actions={
          <div className="flex items-center gap-1.5">
            <Badge variant="neutral" size="xs">
              Externo
            </Badge>
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="grid h-7 w-7 place-items-center rounded-lg border border-line text-muted transition hover:border-cyan/30 hover:text-ink disabled:opacity-50"
              aria-label="Atualizar meteorologia"
            >
              <RefreshCw className={loading ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} aria-hidden="true" />
            </button>
          </div>
        }
      />
      <CardBody className="pt-4">
        {loading && !data ? (
          <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error && !data ? (
          <EmptyState
            icon={Cloud}
            compact
            title="Meteorologia indisponível"
            description={error}
            action={
              <Button size="sm" variant="secondary" icon={RefreshCw} onClick={refresh}>
                Tentar novamente
              </Button>
            }
          />
        ) : data ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan/20 bg-cyan/[0.07] text-cyan-300">
                  <WeatherIcon icon={data.current.icon} className="h-6 w-6" />
                </span>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-[28px] font-semibold leading-none text-mist">
                      {formatNumber(data.current.temperatureC)}
                    </span>
                    <span className="font-mono text-xs text-muted">°C</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted">{data.current.condition}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="eyebrow">Chuva agora</p>
                <p className="mt-1 font-mono text-sm font-semibold text-cyan-300">
                  {formatNumber(data.current.precipitationMm)} mm
                </p>
                {fromCache ? <p className="mt-0.5 text-[9px] text-muted">cache</p> : null}
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-line bg-navy-950/40 p-2">
                <dt className="flex items-center gap-1 text-[9px] uppercase tracking-[0.08em] text-muted">
                  <Droplets className="h-3 w-3" aria-hidden="true" />
                  Umidade
                </dt>
                <dd className="mt-1 font-mono text-xs text-ink">
                  {data.current.humidity !== null ? `${Math.round(data.current.humidity)}%` : '—'}
                </dd>
              </div>
              <div className="rounded-lg border border-line bg-navy-950/40 p-2">
                <dt className="flex items-center gap-1 text-[9px] uppercase tracking-[0.08em] text-muted">
                  <Wind className="h-3 w-3" aria-hidden="true" />
                  Vento
                </dt>
                <dd className="mt-1 font-mono text-xs text-ink">
                  {data.current.windKmh !== null ? `${formatNumber(data.current.windKmh)} km/h` : '—'}
                </dd>
              </div>
              <div className="rounded-lg border border-line bg-navy-950/40 p-2">
                <dt className="flex items-center gap-1 text-[9px] uppercase tracking-[0.08em] text-muted">
                  <Thermometer className="h-3 w-3" aria-hidden="true" />
                  Chuva 24h
                </dt>
                <dd className="mt-1 font-mono text-xs text-ink">
                  {formatNumber(data.daily?.[0]?.precipitationMm ?? 0)} mm
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="eyebrow">Próximas horas · precipitação</p>
                <span className="font-mono text-[9px] text-muted">probabilidade / mm</span>
              </div>
              <div className="flex items-end gap-1.5" aria-hidden="true">
                {(data.hourly ?? []).slice(0, 8).map((hour) => {
                  const height = Math.max(6, Math.min(46, (hour.probability / 100) * 46))
                  const rainy = hour.probability >= 40
                  return (
                    <div key={hour.time} className="flex flex-1 flex-col items-center gap-1">
                      <span className="font-mono text-[8px] text-muted">
                        {formatNumber(hour.precipitationMm)}
                      </span>
                      <div className="flex h-12 w-full items-end justify-center rounded bg-navy-800/50">
                        <div
                          className={rainy ? 'w-full rounded bg-cyan/70' : 'w-full rounded bg-petrol/50'}
                          style={{ height }}
                        />
                      </div>
                      <span className="font-mono text-[8px] text-muted">{formatTime(hour.time).slice(0, 2)}h</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
              <a
                href={data.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[9px] font-medium text-cyan-300 hover:text-cyan-400"
              >
                Fonte: {data.source}
              </a>
              <span className="font-mono text-[9px] text-muted">
                Atualizado {data.fetchedAt ? formatRelativeTime(data.fetchedAt) : '—'}
              </span>
            </div>
            {error ? (
              <p className="mt-2 rounded-lg border border-warning/20 bg-warning/[0.05] px-2 py-1.5 text-[9px] leading-relaxed text-warning">
                Atualização falhou ({error}). Exibindo último cache disponível.
              </p>
            ) : null}
          </>
        ) : null}
      </CardBody>
    </Card>
  )
}

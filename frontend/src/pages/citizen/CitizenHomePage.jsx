import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BellRing,
  CloudRain,
  Droplets,
  MapPin,
  PlusCircle,
  ShieldAlert,
  Waves,
} from 'lucide-react'
import { buttonClass } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { useData, useSimulation, useWeather } from '@/hooks'
import { territory, thresholds } from '@/config'
import { currentSituationSeverity, severityMeta, severityRank } from '@/utils/severity'
import { formatCm, formatRate, formatRelativeTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'

function attentionSensors(sensors) {
  return sensors
    .filter(
      (sensor) =>
        severityRank(sensor.alertSeverity) > 0 ||
        (Number.isFinite(sensor.levelCm) && sensor.levelCm >= thresholds.waterLevelCm.attention),
    )
    .sort(
      (a, b) =>
        severityRank(b.alertSeverity) - severityRank(a.alertSeverity) ||
        (b.levelCm ?? 0) - (a.levelCm ?? 0),
    )
    .slice(0, 3)
}

export function CitizenHomePage() {
  const { snapshot, loading } = useData()
  const { isRunning, scenarioMeta } = useSimulation()
  const weather = useWeather()

  const sensors = snapshot?.sensors ?? []
  const occurrences = snapshot?.occurrences ?? []
  const alerts = (snapshot?.alerts ?? []).filter((alert) => alert.status !== 'resolved')
  const highlighted = attentionSensors(sensors)
  const openOccurrences = occurrences.filter((occurrence) =>
    ['open', 'validated', 'in_progress'].includes(occurrence.status),
  )
  const overview = currentSituationSeverity(sensors, alerts)
  const meta = severityMeta[overview]

  if (loading && !snapshot) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-28" />
        <div className="skeleton h-36" />
        <div className="skeleton h-56" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted">Área do cidadão</p>
        <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.02em] text-mist">Olá. Veja como está a cidade hoje.</h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
          Informações demonstrativas sobre pontos de atenção em {territory.name}. Este protótipo não substitui os
          canais oficiais de emergência.
        </p>
      </header>

      <Card>
        <CardBody className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted">Situação geral demonstrativa</p>
              <p className={cn('mt-1 text-xl font-semibold tracking-[-0.01em]', meta.text)}>{meta.label}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">{meta.description}</p>
            </div>
            <span className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', meta.dot)} aria-hidden="true" />
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line pt-3 text-[10.5px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className={cn('h-1.5 w-1.5 rounded-full', isRunning ? 'bg-cyan' : 'bg-warning')} aria-hidden="true" />
              {isRunning ? 'Monitoramento demonstrativo ativo' : 'Simulação pausada'}
            </span>
            <span className="text-white/15">·</span>
            <span>Cenário {scenarioMeta.label}</span>
            <span className="text-white/15">·</span>
            <span>{alerts.length} alerta(s) aberto(s)</span>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/cidadao/mapa" className={buttonClass({ variant: 'secondary', className: 'h-auto flex-col gap-2 px-3 py-4 text-xs' })}>
          <MapPin className="h-5 w-5 text-cyan-300" aria-hidden="true" />
          Mapa de atenção
        </Link>
        <Link to="/cidadao/registrar" className={buttonClass({ className: 'h-auto flex-col gap-2 px-3 py-4 text-xs' })}>
          <PlusCircle className="h-5 w-5" aria-hidden="true" />
          Registrar ocorrência
        </Link>
      </div>

      <Card>
        <CardHeader
          icon={Waves}
          title="Pontos que merecem atenção"
          description="Sensores simulados com nível ou taxa de elevação acima da faixa de atenção experimental."
          actions={<Link to="/cidadao/mapa" className="text-[10px] font-medium text-cyan-300">Ver mapa</Link>}
        />
        <CardBody className="space-y-2 p-4 pt-3">
          {highlighted.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              compact
              title="Nenhum ponto acima da atenção"
              description="As leituras simuladas permanecem abaixo do limite demonstrativo."
            />
          ) : (
            highlighted.map((sensor) => (
              <div key={sensor.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-white/[0.02] p-3">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-ink">{sensor.shortName ?? sensor.name}</p>
                  <p className="mt-0.5 truncate text-[9px] text-muted">{sensor.neighborhood} · {sensor.address}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <SeverityBadge severity={sensor.alertSeverity ?? 'normal'} size="xs" />
                    <SourceBadge source={sensor.source} size="xs" showIcon={false} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-ink">{formatCm(sensor.levelCm)}</p>
                  <p className="mt-0.5 text-[8.5px] tabular-nums text-muted">{formatRate(sensor.rateCmPerMin)}</p>
                  <p className="mt-0.5 text-[8.5px] tabular-nums text-muted">{formatRelativeTime(sensor.lastReadingAt)}</p>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader icon={CloudRain} title="Chuva agora" description="Open-Meteo, dados demonstrativos." />
          <CardBody className="p-4 pt-3">
            {weather.loading ? (
              <div className="skeleton h-16" />
            ) : weather.error ? (
              <p className="text-[10px] leading-relaxed text-muted">
                Não foi possível carregar a condição meteorológica. Tente novamente mais tarde.
              </p>
            ) : weather.data ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold tabular-nums text-mist">{weather.data.current.temperatureC ?? '—'}°C</p>
                  <p className="mt-0.5 text-[10px] capitalize text-muted">{weather.data.current.condition}</p>
                  <p className="mt-0.5 text-[9px] text-muted">
                    chuva {weather.data.current.precipitationMm ?? 0} mm · umidade {weather.data.current.humidity ?? '—'}%
                  </p>
                </div>
                <Droplets className="h-7 w-7 text-cyan-300" aria-hidden="true" />
              </div>
            ) : (
              <p className="text-[10px] text-muted">Sem dados meteorológicos no momento.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader icon={BellRing} title="Ocorrências abertas" description="Registros demonstrativos na área." />
          <CardBody className="p-4 pt-3">
            <p className="text-xl font-semibold tabular-nums text-mist">{openOccurrences.length}</p>
            <p className="mt-1 text-[10px] leading-relaxed text-muted">
              {openOccurrences.length === 0
                ? 'Nenhuma ocorrência aberta neste momento.'
                : `A mais recente: ${openOccurrences[0]?.title ?? '—'}`}
            </p>
            <Link to="/cidadao/mapa" className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-cyan-300">
              Consultar no mapa
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="p-4">
          <p className="text-[11px] font-medium text-ink">Em caso de risco imediato</p>
          <p className="mt-1 text-[10px] leading-relaxed text-muted">
            Procure um local seguro e acione os canais oficiais de emergência do seu município. Este protótipo é
            acadêmico, usa dados simulados e não envia equipes.
          </p>
          <Link to="/cidadao/informacoes" className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-cyan-300">
            Ler orientações
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </CardBody>
      </Card>
    </div>
  )
}

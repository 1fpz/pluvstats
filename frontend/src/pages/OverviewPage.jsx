import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  BellRing,
  Cpu,
  MapPin,
  Plus,
  Radio,
  Waves,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'
import { buttonClass } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { UrbanMap } from '@/components/map/UrbanMap'
import { LevelChart } from '@/components/charts/LevelChart'
import { WeatherPanel } from '@/components/weather/WeatherPanel'
import { AlertsPanel } from '@/components/dashboard/AlertsPanel'
import { PriorityList } from '@/components/dashboard/PriorityList'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { OriginPanel } from '@/components/dashboard/OriginPanel'
import { useData, useSimulation } from '@/hooks'
import { formatCm, formatRate, formatRelativeTime } from '@/utils/formatters'

export function OverviewPage() {
  const { snapshot, loading, error } = useData()
  const { isRunning, scenarioMeta } = useSimulation()

  const derived = useMemo(() => {
    if (!snapshot) return null
    const activeOccurrences = snapshot.occurrences.filter((occurrence) =>
      ['open', 'validated', 'in_progress'].includes(occurrence.status),
    )
    const activeAlerts = snapshot.alerts.filter((alert) => alert.status !== 'resolved')
    const simulated = snapshot.sensors.filter((sensor) => sensor.source === 'simulation')
    const hardware = snapshot.sensors.filter((sensor) => sensor.source === 'hardware')
    const withLevel = simulated.filter((sensor) => Number.isFinite(sensor.levelCm))
    const highest = withLevel.sort((a, b) => b.levelCm - a.levelCm)[0] ?? null
    return {
      activeOccurrences,
      activeAlerts,
      simulated,
      hardware,
      highest,
      inProgress: activeOccurrences.filter((occurrence) => occurrence.status === 'in_progress').length,
      criticalAlerts: activeAlerts.filter((alert) => alert.severity === 'critical').length,
      validatedHardware: hardware.filter((sensor) => sensor.validated).length,
    }
  }, [snapshot])

  if (loading && !snapshot) {
    return (
      <div className="space-y-5">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-9 w-80" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="skeleton h-[460px] xl:col-span-2" />
          <div className="skeleton h-[460px]" />
        </div>
      </div>
    )
  }

  if (error || !snapshot || !derived) {
    return (
      <Card>
        <EmptyState
          icon={Waves}
          title="Não foi possível carregar a visão geral"
          description={error ?? 'A fonte de dados não retornou um estado válido.'}
          action={
            <button type="button" className={buttonClass()} onClick={() => window.location.reload()}>
              Recarregar plataforma
            </button>
          }
        />
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${snapshot.now ? new Date(snapshot.now).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) : 'Hoje'} · Santo André/SP`}
        title="Visão geral territorial"
        description="Leituras simuladas, ocorrências demonstrativas e meteorologia externa em um único painel. Cada camada mantém sua origem explícita."
        meta={
          <>
            <Badge variant={isRunning ? 'cyan' : 'warning'} dot pulse={isRunning} size="sm">
              {isRunning ? 'Simulação ativa' : 'Simulação pausada'}
            </Badge>
            <Badge variant="neutral" size="sm">
              Cenário {scenarioMeta.label}
            </Badge>
            <span className="font-mono text-[10px] text-muted">
              Atualizado {formatRelativeTime(snapshot.updatedAt)}
            </span>
          </>
        }
        actions={
          <>
            <Link to="/mapa" className={buttonClass({ variant: 'secondary' })}>
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Abrir mapa
            </Link>
            <Link to="/ocorrencias?new=1" className={buttonClass()}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Registrar ocorrência
            </Link>
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principais">
        <StatCard
          label="Alertas ativos"
          value={derived.activeAlerts.length}
          icon={BellRing}
          tone={derived.criticalAlerts > 0 ? 'critical' : derived.activeAlerts.length > 0 ? 'warning' : 'success'}
          hint={`${derived.criticalAlerts} crítico(s) · motor experimental`}
        />
        <StatCard
          label="Ocorrências abertas"
          value={derived.activeOccurrences.length}
          icon={MapPin}
          tone="warning"
          hint={`${derived.inProgress} em intervenção · base demonstrativa`}
        />
        <StatCard
          label="Pontos monitorados"
          value={snapshot.sensors.length}
          icon={Cpu}
          tone="cyan"
          hint={`${derived.simulated.length} simulados · ${derived.hardware.length} hardware não validado`}
        />
        <StatCard
          label="Maior nível atual"
          value={derived.highest ? formatCm(derived.highest.levelCm) : '—'}
          icon={Waves}
          tone={derived.highest?.alertSeverity === 'critical' ? 'critical' : 'cyan'}
          hint={
            derived.highest
              ? `${derived.highest.shortName} · ${formatRate(derived.highest.rateCmPerMin)}`
              : 'Sem leituras simuladas'
          }
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader
            icon={MapPin}
            title="Território em monitoramento"
            description="Pontos de demonstração em Santo André/SP. Marcadores não representam ocorrências oficiais."
            actions={
              <Link
                to="/mapa"
                className="inline-flex items-center gap-0.5 text-[10px] font-medium text-cyan-300 hover:text-cyan-400"
              >
                Explorar mapa
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            }
          />
          <div className="p-3">
            <UrbanMap
              sensors={snapshot.sensors}
              occurrences={snapshot.occurrences}
              height={382}
              showLegend
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5">
            <span className="flex items-center gap-2 font-mono text-[9px] text-muted">
              <Radio className="h-3 w-3 text-cyan" aria-hidden="true" />
              {derived.simulated.length} sensores simulados
              <span className="text-line">·</span>
              {derived.activeOccurrences.length} ocorrências ativas
            </span>
            <span className="font-mono text-[9px] text-warning">coordenadas demonstrativas</span>
          </div>
        </Card>

        <AlertsPanel alerts={snapshot.alerts} limit={4} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <LevelChart
          sensors={snapshot.sensors}
          className="xl:col-span-2"
          title="Nível de água simulado"
          description="Série temporal do sensor selecionado, com limites experimentais e histerese."
        />
        <WeatherPanel />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <PriorityList
          occurrences={snapshot.occurrences}
          sensors={snapshot.sensors}
          className="xl:col-span-2"
        />
        <div className="space-y-4">
          <ActivityFeed activity={snapshot.activity} />
          <OriginPanel snapshot={snapshot} />
        </div>
      </section>
    </div>
  )
}

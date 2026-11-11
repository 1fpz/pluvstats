import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  BellRing,
  CheckCheck,
  Clock3,
  History,
  Search,
  ShieldCheck,
  Siren,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonClass } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { InfoNotice } from '@/components/ui/InfoNotice'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { AlertItem } from '@/components/alerts/AlertItem'
import { useData, useDebouncedValue, useSimulation } from '@/hooks'
import { alertTypeMeta, severityMeta, severityRank } from '@/utils/severity'
import { formatDateTime, formatRelativeTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const STATUS_TABS = [
  { value: 'open', label: 'Abertos' },
  { value: 'all', label: 'Todos' },
  { value: 'resolved', label: 'Histórico' },
]

const TIMELINE_LABEL = {
  opened: 'Aberto',
  updated: 'Reavaliado',
  escalated: 'Escalado',
  acknowledged: 'Reconhecido',
  resolved: 'Resolvido',
}

function AlertTimeline({ alert }) {
  const events = [...(alert.timeline ?? [])].reverse()
  return (
    <ol className="space-y-2.5">
      {events.map((event, index) => {
        const meta = severityMeta[event.severity] ?? severityMeta.normal
        const last = index === events.length - 1
        return (
          <li key={`${event.at}-${event.kind}-${index}`} className="flex gap-2.5">
            <div className="flex flex-col items-center">
              <span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden="true" />
              {!last ? <span className="mt-1 w-px flex-1 bg-line" aria-hidden="true" /> : null}
            </div>
            <div className="pb-1">
              <p className="text-[10px] font-medium text-ink">{TIMELINE_LABEL[event.kind] ?? event.kind}</p>
              <p className="text-[9px] leading-relaxed text-muted">{event.message}</p>
              <p className="mt-0.5 font-mono text-[8px] text-muted/70">{formatDateTime(event.at)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function AlertDetail({ alert, onClose }) {
  return (
    <Card className="xl:sticky xl:top-32">
      <CardHeader
        icon={Siren}
        title="Detalhe do alerta"
        description={alert.id}
        actions={
          <Button variant="ghost" size="sm" icon={X} onClick={onClose}>
            Fechar
          </Button>
        }
      />
      <CardBody className="space-y-4 pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <SeverityBadge severity={alert.severity} />
          <SourceBadge source={alert.source} />
          <Badge variant={alert.status === 'resolved' ? 'success' : alert.status === 'acknowledged' ? 'neutral' : 'warning'} size="xs">
            {alert.status === 'resolved' ? 'Resolvido' : alert.status === 'acknowledged' ? 'Reconhecido' : 'Aberto'}
          </Badge>
          {alert.simulated ? <Badge variant="cyan" size="xs">simulado</Badge> : null}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">{alert.title}</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">{alert.description}</p>
        </div>

        <dl className="space-y-1.5 text-[10px]">
          {[
            ['Sensor', alert.sensorName],
            ['Dispositivo', alert.deviceId],
            ['Tipo', alertTypeMeta[alert.type]?.label ?? alert.type],
            ['Aberto em', formatDateTime(alert.openedAt)],
            ['Última observação', formatRelativeTime(alert.lastObservedAt ?? alert.openedAt)],
            ['Reconhecido em', alert.acknowledgedAt ? formatDateTime(alert.acknowledgedAt) : '—'],
            ['Resolvido em', alert.resolvedAt ? formatDateTime(alert.resolvedAt) : '—'],
            ['Encerramento', alert.resolvedAt ? (alert.resolvedAutomatically ? 'automático' : 'manual') : '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-3 border-b border-line pb-1.5 last:border-0">
              <dt className="text-muted">{label}</dt>
              <dd className="max-w-[62%] break-words text-right font-mono text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="rounded-lg border border-cyan/20 bg-cyan/[0.04] p-3">
          <p className="eyebrow mb-1 text-[9px]">Recomendação</p>
          <p className="text-[10px] leading-relaxed text-cyan-300/90">{alert.recommendation}</p>
        </div>

        <div>
          <p className="eyebrow mb-2">Linha do tempo</p>
          <AlertTimeline alert={alert} />
        </div>
      </CardBody>
      <CardFooter>
        <Link to={`/sensores?selected=${alert.sensorId}`} className="text-[10px] font-medium text-cyan-300 hover:text-cyan-400">
          Abrir sensor
        </Link>
        <span className="font-mono text-[9px] text-muted">{alert.sensorId}</span>
      </CardFooter>
    </Card>
  )
}

export function AlertsPage() {
  const { snapshot, loading, actions } = useData()
  const { isRunning, scenarioMeta } = useSimulation()
  const [statusFilter, setStatusFilter] = useState('open')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const debouncedQuery = useDebouncedValue(query, 220)

  const alerts = useMemo(() => snapshot?.alerts ?? [], [snapshot])

  const counts = useMemo(() => {
    const open = alerts.filter((alert) => alert.status !== 'resolved')
    return {
      open: open.length,
      critical: open.filter((alert) => alert.severity === 'critical').length,
      acknowledged: open.filter((alert) => alert.status === 'acknowledged').length,
      resolved: alerts.filter((alert) => alert.status === 'resolved').length,
      simulated: open.filter((alert) => alert.simulated).length,
    }
  }, [alerts])

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase()
    const list = alerts.filter((alert) => {
      const matchesQuery =
        !needle ||
        [alert.title, alert.id, alert.sensorName, alert.deviceId, alert.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(needle))
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'open' ? alert.status !== 'resolved' : alert.status === 'resolved')
      return (
        matchesQuery &&
        matchesStatus &&
        (severityFilter === 'all' || alert.severity === severityFilter) &&
        (sourceFilter === 'all' || alert.source === sourceFilter) &&
        (typeFilter === 'all' || alert.type === typeFilter)
      )
    })
    return list.sort((a, b) => {
      if (a.status === 'resolved' !== (b.status === 'resolved')) return a.status === 'resolved' ? 1 : -1
      const severityDelta = severityRank(b.severity) - severityRank(a.severity)
      if (severityDelta !== 0) return severityDelta
      return new Date(b.lastObservedAt ?? b.openedAt) - new Date(a.lastObservedAt ?? a.openedAt)
    })
  }, [alerts, debouncedQuery, severityFilter, sourceFilter, statusFilter, typeFilter])

  const selected = alerts.find((alert) => alert.id === selectedId) ?? null

  const handleAcknowledge = async (alert) => {
    setBusyId(alert.id)
    try {
      await actions.acknowledgeAlert(alert.id)
    } catch {
      /* erro exibido pelo contexto */
    } finally {
      setBusyId(null)
    }
  }

  const handleResolve = async (alert) => {
    setBusyId(alert.id)
    try {
      await actions.resolveAlert(alert.id)
    } catch {
      /* erro exibido pelo contexto */
    } finally {
      setBusyId(null)
    }
  }

  if (loading && !snapshot) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-9 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-24" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton h-32" />
            ))}
          </div>
          <div className="skeleton h-[420px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operação · resposta e histórico"
        title="Central de alertas"
        description="Alertas explicáveis gerados pelo motor de regras a partir de nível, taxa de elevação, comunicação e qualidade da leitura. Todos os alertas desta demonstração são simulados."
        meta={
          <>
            <Badge variant={isRunning ? 'cyan' : 'warning'} size="sm" dot pulse={isRunning}>
              {isRunning ? 'Motor ativo' : 'Simulação pausada'}
            </Badge>
            <Badge variant="neutral" size="sm">Cenário {scenarioMeta.label}</Badge>
            <span className="font-mono text-[10px] text-muted">{counts.open} aberto(s)</span>
          </>
        }
        actions={
          <Link to="/sensores" className={buttonClass({ variant: 'secondary' })}>
            <Activity className="h-4 w-4" aria-hidden="true" />
            Sensores
          </Link>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores de alertas">
        <StatCard label="Alertas abertos" value={counts.open} icon={BellRing} tone={counts.open > 0 ? 'warning' : 'success'} hint={`${counts.simulated} de origem simulada`} />
        <StatCard label="Críticos abertos" value={counts.critical} icon={Siren} tone={counts.critical > 0 ? 'critical' : 'success'} hint="Exigem análise imediata" />
        <StatCard label="Reconhecidos" value={counts.acknowledged} icon={CheckCheck} tone="cyan" hint="Em acompanhamento pela equipe" />
        <StatCard label="Resolvidos" value={counts.resolved} icon={ShieldCheck} tone="success" hint="Histórico preservado" />
      </section>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <SegmentedControl
            ariaLabel="Filtrar alertas por situação"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_TABS}
          />
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1 xl:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar alerta, sensor ou ID"
                aria-label="Buscar alertas"
                className="h-9 w-full rounded-lg border border-line bg-navy-950/60 pl-9 pr-3 text-xs text-ink placeholder:text-muted/70 focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/20"
              />
            </div>
            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
              aria-label="Filtrar por severidade"
              className="h-9 rounded-lg border border-line bg-navy-950/60 px-2.5 text-[11px] text-ink focus:border-cyan/50 focus:outline-none"
            >
              <option value="all">Toda severidade</option>
              <option value="critical">Crítico</option>
              <option value="alert">Alerta</option>
              <option value="attention">Atenção</option>
            </select>
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              aria-label="Filtrar por origem"
              className="h-9 rounded-lg border border-line bg-navy-950/60 px-2.5 text-[11px] text-ink focus:border-cyan/50 focus:outline-none"
            >
              <option value="all">Toda origem</option>
              <option value="simulation">Simulação</option>
              <option value="hardware">Hardware</option>
            </select>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Filtrar por tipo"
              className="h-9 rounded-lg border border-line bg-navy-950/60 px-2.5 text-[11px] text-ink focus:border-cyan/50 focus:outline-none"
            >
              <option value="all">Todo tipo</option>
              {Object.entries(alertTypeMeta).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="order-2 space-y-3 xl:order-1">
            {filtered.length === 0 ? (
              <Card>
                <EmptyState
                  icon={BellRing}
                  title={statusFilter === 'open' ? 'Nenhum alerta aberto' : 'Nenhum alerta encontrado'}
                  description={
                    statusFilter === 'open'
                      ? 'As condições monitoradas estão dentro das faixas configuradas para a demonstração.'
                      : 'Ajuste os filtros para consultar o histórico.'
                  }
                  action={
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setStatusFilter('all')
                        setSeverityFilter('all')
                        setSourceFilter('all')
                        setTypeFilter('all')
                        setQuery('')
                      }}
                    >
                      Limpar filtros
                    </Button>
                  }
                />
              </Card>
            ) : (
              filtered.map((alert) => (
                <div
                  key={alert.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(alert.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedId(alert.id)
                    }
                  }}
                  className={cn(
                    'cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40',
                    selectedId === alert.id && 'ring-1 ring-cyan/40',
                  )}
                >
                  <AlertItem
                    alert={alert}
                    showActions={alert.status !== 'resolved'}
                    busy={busyId === alert.id}
                    onAcknowledge={handleAcknowledge}
                    onResolve={handleResolve}
                  />
                </div>
              ))
            )}

            <InfoNotice variant="warning" title="Como interpretar">
              Severidade e recomendação vêm de regras determinísticas sobre limiares experimentais. Um alerta
              reconhecido continua aberto até que a condição normalize ou a equipe o resolva. O histórico não é apagado.
            </InfoNotice>
          </div>

          <aside className="order-1 xl:order-2">
            {selected ? (
              <AlertDetail alert={selected} onClose={() => setSelectedId(null)} />
            ) : (
              <Card className="xl:sticky xl:top-32">
                <CardHeader icon={History} title="Histórico e rastreabilidade" description="Cada alerta registra abertura, reavaliações e encerramento." />
                <CardBody className="space-y-3 pt-4">
                  <ul className="space-y-2.5 text-[10px] text-muted">
                    {[
                      ['Abertura', 'Registra severidade, leitura e recomendação no momento da criação.'],
                      ['Reavaliação', 'Cada ciclo atualiza a observação e registra escalonamento de severidade.'],
                      ['Reconhecimento', 'Indica ciência da equipe sem encerrar a condição monitorada.'],
                      ['Resolução', 'Automática quando normaliza, ou manual com registro de autoria.'],
                    ].map(([title, text]) => (
                      <li key={title} className="flex gap-2">
                        <Clock3 className="mt-0.5 h-3 w-3 shrink-0 text-cyan-300" aria-hidden="true" />
                        <span>
                          <strong className="font-medium text-ink">{title}.</strong> {text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-lg border border-line bg-navy-950/40 p-3">
                    <p className="eyebrow text-[9px]">Selecione um alerta</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted">
                      Clique em um cartão para ver linha do tempo, métricas e recomendação completa.
                    </p>
                  </div>
                </CardBody>
                <CardFooter>
                  <span className="text-[10px] text-muted">Fonte</span>
                  <span className="font-mono text-[9px] text-muted">motor de regras · demo</span>
                </CardFooter>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

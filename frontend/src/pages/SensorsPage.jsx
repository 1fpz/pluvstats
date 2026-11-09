import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Activity,
  ArrowUpRight,
  Cpu,
  Droplets,
  Gauge,
  LayoutGrid,
  List,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Signal,
  TriangleAlert,
  Waves,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonClass } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { InfoNotice } from '@/components/ui/InfoNotice'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { SensorStatusBadge } from '@/components/ui/SensorStatusBadge'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { SensorCard } from '@/components/sensors/SensorCard'
import { LevelChart } from '@/components/charts/LevelChart'
import { AlertItem } from '@/components/alerts/AlertItem'
import { useData, useDebouncedValue, useSimulation } from '@/hooks'
import { thresholds } from '@/config'
import { sensorSeverity } from '@/domain/intelligence'
import { severityMeta } from '@/utils/severity'
import {
  formatCm,
  formatCoordinates,
  formatDateTime,
  formatRate,
  formatRelativeTime,
} from '@/utils/formatters'
import { cn } from '@/utils/cn'

function simulatorControls(controls, sensor, busy) {
  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
      <Button size="sm" variant="secondary" icon={Plus} disabled={busy} onClick={() => controls.raiseWater(sensor.id)}>
        Elevar +7 cm
      </Button>
      <Button size="sm" variant="secondary" icon={Waves} disabled={busy} onClick={() => controls.lowerWater(sensor.id)}>
        Reduzir
      </Button>
      <Button size="sm" variant="subtle" icon={Droplets} disabled={busy} onClick={() => controls.drain(sensor.id)}>
        Drenar
      </Button>
      <Button size="sm" variant="ghost" icon={Signal} disabled={busy} onClick={() => controls.injectFault(sensor.id, 'offline')}>
        Falha de sinal
      </Button>
      <Button size="sm" variant="ghost" icon={Activity} disabled={busy} onClick={() => controls.injectFault(sensor.id, 'invalid')}>
        Leitura inválida
      </Button>
      <Button size="sm" variant="ghost" icon={RefreshCw} disabled={busy} onClick={() => controls.recoverSensor(sensor.id)}>
        Recuperar
      </Button>
    </div>
  )
}

function DiagnosticsList({ sensor }) {
  const rows = [
    { label: 'Dispositivo', value: sensor.deviceId },
    { label: 'Origem', value: sensor.source === 'simulation' ? 'simulação' : 'hardware' },
    { label: 'Status', value: sensor.status },
    { label: 'Última leitura', value: sensor.lastReadingAt ? formatDateTime(sensor.lastReadingAt) : 'nenhuma' },
    {
      label: 'Idade da leitura',
      value:
        sensor.readingAgeSeconds !== null && sensor.readingAgeSeconds !== undefined
          ? `${Math.round(sensor.readingAgeSeconds)} s`
          : '—',
    },
    { label: 'Qualidade', value: sensor.quality ?? 'unknown' },
    { label: 'Validado', value: sensor.validated ? 'sim' : 'não' },
    { label: 'Coordenadas', value: formatCoordinates(sensor.position.lat, sensor.position.lng) },
  ]
  return (
    <dl className="space-y-1.5 text-[10px]">
      {rows.map((row) => (
        <div key={row.label} className="flex items-start justify-between gap-3 border-b border-line pb-1.5 last:border-0">
          <dt className="text-muted">{row.label}</dt>
          <dd className="max-w-[62%] break-words text-right font-mono text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function SensorDetailPanel({ sensor, alerts }) {
  const { controls, busy, isRunning } = useSimulation()
  const severity = sensorSeverity(sensor)
  const meta = severityMeta[severity]
  const isSimulation = sensor.source === 'simulation'
  const sensorAlerts = alerts.filter(
    (alert) => alert.sensorId === sensor.id && alert.status !== 'resolved',
  )
  const historyRows = [...(sensor.history ?? [])].reverse().slice(0, 6)

  return (
    <Card className="xl:sticky xl:top-32">
      <CardHeader
        icon={Cpu}
        title={sensor.shortName ?? sensor.name}
        description={`${sensor.id} · ${sensor.address}`}
        actions={
          <Link
            to={`/sensores?selected=${sensor.id}`}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          >
            {sensor.id}
          </Link>
        }
      />
      <CardBody className="space-y-4 pt-4">
        <div className="flex flex-wrap gap-1.5">
          <SeverityBadge severity={severity} />
          <SensorStatusBadge status={sensor.status} />
          <SourceBadge source={sensor.source} />
          {sensor.source === 'hardware' ? (
            <Badge variant={sensor.validated ? 'success' : 'warning'} size="xs">
              {sensor.validated ? 'validado' : 'não validado'}
            </Badge>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
            <p className="eyebrow text-[9px]">Nível atual</p>
            <p className={cn('mt-1 font-mono text-xl font-semibold', meta.text)}>{formatCm(sensor.levelCm)}</p>
          </div>
          <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
            <p className="eyebrow text-[9px]">Taxa de elevação</p>
            <p className="mt-1 font-mono text-xl font-semibold text-mist">{formatRate(sensor.rateCmPerMin)}</p>
          </div>
          <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
            <p className="eyebrow text-[9px]">Distância medida</p>
            <p className="mt-1 font-mono text-sm text-mist">
              {sensor.distanceCm !== null && sensor.distanceCm !== undefined ? `${sensor.distanceCm} cm` : '—'}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
            <p className="eyebrow text-[9px]">Última leitura</p>
            <p className="mt-1 font-mono text-sm text-mist">
              {sensor.lastReadingAt ? formatRelativeTime(sensor.lastReadingAt) : '—'}
            </p>
          </div>
        </div>

        {Number.isFinite(sensor.levelCm) ? (
          <ProgressBar
            value={sensor.levelCm}
            max={thresholds.waterLevelCm.critical * 1.25}
            tone={meta.tone}
            label={`Limite crítico ${thresholds.waterLevelCm.critical} cm`}
            showValue
          />
        ) : null}

        <div className="rounded-lg border border-line bg-navy-950/30 p-2">
          {isSimulation && Number.isFinite(sensor.levelCm) ? (
            <LevelChart sensors={[sensor]} selectedSensorId={sensor.id} showHeader={false} height={180} />
          ) : (
            <EmptyState
              icon={Radio}
              compact
              title="Sem série física"
              description="Nenhuma leitura de hardware validada foi recebida para este dispositivo."
            />
          )}
        </div>

        <InfoNotice variant={sensor.validated ? 'success' : isSimulation ? 'demo' : 'warning'} title="Prova de conectividade">
          {sensor.connectivityProof}
        </InfoNotice>

        {isSimulation ? (
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="eyebrow">Controles do simulador</p>
              <Badge variant={isRunning ? 'cyan' : 'warning'} size="xs">
                {isRunning ? 'ativo' : 'pausado'}
              </Badge>
            </div>
            {simulatorControls(controls, sensor, busy)}
            <p className="mt-2 text-[9px] leading-relaxed text-muted">
              Ações afetam apenas a simulação e produzem alertas marcados como simulados.
            </p>
          </div>
        ) : null}

        <div>
          <p className="eyebrow mb-2">Diagnóstico do dispositivo</p>
          <DiagnosticsList sensor={sensor} />
        </div>

        {historyRows.length > 1 ? (
          <div>
            <p className="eyebrow mb-2">Histórico recente</p>
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="text-[8px] uppercase tracking-[0.08em] text-muted">
                  <th className="pb-1 font-medium">Hora</th>
                  <th className="pb-1 text-right font-medium">Nível</th>
                  <th className="pb-1 text-right font-medium">Taxa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-mono">
                {historyRows.map((point) => (
                  <tr key={point.t}>
                    <td className="py-1 text-muted">{formatRelativeTime(point.t)}</td>
                    <td className="py-1 text-right text-ink">{formatCm(point.levelCm)}</td>
                    <td className="py-1 text-right text-muted">{formatRate(point.rateCmPerMin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="eyebrow">Alertas do sensor</p>
            <Link to="/alertas" className="text-[10px] font-medium text-cyan-300 hover:text-cyan-400">
              Central
            </Link>
          </div>
          {sensorAlerts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line px-3 py-2.5 text-[10px] text-muted">
              Nenhum alerta ativo para este ponto.
            </p>
          ) : (
            <div className="space-y-1.5">
              {sensorAlerts.slice(0, 3).map((alert) => (
                <AlertItem key={alert.id} alert={alert} compact />
              ))}
            </div>
          )}
        </div>
      </CardBody>
      <CardFooter>
        <span className="font-mono text-[9px] text-muted">{sensor.deviceId}</span>
        <Link to="/configuracoes#simulador" className="inline-flex items-center gap-0.5 text-[10px] text-cyan-300">
          <Settings2 className="h-3 w-3" aria-hidden="true" />
          Simulador
        </Link>
      </CardFooter>
    </Card>
  )
}

export function SensorsPage() {
  const { snapshot, loading } = useData()
  const { isRunning, scenarioMeta } = useSimulation()
  const [searchParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState(() => searchParams.get('selected'))
  const [view, setView] = useState('cards')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 220)

  const sensors = useMemo(() => snapshot?.sensors ?? [], [snapshot])
  const alerts = snapshot?.alerts ?? []
  const selected = sensors.find((sensor) => sensor.id === selectedId) ?? null

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase()
    return sensors.filter((sensor) => {
      const matchesQuery =
        !needle ||
        [sensor.name, sensor.shortName, sensor.id, sensor.deviceId, sensor.neighborhood, sensor.address]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(needle))
      const matchesSource = sourceFilter === 'all' || sensor.source === sourceFilter
      return matchesQuery && matchesSource
    })
  }, [debouncedQuery, sensors, sourceFilter])

  const simulated = sensors.filter((sensor) => sensor.source === 'simulation')
  const hardware = sensors.filter((sensor) => sensor.source === 'hardware')
  const validated = hardware.filter((sensor) => sensor.validated)
  const activeAlerts = alerts.filter((alert) => alert.status !== 'resolved')

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
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton h-56" />
            ))}
          </div>
          <div className="skeleton h-[560px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operação · dispositivos e séries"
        title="Sensores"
        description="Monitore pontos simulados, inspecione séries e diferencie claramente hardware validado de simulação. Nenhum dispositivo físico está conectado neste ambiente."
        meta={
          <>
            <Badge variant={isRunning ? 'cyan' : 'warning'} size="sm" dot pulse={isRunning}>
              {isRunning ? 'Simulação ativa' : 'Simulação pausada'}
            </Badge>
            <Badge variant="neutral" size="sm">Cenário {scenarioMeta.label}</Badge>
            <span className="font-mono text-[10px] text-muted">{validated.length} hardware validado</span>
          </>
        }
        actions={
          <>
            <Link to="/configuracoes#simulador" className={buttonClass({ variant: 'secondary' })}>
              <Settings2 className="h-4 w-4" aria-hidden="true" />
              Simulador
            </Link>
            <Link to="/diagnostico" className={buttonClass()}>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Diagnóstico
            </Link>
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores de sensores">
        <StatCard label="Pontos monitorados" value={sensors.length} icon={Cpu} tone="cyan" hint={`${simulated.length} simulados na demonstração`} />
        <StatCard label="Hardware validado" value={validated.length} icon={ShieldCheck} tone={validated.length > 0 ? 'success' : 'warning'} hint={`${hardware.length} dispositivo(s) registrado(s)`} />
        <StatCard label="Simulação" value={isRunning ? 'Ativa' : 'Pausada'} icon={Activity} tone={isRunning ? 'cyan' : 'warning'} hint={`Ciclo de 5 s · cenário ${scenarioMeta.label}`} />
        <StatCard label="Alertas de sensores" value={activeAlerts.length} icon={TriangleAlert} tone={activeAlerts.length > 0 ? 'warning' : 'success'} hint={`${activeAlerts.filter((alert) => alert.simulated).length} simulados`} />
      </section>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1 lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar sensor, ID ou bairro"
              aria-label="Buscar sensores"
              className="h-9 w-full rounded-lg border border-line bg-navy-950/60 pl-9 pr-3 text-xs text-ink placeholder:text-muted/70 focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/20"
            />
          </div>
          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            aria-label="Filtrar por origem"
            className="h-9 rounded-lg border border-line bg-navy-950/60 px-2.5 text-[11px] text-ink focus:border-cyan/50 focus:outline-none"
          >
            <option value="all">Todas as origens</option>
            <option value="simulation">Simulação</option>
            <option value="hardware">Hardware</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          {selected ? (
            <Button variant="ghost" size="sm" icon={X} onClick={() => setSelectedId(null)}>
              Limpar seleção
            </Button>
          ) : null}
          <SegmentedControl
            ariaLabel="Modo de visualização"
            value={view}
            onChange={setView}
            options={[
              { value: 'cards', label: 'Cards', icon: LayoutGrid },
              { value: 'table', label: 'Tabela', icon: List },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="order-2 space-y-4 xl:order-1">
          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={Cpu}
                title="Nenhum sensor encontrado"
                description="Ajuste a busca ou o filtro de origem."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery('')
                      setSourceFilter('all')
                    }}
                  >
                    Limpar filtros
                  </Button>
                }
              />
            </Card>
          ) : view === 'cards' ? (
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((sensor) => (
                <SensorCard key={sensor.id} sensor={sensor} onSelect={(item) => setSelectedId(item.id)} />
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-line text-[9px] uppercase tracking-[0.1em] text-muted">
                      <th scope="col" className="px-4 py-3 font-medium">Sensor</th>
                      <th scope="col" className="px-3 py-3 font-medium">Origem</th>
                      <th scope="col" className="px-3 py-3 font-medium">Status</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Nível</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Taxa</th>
                      <th scope="col" className="px-3 py-3 font-medium">Leitura</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filtered.map((sensor) => (
                      <tr key={sensor.id} className="transition hover:bg-navy-850/50">
                        <td className="px-4 py-3">
                          <button type="button" onClick={() => setSelectedId(sensor.id)} className="text-left">
                            <span className="flex items-center gap-1.5 font-medium text-ink">
                              <span className={cn('h-1.5 w-1.5 rounded-full', severityMeta[sensorSeverity(sensor)].dot)} />
                              {sensor.shortName ?? sensor.name}
                            </span>
                            <span className="mt-0.5 block font-mono text-[9px] text-muted">
                              {sensor.id} · {sensor.neighborhood}
                            </span>
                          </button>
                        </td>
                        <td className="px-3 py-3"><SourceBadge source={sensor.source} /></td>
                        <td className="px-3 py-3"><SensorStatusBadge status={sensor.status} /></td>
                        <td className="px-3 py-3 text-right font-mono text-[11px] text-ink">{formatCm(sensor.levelCm)}</td>
                        <td className="px-3 py-3 text-right font-mono text-[11px] text-muted">{formatRate(sensor.rateCmPerMin)}</td>
                        <td className="px-3 py-3 font-mono text-[9px] text-muted">
                          {sensor.lastReadingAt ? formatRelativeTime(sensor.lastReadingAt) : '—'}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedId(sensor.id)}>
                            Detalhes
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <CardFooter>
                <span className="text-[10px] text-muted">Tabela demonstrativa · {filtered.length} ponto(s)</span>
                <span className="font-mono text-[10px] text-muted">atualização {snapshot?.simulation?.running ? 'contínua' : 'pausada'}</span>
              </CardFooter>
            </Card>
          )}

          <InfoNotice variant="warning" title="Origem dos dispositivos">
            Sensores com etiqueta <strong className="text-ink">Simulado</strong> são gerados pelo runtime demonstrativo.
            O dispositivo <span className="font-mono text-ink">PS-05</span> está registrado como hardware, mas nunca
            enviou uma leitura física válida — portanto não é considerado conectado.
          </InfoNotice>
        </div>

        <aside className="order-1 space-y-4 xl:order-2">
          {selected ? (
            <SensorDetailPanel sensor={selected} alerts={alerts} />
          ) : (
            <>
              <Card>
                <CardHeader icon={ShieldAlert} title="Prova de conectividade" description="Critérios aplicados antes de considerar hardware real." />
                <CardBody className="space-y-3 pt-4">
                  <div className="rounded-lg border border-warning/25 bg-warning/[0.05] p-3">
                    <p className="text-[11px] font-medium text-ink">Nenhum sensor físico validado</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted">
                      Para habilitar operação real são exigidos ID do dispositivo, leitura recente, estrutura válida,
                      timestamp, origem de hardware e validação de atualidade.
                    </p>
                  </div>
                  <ul className="space-y-2 text-[10px] text-muted">
                    {[
                      'Identificação do dispositivo',
                      'Comunicação efetiva com o backend',
                      'Leitura válida e timestamp',
                      'Janela de atualidade respeitada',
                      'Origem confirmada como hardware',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="grid h-4 w-4 place-items-center rounded-full border border-critical/30 bg-critical/10 text-[8px] text-critical">
                          ×
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/diagnostico" className={buttonClass({ variant: 'secondary', className: 'w-full' })}>
                    Abrir diagnóstico completo
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </CardBody>
              </Card>
              <Card>
                <CardHeader icon={Gauge} title="Limiares experimentais" description="Aplicados pelo motor de alertas." />
                <CardBody className="space-y-3 pt-4">
                  <div>
                    <p className="eyebrow mb-1.5">Nível de água</p>
                    <div className="space-y-1.5 text-[10px]">
                      {[
                        ['Atenção', thresholds.waterLevelCm.attention, 'warning'],
                        ['Alerta', thresholds.waterLevelCm.alert, 'critical'],
                        ['Crítico', thresholds.waterLevelCm.critical, 'critical'],
                      ].map(([label, value, tone]) => (
                        <div key={label} className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-muted">
                            <span className={cn('h-1.5 w-1.5 rounded-full', tone === 'warning' ? 'bg-warning' : 'bg-critical')} />
                            {label}
                          </span>
                          <span className="font-mono text-ink">{value} cm</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-line pt-2">
                    <p className="eyebrow mb-1.5">Taxa de elevação</p>
                    <div className="space-y-1.5 text-[10px]">
                      {[
                        ['Atenção', thresholds.riseRateCmPerMin.attention],
                        ['Alerta', thresholds.riseRateCmPerMin.alert],
                        ['Crítico', thresholds.riseRateCmPerMin.critical],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between gap-2">
                          <span className="text-muted">{label}</span>
                          <span className="font-mono text-ink">{value} cm/min</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="border-t border-line pt-2 text-[9px] leading-relaxed text-muted">
                    Limites de demonstração, com histerese de {thresholds.hysteresisCm} cm para reduzir oscilação.
                  </p>
                </CardBody>
              </Card>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}

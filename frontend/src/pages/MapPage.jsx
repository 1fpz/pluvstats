import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowUpRight,
  Cpu,
  Droplets,
  Layers,
  MapPin,
  Plus,
  Radio,
  Search,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonClass } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { InfoNotice } from '@/components/ui/InfoNotice'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { SensorStatusBadge } from '@/components/ui/SensorStatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { UrbanMap } from '@/components/map/UrbanMap'
import { useData, useDebouncedValue, useMediaQuery } from '@/hooks'
import { thresholds } from '@/config'
import { occurrenceStatusMeta, severityMeta, severityRank } from '@/utils/severity'
import { formatCm, formatCoordinates, formatDateTime, formatRate, formatRelativeTime } from '@/utils/formatters'
import { scoreOccurrence, sensorSeverity } from '@/domain/intelligence'
import { cn } from '@/utils/cn'

const SEVERITY_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'attention', label: 'Atenção' },
  { value: 'alert', label: 'Alerta' },
  { value: 'critical', label: 'Crítico' },
]

function SensorDetail({ sensor, onClose }) {
  const severity = sensorSeverity(sensor)
  return (
    <Card className="animate-fade-up">
      <CardHeader
        icon={Cpu}
        title={sensor.shortName ?? sensor.name}
        description={`${sensor.id} · ${sensor.address}`}
        actions={
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-navy-800 hover:text-ink"
            aria-label="Fechar detalhes"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        }
      />
      <CardBody className="space-y-4 pt-4">
        <div className="flex flex-wrap gap-1.5">
          <SeverityBadge severity={severity} />
          <SensorStatusBadge status={sensor.status} />
          <SourceBadge source={sensor.source} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
            <p className="eyebrow text-[9px]">Nível</p>
            <p className="mt-1 font-mono text-lg font-semibold text-mist">{formatCm(sensor.levelCm)}</p>
          </div>
          <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
            <p className="eyebrow text-[9px]">Elevação</p>
            <p className="mt-1 font-mono text-lg font-semibold text-mist">{formatRate(sensor.rateCmPerMin)}</p>
          </div>
        </div>
        {Number.isFinite(sensor.levelCm) ? (
          <ProgressBar
            value={sensor.levelCm}
            max={thresholds.waterLevelCm.critical * 1.25}
            tone={severityMeta[severity].tone}
            label={`Limite crítico ${thresholds.waterLevelCm.critical} cm`}
            showValue
          />
        ) : null}
        <dl className="space-y-1.5 text-[10px]">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Coordenadas</dt>
            <dd className="font-mono text-ink">{formatCoordinates(sensor.position.lat, sensor.position.lng)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Última leitura</dt>
            <dd className="font-mono text-ink">
              {sensor.lastReadingAt ? formatRelativeTime(sensor.lastReadingAt) : '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Origem</dt>
            <dd className="font-mono text-ink">{sensor.source === 'simulation' ? 'simulação' : 'hardware'}</dd>
          </div>
        </dl>
        <InfoNotice variant={sensor.validated ? 'success' : 'warning'} title="Prova de conectividade">
          {sensor.connectivityProof}
        </InfoNotice>
        <Link to={`/sensores?selected=${sensor.id}`} className={buttonClass({ className: 'w-full' })}>
          Abrir diagnóstico do sensor
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </CardBody>
    </Card>
  )
}

function OccurrenceDetail({ occurrence, sensors, onClose }) {
  const priority = scoreOccurrence(occurrence, { sensors })
  const status = occurrenceStatusMeta[occurrence.status] ?? occurrenceStatusMeta.open
  return (
    <Card className="animate-fade-up">
      <CardHeader
        icon={MapPin}
        title={occurrence.title}
        description={`${occurrence.id} · ${occurrence.address}`}
        actions={
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-navy-800 hover:text-ink"
            aria-label="Fechar detalhes"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        }
      />
      <CardBody className="space-y-3.5 pt-4">
        <div className="flex flex-wrap gap-1.5">
          <SeverityBadge severity={occurrence.severity} />
          <Badge variant={status.tone}>{status.label}</Badge>
          <Badge variant="neutral">Demonstração</Badge>
        </div>
        <p className="text-[11px] leading-relaxed text-muted">{occurrence.description}</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
            <p className="eyebrow text-[9px]">Recorrência</p>
            <p className="mt-1 font-mono text-lg font-semibold text-mist">{occurrence.recurrenceCount}x</p>
          </div>
          <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
            <p className="eyebrow text-[9px]">Prioridade</p>
            <p className={cn('mt-1 font-mono text-lg font-semibold', severityMeta[priority.band].text)}>
              {priority.score}
            </p>
          </div>
        </div>
        <dl className="space-y-1.5 text-[10px]">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Registrado em</dt>
            <dd className="font-mono text-ink">{formatDateTime(occurrence.reportedAt)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Bairro</dt>
            <dd className="text-ink">{occurrence.neighborhood}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Sensor associado</dt>
            <dd className="font-mono text-ink">{occurrence.sensorId ?? 'não vinculado'}</dd>
          </div>
        </dl>
        <Link to={`/ocorrencias?selected=${occurrence.id}`} className={buttonClass({ className: 'w-full' })}>
          Abrir ocorrência
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </CardBody>
    </Card>
  )
}

export function MapPage() {
  const { snapshot, loading } = useData()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [searchParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState(() => searchParams.get('selected'))
  const [layers, setLayers] = useState({ sensors: true, occurrences: true })
  const [severityFilter, setSeverityFilter] = useState('all')
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 220)

  const sensors = useMemo(() => snapshot?.sensors ?? [], [snapshot])
  const occurrences = useMemo(() => snapshot?.occurrences ?? [], [snapshot])

  const { filteredSensors, filteredOccurrences, points, selectedSensor, selectedOccurrence } = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase()
    const sensorList = sensors.filter((sensor) => {
      const matchesQuery =
        !needle ||
        [sensor.name, sensor.shortName, sensor.id, sensor.neighborhood, sensor.address]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(needle))
      const matchesSeverity =
        severityFilter === 'all' || sensorSeverity(sensor) === severityFilter
      return matchesQuery && matchesSeverity
    })
    const occurrenceList = occurrences.filter((occurrence) => {
      const matchesQuery =
        !needle ||
        [occurrence.title, occurrence.id, occurrence.neighborhood, occurrence.address]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(needle))
      const matchesSeverity =
        severityFilter === 'all' || occurrence.severity === severityFilter
      return matchesQuery && matchesSeverity
    })
    const combined = [
      ...sensorList.map((sensor) => ({
        kind: 'sensor',
        id: sensor.id,
        severity: sensorSeverity(sensor),
        title: sensor.shortName ?? sensor.name,
        subtitle: `${sensor.id} · ${sensor.neighborhood}`,
        entity: sensor,
      })),
      ...occurrenceList.map((occurrence) => ({
        kind: 'occurrence',
        id: occurrence.id,
        severity: occurrence.severity,
        title: occurrence.title,
        subtitle: `${occurrence.neighborhood} · ${(occurrenceStatusMeta[occurrence.status] ?? occurrenceStatusMeta.open).label}`,
        entity: occurrence,
      })),
    ].sort((a, b) => severityRank(b.severity) - severityRank(a.severity))

    return {
      filteredSensors: sensorList,
      filteredOccurrences: occurrenceList,
      points: combined,
      selectedSensor: sensorList.find((sensor) => sensor.id === selectedId) ?? null,
      selectedOccurrence: occurrenceList.find((occurrence) => occurrence.id === selectedId) ?? null,
    }
  }, [debouncedQuery, occurrences, selectedId, sensors, severityFilter])

  const focus = useMemo(
    () => {
      const entity = selectedSensor ?? selectedOccurrence
      return entity?.position ? { position: entity.position } : null
    },
    [selectedOccurrence, selectedSensor],
  )

  if (loading && !snapshot) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-9 w-72" />
        <div className="skeleton h-16 w-full" />
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="skeleton h-[560px]" />
          <div className="skeleton h-[560px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operação · território demonstrativo"
        title="Mapa urbano"
        description="Sensores simulados, ocorrências demonstrativas e camadas de leitura territorial. Nenhum marcador representa dado oficial."
        meta={
          <>
            <Badge variant="cyan" size="sm">
              {filteredSensors.length} sensores
            </Badge>
            <Badge variant="warning" size="sm">
              {filteredOccurrences.length} ocorrências
            </Badge>
            <span className="font-mono text-[10px] text-muted">Santo André/SP · OSM + CARTO</span>
          </>
        }
        actions={
          <Link to="/ocorrencias?new=1" className={buttonClass()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova ocorrência
          </Link>
        }
      />

      <Card>
        <CardBody className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar ponto, bairro ou ID"
              aria-label="Buscar ponto no mapa"
              className="h-9 w-full rounded-lg border border-line bg-navy-950/60 pl-9 pr-3 text-xs text-ink placeholder:text-muted/70 focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-line bg-navy-950/50 p-1">
              <Layers className="ml-1.5 h-3.5 w-3.5 text-muted" aria-hidden="true" />
              <button
                type="button"
                aria-pressed={layers.sensors}
                onClick={() => setLayers((current) => ({ ...current, sensors: !current.sensors }))}
                className={cn(
                  'rounded-md px-2 py-1 text-[10px] font-medium transition',
                  layers.sensors ? 'bg-cyan/15 text-cyan-300' : 'text-muted hover:text-ink',
                )}
              >
                Sensores
              </button>
              <button
                type="button"
                aria-pressed={layers.occurrences}
                onClick={() => setLayers((current) => ({ ...current, occurrences: !current.occurrences }))}
                className={cn(
                  'rounded-md px-2 py-1 text-[10px] font-medium transition',
                  layers.occurrences ? 'bg-warning/15 text-warning' : 'text-muted hover:text-ink',
                )}
              >
                Ocorrências
              </button>
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-line bg-navy-950/50 p-1" role="group" aria-label="Filtrar por severidade">
              {SEVERITY_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={severityFilter === filter.value}
                  onClick={() => setSeverityFilter(filter.value)}
                  className={cn(
                    'rounded-md px-2 py-1 text-[10px] font-medium transition',
                    severityFilter === filter.value
                      ? 'bg-navy-700 text-ink'
                      : 'text-muted hover:text-ink',
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          <UrbanMap
            sensors={filteredSensors}
            occurrences={filteredOccurrences}
            layers={layers}
            height={isDesktop ? 560 : 410}
            focus={focus}
            onSensorSelect={(sensor) => setSelectedId(sensor.id)}
            onOccurrenceSelect={(occurrence) => setSelectedId(occurrence.id)}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-navy-900/50 px-3.5 py-2.5">
            <span className="flex items-center gap-2 font-mono text-[9px] text-muted">
              <Radio className="h-3 w-3 text-cyan" aria-hidden="true" />
              {layers.sensors ? 'camada de sensores ativa' : 'camada de sensores oculta'}
              <span className="text-line">·</span>
              {layers.occurrences ? 'camada de ocorrências ativa' : 'camada de ocorrências oculta'}
            </span>
            <span className="font-mono text-[9px] text-warning">
              dados simulados / demonstrativos
            </span>
          </div>
        </div>

        <aside className="space-y-4" aria-label="Detalhes e lista de pontos">
          {selectedSensor ? (
            <SensorDetail sensor={selectedSensor} onClose={() => setSelectedId(null)} />
          ) : selectedOccurrence ? (
            <OccurrenceDetail
              occurrence={selectedOccurrence}
              sensors={snapshot.sensors}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <Card>
              <CardHeader icon={MapPin} title="Pontos no mapa" description="Selecione um marcador ou um item da lista." />
              <CardBody className="pt-4">
                <InfoNotice variant="demo" title="Território de demonstração">
                  Coordenadas e registros são fictícios. Use as camadas e filtros para explorar a experiência.
                </InfoNotice>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader
              icon={Layers}
              title="Lista de pontos"
              description={`${points.length} item(ns) no filtro atual`}
              actions={
                selectedId ? (
                  <Button size="sm" variant="ghost" onClick={() => setSelectedId(null)}>
                    Limpar
                  </Button>
                ) : null
              }
            />
            <div className="max-h-[390px] overflow-y-auto">
              {points.length === 0 ? (
                <EmptyState
                  icon={Search}
                  compact
                  title="Nenhum ponto encontrado"
                  description="Ajuste a busca, a severidade ou as camadas ativas."
                />
              ) : (
                <ul className="divide-y divide-line">
                  {points.map((point) => {
                    const meta = severityMeta[point.severity]
                    return (
                      <li key={`${point.kind}-${point.id}`}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(point.id)}
                          className={cn(
                            'flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition hover:bg-navy-850/60',
                            selectedId === point.id && 'bg-cyan/[0.06]',
                          )}
                        >
                          <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-lg border', meta.bg, meta.border, meta.text)}>
                            {point.kind === 'sensor' ? (
                              <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11px] font-medium text-ink">{point.title}</span>
                            <span className="mt-0.5 block truncate font-mono text-[9px] text-muted">
                              {point.subtitle}
                            </span>
                          </span>
                          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', meta.dot)} />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}

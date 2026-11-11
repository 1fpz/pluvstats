import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Droplets, MapPin, ShieldAlert } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { UrbanMap } from '@/components/map/UrbanMap'
import { useData } from '@/hooks'
import { occurrenceTypeMeta, severityMeta } from '@/utils/severity'
import { formatRelativeTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const FILTERS = [
  { value: 'all', label: 'Tudo' },
  { value: 'attention', label: 'Atenção' },
  { value: 'alert', label: 'Alerta' },
  { value: 'critical', label: 'Crítico' },
]

export function CitizenMapPage() {
  const { snapshot, loading } = useData()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState('all')
  const [selectedRef, setSelectedRef] = useState(() => {
    const selected = searchParams.get('selected')
    return selected ? { kind: 'occurrence', id: selected } : null
  })

  const sensors = useMemo(() => snapshot?.sensors ?? [], [snapshot])
  const occurrences = useMemo(() => snapshot?.occurrences ?? [], [snapshot])

  const selected = useMemo(() => {
    if (!selectedRef) return null
    if (selectedRef.kind === 'sensor') {
      return sensors.find((sensor) => sensor.id === selectedRef.id) ?? null
    }
    return occurrences.find((occurrence) => occurrence.id === selectedRef.id) ?? null
  }, [occurrences, selectedRef, sensors])

  const selectSensor = (sensor) => setSelectedRef({ kind: 'sensor', id: sensor.id })
  const selectOccurrence = (occurrence) => setSelectedRef({ kind: 'occurrence', id: occurrence.id })
  const closeSelected = () => {
    setSelectedRef(null)
    if (searchParams.get('selected')) setSearchParams({}, { replace: true })
  }

  const filteredOccurrences = useMemo(() => {
    if (filter === 'all') return occurrences
    return occurrences.filter((occurrence) => occurrence.severity === filter)
  }, [filter, occurrences])

  if (loading && !snapshot) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-16" />
        <div className="skeleton h-[360px]" />
        <div className="skeleton h-48" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow text-cyan-300">Mapa demonstrativo</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-mist">Pontos de atenção</h1>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
          Sensores simulados e ocorrências fictícias. Toque em um ponto para ver detalhes no mapa.
        </p>
      </header>

      <UrbanMap
        sensors={sensors}
        occurrences={filteredOccurrences}
        height={340}
        onSensorSelect={selectSensor}
        onOccurrenceSelect={selectOccurrence}
        ariaLabel="Mapa demonstrativo de pontos de atenção em Santo André"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <SegmentedControl ariaLabel="Filtrar ocorrências por severidade" value={filter} onChange={setFilter} options={FILTERS} size="sm" />
        <span className="font-mono text-[9px] text-muted">{filteredOccurrences.length} ocorrência(s)</span>
      </div>

      {selected ? (
        <Card className="border-cyan/25">
          <CardHeader
            icon={MapPin}
            title={selected.title ?? selected.shortName ?? selected.name}
            description={selected.address ?? selected.neighborhood}
            actions={<button type="button" className="text-[10px] text-muted" onClick={closeSelected}>Fechar</button>}
          />
          <CardBody className="space-y-2 p-4 pt-3">
            <div className="flex flex-wrap gap-1.5">
              {selected.severity ? <SeverityBadge severity={selected.severity} size="xs" /> : null}
              {selected.alertSeverity ? <SeverityBadge severity={selected.alertSeverity} size="xs" /> : null}
              <Badge variant="neutral" size="xs">{selected.source === 'hardware' ? 'hardware' : 'demonstração'}</Badge>
            </div>
            <p className="text-[10px] leading-relaxed text-muted">
              {selected.description ?? selected.connectivityProof ?? 'Ponto demonstrativo sem descrição adicional.'}
            </p>
            <p className="font-mono text-[9px] text-muted">
              {selected.reportedAt
                ? `registrado ${formatRelativeTime(selected.reportedAt)}`
                : selected.lastReadingAt
                  ? `leitura ${formatRelativeTime(selected.lastReadingAt)}`
                  : 'sem leitura'}
            </p>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          icon={Droplets}
          title="Ocorrências no mapa"
          description="Lista demonstrativa por severidade e tipo."
          actions={<Badge variant="neutral" size="xs">{filteredOccurrences.length}</Badge>}
        />
        <CardBody className="space-y-2 p-4 pt-3">
          {filteredOccurrences.length === 0 ? (
            <EmptyState icon={ShieldAlert} compact title="Nenhum ponto neste filtro" description="Escolha outra severidade para consultar o mapa." />
          ) : (
            filteredOccurrences
              .slice()
              .sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt))
              .map((occurrence) => {
                const meta = severityMeta[occurrence.severity] ?? severityMeta.attention
                return (
                  <button
                    key={occurrence.id}
                    type="button"
                    onClick={() => selectOccurrence(occurrence)}
                    className="flex w-full items-start justify-between gap-3 rounded-lg border border-line bg-navy-950/40 p-3 text-left transition hover:border-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} aria-hidden="true" />
                        <span className="font-mono text-[9px] uppercase text-muted">{occurrenceTypeMeta[occurrence.type]?.label}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] font-medium text-ink">{occurrence.title}</p>
                      <p className="mt-0.5 truncate text-[9px] text-muted">{occurrence.neighborhood} · {formatRelativeTime(occurrence.reportedAt)}</p>
                    </div>
                    <SeverityBadge severity={occurrence.severity} size="xs" />
                  </button>
                )
              })
          )}
        </CardBody>
      </Card>

      <Link to="/cidadao/registrar" className="flex items-center justify-between gap-2 rounded-xl border border-cyan/25 bg-cyan/[0.06] p-3 text-[11px] font-medium text-cyan-300">
        Viu um problema de drenagem? Registre uma ocorrência.
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  )
}

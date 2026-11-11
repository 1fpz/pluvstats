import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import { ArrowUpRight } from 'lucide-react'
import { territory } from '@/config'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { MapLegend } from './MapLegend'
import { createDivIcon } from './mapIcons'
import { cn } from '@/utils/cn'
import { formatCm, formatRelativeTime } from '@/utils/formatters'

const STATUS_LABEL = {
  open: 'Aberta',
  in_progress: 'Em intervenção',
  resolved: 'Resolvida',
  validated: 'Validada',
  archived: 'Arquivada',
}

function FocusMap({ focus }) {
  const map = useMap()
  useEffect(() => {
    if (focus?.position) {
      map.flyTo([focus.position.lat, focus.position.lng], Math.max(map.getZoom(), 15), {
        duration: 0.8,
      })
    }
  }, [focus, map])
  return null
}

function SensorPopup({ sensor, onSelect }) {
  return (
    <div className="min-w-[190px]">
      <p className="text-[12px] font-semibold text-mist">{sensor.shortName ?? sensor.name}</p>
      <p className="mt-0.5 text-[10.5px] text-muted">{sensor.neighborhood}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <SeverityBadge severity={sensor.alertSeverity ?? 'normal'} size="xs" />
        <SourceBadge source={sensor.source} size="xs" />
      </div>
      <dl className="mt-2.5 space-y-1 text-[10.5px]">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Nível</dt>
          <dd className="font-medium tabular-nums text-ink">{formatCm(sensor.levelCm)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Última leitura</dt>
          <dd className="tabular-nums text-ink">
            {sensor.lastReadingAt ? formatRelativeTime(sensor.lastReadingAt) : '—'}
          </dd>
        </div>
      </dl>
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(sensor)}
          className="mt-3 inline-flex w-full items-center justify-between gap-2 rounded-md bg-white/[0.07] px-2.5 py-1.5 text-[10.5px] font-medium text-ink transition hover:bg-white/[0.11]"
        >
          Abrir detalhes
          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

function OccurrencePopup({ occurrence, onSelect }) {
  return (
    <div className="min-w-[200px]">
      <p className="text-[12px] font-semibold text-mist">{occurrence.title}</p>
      <p className="mt-0.5 text-[10.5px] text-muted">{occurrence.address}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <SeverityBadge severity={occurrence.severity} size="xs" />
        <span className="rounded-md border border-line bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-muted">
          {STATUS_LABEL[occurrence.status] ?? 'Arquivada'}
        </span>
      </div>
      <p className="mt-2 text-[10.5px] leading-relaxed text-muted">{occurrence.description}</p>
      <p className="mt-2 text-[9.5px] text-muted/70">
        {occurrence.reportedAt ? formatRelativeTime(occurrence.reportedAt) : ''} · demonstração
      </p>
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(occurrence)}
          className="mt-3 inline-flex w-full items-center justify-between gap-2 rounded-md bg-white/[0.07] px-2.5 py-1.5 text-[10.5px] font-medium text-ink transition hover:bg-white/[0.11]"
        >
          Abrir detalhes
          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

export function UrbanMap({
  sensors = [],
  occurrences = [],
  layers = { sensors: true, occurrences: true },
  height = 380,
  onSensorSelect,
  onOccurrenceSelect,
  focus = null,
  showLegend = true,
  className,
  ariaLabel = 'Mapa de Santo André com sensores e ocorrências demonstrativas',
}) {
  const visibleSensors = layers.sensors ? sensors : []
  const visibleOccurrences = layers.occurrences ? occurrences : []

  return (
    <div className={cn('relative overflow-hidden rounded-lg border border-line bg-[#0E1114]', className)}>
      <MapContainer
        center={territory.center}
        zoom={territory.zoom}
        scrollWheelZoom
        zoomControl={false}
        style={{ height, width: '100%' }}
        aria-label={ariaLabel}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          subdomains="abc"
          maxZoom={19}
        />
        <ZoomControl position="bottomright" />
        <FocusMap focus={focus} />
        {visibleSensors.map((sensor) => (
          <Marker
            key={`sensor-${sensor.id}`}
            position={[sensor.position.lat, sensor.position.lng]}
            icon={createDivIcon({
              kind: 'sensor',
              severity: sensor.alertSeverity ?? 'normal',
              pulse: sensor.alertSeverity === 'critical',
            })}
            eventHandlers={onSensorSelect ? { click: () => onSensorSelect(sensor) } : undefined}
          >
            <Popup>
              <SensorPopup sensor={sensor} onSelect={onSensorSelect} />
            </Popup>
          </Marker>
        ))}
        {visibleOccurrences.map((occurrence) => (
          <Marker
            key={`occurrence-${occurrence.id}`}
            position={[occurrence.position.lat, occurrence.position.lng]}
            icon={createDivIcon({
              kind: 'occurrence',
              severity: occurrence.severity,
              pulse: occurrence.severity === 'critical',
            })}
            eventHandlers={
              onOccurrenceSelect ? { click: () => onOccurrenceSelect(occurrence) } : undefined
            }
          >
            <Popup>
              <OccurrencePopup occurrence={occurrence} onSelect={onOccurrenceSelect} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute left-3 top-3 z-[500] flex flex-wrap items-center gap-1.5">
        <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#0B0D10]/85 px-2.5 py-1 text-[10px] font-medium text-ink backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" aria-hidden="true" />
          Santo André/SP
        </span>
        <span className="pointer-events-auto rounded-md border border-white/10 bg-[#0B0D10]/85 px-2.5 py-1 text-[10px] text-muted backdrop-blur-md">
          {visibleSensors.length} sensores · {visibleOccurrences.length} ocorrências
        </span>
      </div>

      {showLegend ? (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[500] hidden sm:block">
          <MapLegend />
        </div>
      ) : null}
    </div>
  )
}

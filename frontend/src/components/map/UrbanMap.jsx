import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import { ArrowUpRight, Cpu, Droplets, MapPin } from 'lucide-react'
import { territory } from '@/config'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { MapLegend } from './MapLegend'
import { createDivIcon } from './mapIcons'
import { cn } from '@/utils/cn'
import { formatCm, formatRelativeTime } from '@/utils/formatters'

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
      <p className="font-sans text-[11px] font-semibold text-mist">{sensor.shortName ?? sensor.name}</p>
      <p className="mt-0.5 text-[10px] text-slate-400">{sensor.neighborhood}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <SeverityBadge severity={sensor.alertSeverity ?? 'normal'} size="xs" />
        <SourceBadge source={sensor.source} size="xs" />
      </div>
      <dl className="mt-2 space-y-1 text-[10px] text-slate-300">
        <div className="flex justify-between gap-3">
          <dt>Nível</dt>
          <dd className="font-mono">{formatCm(sensor.levelCm)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Última leitura</dt>
          <dd className="font-mono">{sensor.lastReadingAt ? formatRelativeTime(sensor.lastReadingAt) : '—'}</dd>
        </div>
      </dl>
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(sensor)}
          className="mt-2.5 inline-flex w-full items-center justify-between gap-2 rounded-lg border border-cyan/25 bg-cyan/10 px-2.5 py-1.5 text-[10px] font-medium text-cyan-300 transition hover:bg-cyan/15"
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
      <p className="font-sans text-[11px] font-semibold text-mist">{occurrence.title}</p>
      <p className="mt-0.5 text-[10px] text-slate-400">{occurrence.address}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <SeverityBadge severity={occurrence.severity} size="xs" />
        <span className="rounded-full border border-line bg-navy-800/70 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-muted">
          {occurrence.status === 'open'
            ? 'Aberta'
            : occurrence.status === 'in_progress'
              ? 'Em intervenção'
              : occurrence.status === 'resolved'
                ? 'Resolvida'
                : occurrence.status === 'validated'
                  ? 'Validada'
                  : 'Arquivada'}
        </span>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{occurrence.description}</p>
      <p className="mt-2 font-mono text-[9px] text-slate-500">
        {occurrence.reportedAt ? formatRelativeTime(occurrence.reportedAt) : ''} · demonstração
      </p>
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(occurrence)}
          className="mt-2.5 inline-flex w-full items-center justify-between gap-2 rounded-lg border border-cyan/25 bg-cyan/10 px-2.5 py-1.5 text-[10px] font-medium text-cyan-300 transition hover:bg-cyan/15"
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
    <div className={cn('relative overflow-hidden rounded-xl border border-line bg-navy-950', className)}>
      <MapContainer
        center={territory.center}
        zoom={territory.zoom}
        scrollWheelZoom
        zoomControl={false}
        style={{ height, width: '100%' }}
        aria-label={ariaLabel}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
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

      <div className="pointer-events-none absolute left-3 top-3 z-[500] flex flex-wrap items-center gap-2">
        <span className="pointer-events-auto rounded-lg border border-line bg-navy-950/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-cyan-300 backdrop-blur-md">
          Santo André/SP · demo
        </span>
        <span className="pointer-events-auto rounded-lg border border-line bg-navy-950/85 px-2.5 py-1 font-mono text-[9px] text-muted backdrop-blur-md">
          {visibleSensors.length} sensores · {visibleOccurrences.length} ocorrências
        </span>
      </div>

      {showLegend ? (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[500] hidden sm:block">
          <MapLegend />
        </div>
      ) : null}

      <div className="pointer-events-none absolute right-3 top-3 z-[500] hidden items-center gap-1.5 rounded-lg border border-line bg-navy-950/85 px-2 py-1 text-[9px] text-muted backdrop-blur-md md:flex">
        <Cpu className="h-3 w-3 text-cyan" aria-hidden="true" />
        <Droplets className="h-3 w-3 text-petrol-400" aria-hidden="true" />
        <MapPin className="h-3 w-3 text-warning" aria-hidden="true" />
        Camadas demonstrativas
      </div>
    </div>
  )
}

import { Activity, BellRing, MapPin, Wrench } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatRelativeTime } from '@/utils/formatters'
import { severityMeta } from '@/utils/severity'
import { cn } from '@/utils/cn'

const KIND_ICON = {
  alert: BellRing,
  occurrence: MapPin,
  intervention: Wrench,
  simulation: Activity,
}

export function ActivityFeed({ activity = [], className, limit = 6 }) {
  return (
    <Card className={className}>
      <CardHeader icon={Activity} title="Atividade recente" description="Eventos do ambiente demonstrativo." />
      <CardBody padded={false} className="p-3">
        {activity.length === 0 ? (
          <EmptyState icon={Activity} compact title="Sem atividade" description="Os próximos eventos aparecerão aqui." />
        ) : (
          <ol className="relative space-y-0.5">
            {activity.slice(0, limit).map((event) => {
              const Icon = KIND_ICON[event.kind] ?? Activity
              const meta = severityMeta[event.severity] ?? severityMeta.normal
              return (
                <li key={event.id} className="group relative flex gap-2.5 rounded-lg px-1.5 py-2 transition hover:bg-navy-850/50">
                  <span className={cn('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border', meta.bg, meta.border, meta.text)}>
                    <Icon className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-medium leading-snug text-ink">{event.title}</p>
                      <span className="shrink-0 text-[9.5px] tabular-nums text-muted">{formatRelativeTime(event.at)}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-muted">{event.description}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <SourceBadge source={event.source} size="xs" showIcon={false} />
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </CardBody>
    </Card>
  )
}

import { Link } from 'react-router-dom'
import { ArrowUpRight, ListOrdered, MapPin } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { rankOccurrences } from '@/domain/intelligence'
import { severityMeta } from '@/utils/severity'
import { formatRelativeTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export function PriorityList({ occurrences = [], sensors = [], limit = 5, className }) {
  const ranked = rankOccurrences(
    occurrences.filter((occurrence) => !['resolved', 'archived'].includes(occurrence.status)),
    { sensors },
  ).slice(0, limit)

  return (
    <Card className={className}>
      <CardHeader
        icon={ListOrdered}
        title="Prioridade territorial"
        description="Pontuação experimental explicável: recorrência, severidade, atualidade e corroboração."
        actions={
          <Link
            to="/relatorios"
            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-cyan-300 hover:text-cyan-400"
          >
            Relatórios
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        }
      />
      <CardBody padded={false}>
        {ranked.length === 0 ? (
          <EmptyState icon={MapPin} compact title="Sem pontos ativos" description="Todas as ocorrências estão encerradas." />
        ) : (
          <ul className="divide-y divide-line">
            {ranked.map(({ occurrence, priority }, index) => {
              const meta = severityMeta[priority.band]
              return (
                <li key={occurrence.id}>
                  <Link
                    to={`/ocorrencias?selected=${occurrence.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-navy-850/60"
                  >
                    <span className="w-6 shrink-0 text-[10px] tabular-nums text-muted/60">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={cn('h-8 w-0.5 shrink-0 rounded-full', meta.dot)} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-ink">{occurrence.title}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted">
                        <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span className="truncate">{occurrence.neighborhood}</span>
                        <span className="text-line">·</span>
                        <span className="shrink-0">{occurrence.recurrenceCount}x</span>
                        <span className="hidden text-line sm:inline">·</span>
                        <span className="hidden shrink-0 sm:inline">{formatRelativeTime(occurrence.reportedAt)}</span>
                      </p>
                    </div>
                    <SeverityBadge severity={occurrence.severity} size="xs" className="hidden sm:inline-flex" />
                    <div className="w-10 shrink-0 text-right">
                      <p className={cn('text-sm font-semibold tabular-nums', meta.text)}>{priority.score}</p>
                      <p className="text-[8.5px] text-muted">prioridade</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </CardBody>
      <div className="border-t border-line px-4 py-2.5 text-[9px] leading-relaxed text-muted">
        Pontuação demonstrativa; não é classificação oficial de risco.
      </div>
    </Card>
  )
}

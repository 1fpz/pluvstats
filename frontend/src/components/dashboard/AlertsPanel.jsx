import { Link } from 'react-router-dom'
import { ArrowUpRight, BellRing, ShieldCheck } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { AlertItem } from '@/components/alerts/AlertItem'
import { EmptyState } from '@/components/ui/EmptyState'
import { severityRank } from '@/utils/severity'

export function AlertsPanel({ alerts = [], limit = 4, className }) {
  const active = alerts
    .filter((alert) => alert.status !== 'resolved')
    .sort(
      (a, b) =>
        severityRank(b.severity) - severityRank(a.severity) ||
        new Date(b.openedAt) - new Date(a.openedAt),
    )
  const visible = active.slice(0, limit)

  return (
    <Card className={className}>
      <CardHeader
        icon={BellRing}
        title="Central de alertas"
        description="Motor experimental · nível, elevação, comunicação e leitura inválida."
        actions={
          <Link
            to="/alertas"
            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-cyan-300 hover:text-cyan-400"
          >
            Ver todos
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        }
      />
      <CardBody padded={false} className="p-3">
        {visible.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            compact
            title="Nenhum alerta ativo"
            description="O motor não identificou condições acima dos limites no ciclo atual."
          />
        ) : (
          <div className="space-y-2">
            {visible.map((alert) => (
              <AlertItem key={alert.id} alert={alert} compact />
            ))}
          </div>
        )}
      </CardBody>
      <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-2.5">
        <span className="font-mono text-[9px] text-muted">
          {active.length} ativo(s) · todos identificados por origem
        </span>
        <span className="font-mono text-[9px] text-cyan-300">histerese ativa</span>
      </div>
    </Card>
  )
}

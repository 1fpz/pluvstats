import { Link } from 'react-router-dom'
import { ArrowUpRight, CloudRain, Cpu, Database, MapPin } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatRelativeTime } from '@/utils/formatters'

function Row({ icon: Icon, label, value, badge, tone = 'cyan' }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-start gap-2">
        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-ink">{label}</p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-muted">{value}</p>
        </div>
      </div>
      {badge ? (
        <Badge variant={tone} size="xs">
          {badge}
        </Badge>
      ) : null}
    </div>
  )
}

export function OriginPanel({ snapshot, className }) {
  const simulated = snapshot?.sensors?.filter((sensor) => sensor.source === 'simulation').length ?? 0
  const hardware = snapshot?.sensors?.filter((sensor) => sensor.source === 'hardware').length ?? 0
  const validated = snapshot?.sensors?.filter((sensor) => sensor.validated).length ?? 0

  return (
    <Card className={className}>
      <CardHeader
        icon={Database}
        title="Origem dos dados"
        description="Cada camada é identificada individualmente."
        actions={
          <Link
            to="/diagnostico"
            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-cyan-300 hover:text-cyan-400"
          >
            Diagnóstico
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        }
      />
      <CardBody className="divide-y divide-line py-0">
        <Row
          icon={Cpu}
          label="Sensores"
          value={`${simulated} em simulação · ${hardware} dispositivo(s) de hardware registrado(s).`}
          badge={validated > 0 ? `${validated} validado(s)` : 'sem hardware validado'}
          tone={validated > 0 ? 'success' : 'warning'}
        />
        <Row
          icon={MapPin}
          label="Ocorrências"
          value="Registros demonstrativos, sem dados pessoais e sem vínculo oficial."
          badge="demonstração"
          tone="cyan"
        />
        <Row
          icon={CloudRain}
          label="Meteorologia"
          value="Open-Meteo, consultada separadamente das leituras dos sensores."
          badge="externo"
          tone="neutral"
        />
      </CardBody>
      <div className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-[9px] text-muted">
        <span>Atualizado {formatRelativeTime(snapshot?.updatedAt)}</span>
        <span>{snapshot?.sourceKind === 'api' ? 'API' : 'runtime local'}</span>
      </div>
    </Card>
  )
}

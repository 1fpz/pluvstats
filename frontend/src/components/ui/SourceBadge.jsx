import { Cpu, FlaskConical, Radio } from 'lucide-react'
import { Badge } from './Badge'
import { cn } from '@/utils/cn'

export function SourceBadge({ source, size = 'xs', showIcon = true, className }) {
  const simulated = source === 'simulation'
  return (
    <Badge variant={simulated ? 'cyan' : 'success'} size={size} className={cn('gap-1', className)}>
      {showIcon ? simulated ? <FlaskConical className="h-3 w-3" aria-hidden="true" /> : <Cpu className="h-3 w-3" aria-hidden="true" /> : null}
      {simulated ? 'Simulado' : 'Hardware'}
    </Badge>
  )
}

export function HardwareStateBadge({ validated, hasReading, className }) {
  if (validated) {
    return (
      <Badge variant="success" size="xs" dot className={className}>
        Hardware validado
      </Badge>
    )
  }
  return (
    <Badge variant="warning" size="xs" className={cn('gap-1', className)}>
      <Radio className="h-3 w-3" aria-hidden="true" />
      {hasReading ? 'Aguardando validação' : 'Sem leitura física'}
    </Badge>
  )
}

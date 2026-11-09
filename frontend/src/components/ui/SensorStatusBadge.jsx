import { Badge } from './Badge'
import { sensorStatusMeta } from '@/utils/severity'

export function SensorStatusBadge({ status = 'simulation_paused', size = 'xs', className }) {
  const meta = sensorStatusMeta[status] ?? sensorStatusMeta.simulation_unavailable
  return (
    <Badge variant={meta.tone} size={size} dot pulse={status === 'simulation_active'} className={className}>
      {meta.label}
    </Badge>
  )
}

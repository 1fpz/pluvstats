import { Badge } from './Badge'
import { severityMeta } from '@/utils/severity'

export function SeverityBadge({ severity = 'normal', size = 'sm', pulse = false, className }) {
  const meta = severityMeta[severity] ?? severityMeta.normal
  return (
    <Badge variant={meta.tone} size={size} dot pulse={pulse} className={className}>
      {meta.label}
    </Badge>
  )
}

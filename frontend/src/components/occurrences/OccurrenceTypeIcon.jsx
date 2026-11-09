import { AlertTriangle, CircleHelp, Construction, Droplets, Waves } from 'lucide-react'

const ICONS = {
  flooding: Waves,
  waterlogging: Droplets,
  drainage: Construction,
  overflow: AlertTriangle,
  other: CircleHelp,
}

export function OccurrenceTypeIcon({ type = 'other', className }) {
  const Icon = ICONS[type] ?? CircleHelp
  return <Icon className={className} aria-hidden="true" />
}

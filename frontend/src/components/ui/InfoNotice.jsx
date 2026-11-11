import { AlertTriangle, Info, ShieldCheck } from 'lucide-react'
import { cn } from '@/utils/cn'

const variants = {
  info: {
    icon: Info,
    className: 'border-cyan/20 bg-cyan/[0.05]',
    iconClass: 'text-cyan-300',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-warning/20 bg-warning/[0.05]',
    iconClass: 'text-warning',
  },
  critical: {
    icon: AlertTriangle,
    className: 'border-critical/20 bg-critical/[0.05]',
    iconClass: 'text-critical',
  },
  success: {
    icon: ShieldCheck,
    className: 'border-success/20 bg-success/[0.05]',
    iconClass: 'text-success',
  },
  demo: {
    icon: Info,
    className: 'border-line bg-white/[0.03]',
    iconClass: 'text-muted',
  },
}

export function InfoNotice({ variant = 'info', title, children, icon, className }) {
  const meta = variants[variant] ?? variants.info
  const Icon = icon ?? meta.icon
  return (
    <div className={cn('flex gap-3 rounded-lg border px-3.5 py-3', meta.className, className)}>
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', meta.iconClass)} aria-hidden="true" />
      <div className="min-w-0 text-xs leading-relaxed">
        {title ? <p className="font-semibold text-ink">{title}</p> : null}
        <div className={cn(title && 'mt-1', 'text-muted')}>{children}</div>
      </div>
    </div>
  )
}

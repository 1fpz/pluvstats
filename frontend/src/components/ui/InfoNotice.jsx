import { AlertTriangle, Info, ShieldCheck, Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'

const variants = {
  info: {
    icon: Info,
    className: 'border-cyan/25 bg-cyan/[0.06] text-cyan-300',
    iconClass: 'text-cyan-300',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-warning/25 bg-warning/[0.06] text-warning',
    iconClass: 'text-warning',
  },
  critical: {
    icon: AlertTriangle,
    className: 'border-critical/25 bg-critical/[0.06] text-critical',
    iconClass: 'text-critical',
  },
  success: {
    icon: ShieldCheck,
    className: 'border-success/25 bg-success/[0.06] text-success',
    iconClass: 'text-success',
  },
  demo: {
    icon: Sparkles,
    className: 'border-cyan/25 bg-cyan/[0.06] text-cyan-300',
    iconClass: 'text-cyan-300',
  },
}

export function InfoNotice({ variant = 'info', title, children, icon, className }) {
  const meta = variants[variant] ?? variants.info
  const Icon = icon ?? meta.icon
  return (
    <div className={cn('flex gap-3 rounded-xl border px-4 py-3', meta.className, className)}>
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', meta.iconClass)} aria-hidden="true" />
      <div className="min-w-0 text-xs leading-relaxed">
        {title ? <p className="font-semibold text-ink">{title}</p> : null}
        <div className={cn(title && 'mt-1', 'text-muted')}>{children}</div>
      </div>
    </div>
  )
}

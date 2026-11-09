import { AlertTriangle, ArrowRight, CheckCircle2, FlaskConical, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useOperationMode } from '@/hooks'
import { cn } from '@/utils/cn'

export function DemoBanner() {
  const { mode, hasValidatedHardware, demoLabel, hardwareAbsenceMessage } = useOperationMode()
  const demo = mode === 'demo' || !hasValidatedHardware

  if (!demo) {
    return (
      <div className="border-b border-success/20 bg-success/[0.06]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-[11px] sm:px-6">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
          <span className="font-mono font-semibold uppercase tracking-[0.12em] text-success">
            Operação com hardware validado
          </span>
          <span className="text-muted">Ao menos um dispositivo comprovou leitura física recente.</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('border-b border-cyan/20 bg-cyan/[0.07]')}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-[11px] sm:px-6">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
        </span>
        <span className="font-mono font-semibold uppercase tracking-[0.14em] text-cyan-300">{demoLabel}</span>
        <span className="hidden text-muted sm:inline">
          {hasValidatedHardware ? hardwareAbsenceMessage : 'Nenhum sensor físico validado. A experiência é funcional e demonstrativa.'}
        </span>
        <Link
          to="/diagnostico"
          className="ml-auto inline-flex items-center gap-1 font-medium text-cyan-300 transition hover:text-cyan-400"
        >
          Diagnóstico
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

export function ModeIcon({ className }) {
  const { mode } = useOperationMode()
  if (mode === 'demo') return <FlaskConical className={className} aria-hidden="true" />
  return <ShieldAlert className={className} aria-hidden="true" />
}

export function DemoBadgeInline({ label = 'Simulado' }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-cyan/25 bg-cyan/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-cyan-300">
      <FlaskConical className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  )
}

export function WarningIcon() {
  return <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
}

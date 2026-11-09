import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BellRing, Menu } from 'lucide-react'
import { pageTitles } from '@/app/navigation'
import { Badge } from '@/components/ui/Badge'
import { useData, useOperationMode, useSimulation } from '@/hooks'
import { formatTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export function Topbar({ onMenuOpen }) {
  const location = useLocation()
  const { snapshot } = useData()
  const { connection } = useOperationMode()
  const { isRunning, scenarioMeta, lastTickAt } = useSimulation()
  const meta = pageTitles[location.pathname] ?? { section: 'PLUVSTATS', title: 'Plataforma' }
  const alerts = snapshot?.counts?.activeAlerts ?? 0

  useEffect(() => {
    document.title = `${meta.title} · PLUVSTATS`
  }, [meta.title])

  return (
    <div className="flex h-16 items-center gap-3 border-b border-line bg-abyss/85 px-4 backdrop-blur-xl sm:px-6">
      <button
        type="button"
        onClick={onMenuOpen}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-muted transition hover:border-cyan/30 hover:text-ink lg:hidden"
        aria-label="Abrir menu de navegação"
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted sm:flex">
          {meta.section}
          <span className="text-line">/</span>
          <span className="text-cyan-300">Santo André/SP</span>
        </p>
        <h2 className="truncate font-display text-sm font-semibold text-mist">{meta.title}</h2>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <div className="flex items-center gap-2 rounded-full border border-line bg-navy-900/70 px-3 py-1.5">
          <span className="relative flex h-1.5 w-1.5">
            {isRunning ? (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-70" />
            ) : null}
            <span className={cn('relative h-1.5 w-1.5 rounded-full', isRunning ? 'bg-cyan' : 'bg-warning')} />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
            {isRunning ? 'Simulação ativa' : 'Simulação pausada'}
          </span>
          <span className="text-line">·</span>
          <span className="font-mono text-[10px] text-cyan-300">{scenarioMeta.label}</span>
          <span className="hidden text-[10px] text-muted xl:inline">
            {lastTickAt ? formatTime(lastTickAt) : '—'}
          </span>
        </div>
      </div>

      <Badge variant={connection.isDemo ? 'cyan' : 'success'} size="sm" className="hidden sm:inline-flex">
        {connection.isDemo ? 'Demo' : 'API'}
      </Badge>

      <Link
        to="/alertas"
        className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-muted transition hover:border-cyan/30 hover:text-ink"
        aria-label={`Central de alertas, ${alerts} ativo(s)`}
      >
        <BellRing className="h-4 w-4" aria-hidden="true" />
        {alerts > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-critical px-1 font-mono text-[9px] font-bold text-white">
            {alerts > 9 ? '9+' : alerts}
          </span>
        ) : null}
      </Link>

      <div className="hidden items-center gap-2 border-l border-line pl-3 sm:flex">
        <div className="grid h-8 w-8 place-items-center rounded-full border border-cyan/25 bg-cyan/10 font-mono text-[10px] font-bold text-cyan-300">
          GT
        </div>
        <div className="hidden leading-tight xl:block">
          <p className="text-[11px] font-medium text-ink">Gestão técnica</p>
          <p className="text-[9px] text-muted">Perfil de demonstração</p>
        </div>
      </div>
    </div>
  )
}

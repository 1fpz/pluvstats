import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BellRing, Menu } from 'lucide-react'
import { pageTitles } from '@/app/navigation'
import { DemoIndicator } from '@/components/layout/DemoIndicator'
import { useData, useSimulation } from '@/hooks'
import { formatTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export function Topbar({ onMenuOpen }) {
  const location = useLocation()
  const { snapshot } = useData()
  const { isRunning, scenarioMeta, lastTickAt } = useSimulation()
  const meta = pageTitles[location.pathname] ?? { section: 'PLUVSTATS', title: 'Plataforma' }
  const alerts = snapshot?.counts?.activeAlerts ?? 0

  useEffect(() => {
    document.title = `${meta.title} · PLUVSTATS`
  }, [meta.title])

  return (
    <div className="flex h-16 items-center gap-3 border-b border-line bg-[#0B0D10]/95 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenuOpen}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted transition hover:bg-white/[0.06] hover:text-ink lg:hidden"
        aria-label="Abrir menu de navegação"
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="hidden text-[10.5px] font-medium text-muted sm:block">
          {meta.section}
          <span className="mx-1.5 text-white/15">/</span>
          <span className="text-muted/80">Santo André/SP</span>
        </p>
        <h2 className="truncate text-[13.5px] font-semibold text-mist sm:mt-0.5">{meta.title}</h2>
      </div>

      <div className="hidden items-center gap-2 text-[11px] text-muted lg:flex">
        <span
          className={cn('h-1.5 w-1.5 rounded-full', isRunning ? 'bg-cyan' : 'bg-warning')}
          aria-hidden="true"
        />
        <span>{isRunning ? 'Simulação ativa' : 'Simulação pausada'}</span>
        <span className="text-white/15">·</span>
        <span className="text-ink/80">{scenarioMeta.label}</span>
        {lastTickAt ? (
          <>
            <span className="text-white/15">·</span>
            <span className="tabular-nums">{formatTime(lastTickAt)}</span>
          </>
        ) : null}
      </div>

      <DemoIndicator compact />

      <Link
        to="/alertas"
        className="relative grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted transition hover:bg-white/[0.06] hover:text-ink"
        aria-label={`Central de alertas, ${alerts} ativo(s)`}
      >
        <BellRing className="h-4 w-4" aria-hidden="true" />
        {alerts > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-critical px-1 text-[9px] font-semibold tabular-nums text-white">
            {alerts > 9 ? '9+' : alerts}
          </span>
        ) : null}
      </Link>

      <div className="hidden items-center gap-2.5 border-l border-line pl-3 sm:flex">
        <div className="grid h-7 w-7 place-items-center rounded-md border border-line bg-white/[0.04] text-[10px] font-semibold text-ink">
          GT
        </div>
        <div className="hidden leading-tight xl:block">
          <p className="text-[11px] font-medium text-ink">Gestão técnica</p>
          <p className="text-[10px] text-muted">Perfil de demonstração</p>
        </div>
      </div>
    </div>
  )
}

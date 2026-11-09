import { NavLink, Link } from 'react-router-dom'
import { FlaskConical, X, ArrowUpRight, CircleDot } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Badge } from '@/components/ui/Badge'
import { navigationSections } from '@/app/navigation'
import { useData, useOperationMode, useSimulation } from '@/hooks'
import { cn } from '@/utils/cn'
import { formatRelativeTime } from '@/utils/formatters'

export function Sidebar({ open, onClose }) {
  const { snapshot, loading } = useData()
  const { connection } = useOperationMode()
  const { isRunning, scenarioMeta } = useSimulation()
  const counts = snapshot?.counts ?? {}

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-abyss/70 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-line bg-navy-950/95 backdrop-blur-xl transition-[transform,visibility] duration-300 lg:visible lg:translate-x-0',
          open ? 'visible translate-x-0' : 'invisible -translate-x-full',
        )}
        aria-label="Navegação principal"
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Link to="/" className="rounded-lg" aria-label="PLUVSTATS — início">
            <Logo size={34} />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-navy-800 hover:text-ink lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Seções">
          {navigationSections.map((section) => (
            <div key={section.label} className="mb-5">
              <p className="eyebrow px-2.5 pb-1.5">{section.label}</p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition',
                          isActive
                            ? 'bg-cyan/10 text-mist shadow-[inset_0_0_0_1px_rgba(0,166,204,0.18)]'
                            : 'text-muted hover:bg-navy-850 hover:text-ink',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={cn(
                              'h-4 w-4 shrink-0 transition',
                              isActive ? 'text-cyan' : 'text-muted group-hover:text-cyan-300',
                            )}
                            aria-hidden="true"
                          />
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badgeKey && counts[item.badgeKey] > 0 ? (
                            <span
                              className={cn(
                                'rounded-full px-1.5 py-0.5 font-mono text-[10px]',
                                counts.criticalAlerts > 0
                                  ? 'bg-critical/15 text-critical'
                                  : 'bg-warning/15 text-warning',
                              )}
                            >
                              {counts[item.badgeKey]}
                            </span>
                          ) : null}
                          {isActive ? <span className="h-1 w-1 rounded-full bg-cyan" /> : null}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mb-4 rounded-xl border border-cyan/15 bg-cyan/[0.04] p-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
              <p className="text-[11px] font-semibold text-cyan-300">Área do cidadão</p>
            </div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-muted">
              Experiência mobile-first para consultar pontos e registrar ocorrências.
            </p>
            <Link
              to="/cidadao"
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-cyan-300 hover:text-cyan-400"
            >
              Abrir experiência
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </nav>

        <div className="border-t border-line p-3">
          <div className="rounded-xl border border-line bg-navy-900/80 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="eyebrow">Fonte de dados</span>
              <Badge variant={connection.isDemo ? 'cyan' : 'success'} size="xs">
                {connection.isDemo ? 'Simulado' : 'API'}
              </Badge>
            </div>
            <p className="mt-1.5 truncate text-xs font-medium text-ink">{connection.message}</p>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted">
              <CircleDot className={cn('h-3 w-3', isRunning ? 'text-cyan' : 'text-warning')} aria-hidden="true" />
              {loading
                ? 'Inicializando simulação'
                : `${isRunning ? 'Simulação ativa' : 'Simulação pausada'} · ${scenarioMeta.label}`}
            </div>
            <p className="mt-1 font-mono text-[10px] text-muted">
              {snapshot?.updatedAt ? `Atualizado ${formatRelativeTime(snapshot.updatedAt)}` : 'Sem atualização'}
            </p>
            <Link to="/diagnostico" className="link-quiet mt-2 inline-block text-[10px] font-medium">
              Abrir diagnóstico →
            </Link>
          </div>
          <p className="px-1 pt-3 text-[9px] leading-relaxed text-muted/70">
            PLUVSTATS · protótipo acadêmico
            <br />
            Sem vínculo oficial com órgãos públicos.
          </p>
        </div>
      </aside>
    </>
  )
}

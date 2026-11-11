import { NavLink, Link } from 'react-router-dom'
import { ArrowUpRight, X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
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
          'fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[268px] flex-col border-r border-line bg-[#0B0D10] transition-[transform,visibility] duration-300 lg:visible lg:translate-x-0',
          open ? 'visible translate-x-0' : 'invisible -translate-x-full',
        )}
        aria-label="Navegação principal"
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Link to="/" className="rounded-md" aria-label="PLUVSTATS — início">
            <Logo size={30} />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-white/[0.06] hover:text-ink lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Seções">
          {navigationSections.map((section) => (
            <div key={section.label} className="mb-5">
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.11em] text-muted/70">
                {section.label}
              </p>
              <ul className="space-y-px">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex h-8 items-center gap-2.5 rounded-md px-3 text-[13px] font-medium transition',
                          isActive
                            ? 'bg-white/[0.06] text-mist'
                            : 'text-muted hover:bg-white/[0.035] hover:text-ink',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={cn(
                              'absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-cyan-300 transition-opacity',
                              isActive ? 'opacity-100' : 'opacity-0',
                            )}
                            aria-hidden="true"
                          />
                          <item.icon
                            className={cn(
                              'h-[15px] w-[15px] shrink-0 transition',
                              isActive ? 'text-cyan-300' : 'text-muted/80 group-hover:text-ink',
                            )}
                            aria-hidden="true"
                          />
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badgeKey && counts[item.badgeKey] > 0 ? (
                            <span
                              className={cn(
                                'min-w-4 rounded px-1 text-center text-[10px] font-semibold tabular-nums',
                                counts.criticalAlerts > 0
                                  ? 'bg-critical/15 text-critical'
                                  : 'bg-warning/15 text-warning',
                              )}
                            >
                              {counts[item.badgeKey]}
                            </span>
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <Link
            to="/diagnostico"
            className="block rounded-lg border border-line bg-white/[0.02] p-3 transition hover:border-white/[0.13] hover:bg-white/[0.04]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11.5px] font-semibold text-ink">Ambiente demonstrativo</span>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" />
            </div>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
              Dados simulados · nenhum sensor físico validado
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-muted">
              <span
                className={cn('h-1.5 w-1.5 rounded-full', isRunning ? 'bg-cyan' : 'bg-warning')}
                aria-hidden="true"
              />
              {loading
                ? 'Inicializando simulação'
                : `${isRunning ? 'Simulação ativa' : 'Pausada'} · ${scenarioMeta.label}`}
              <span className="text-white/15">·</span>
              <span className="truncate">{connection.isDemo ? 'local' : 'API'}</span>
            </div>
            <p className="mt-1 text-[10px] text-muted/70">
              {snapshot?.updatedAt ? `Atualizado ${formatRelativeTime(snapshot.updatedAt)}` : 'Sem atualização'}
            </p>
          </Link>

          <div className="mt-2 flex items-center justify-between px-1">
            <Link
              to="/cidadao"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted transition hover:text-ink"
            >
              Área do cidadão
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </Link>
            <span className="text-[9.5px] text-muted/60">v0.1</span>
          </div>
        </div>
      </aside>
    </>
  )
}

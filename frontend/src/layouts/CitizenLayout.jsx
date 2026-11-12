import { Suspense, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Home, Info, Map, PlusCircle, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { DemoIndicator } from '@/components/layout/DemoIndicator'
import { LoadingBlock } from '@/components/ui/Loading'
import { cn } from '@/utils/cn'

const items = [
  { to: '/cidadao', label: 'Início', icon: Home, end: true, title: 'Início' },
  { to: '/cidadao/mapa', label: 'Mapa', icon: Map, title: 'Mapa' },
  { to: '/cidadao/registrar', label: 'Registrar', icon: PlusCircle, title: 'Registrar ocorrência' },
  { to: '/cidadao/informacoes', label: 'Orientações', icon: Info, title: 'Orientações' },
]

export function CitizenLayout() {
  const location = useLocation()
  const current = items.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)))

  useEffect(() => {
    document.title = `${current?.title ?? 'Área do cidadão'} · Área do cidadão · PLUVSTATS`
    window.scrollTo(0, 0)
  }, [current?.title, location.pathname])

  return (
    <div className="min-h-screen bg-abyss pb-20 sm:pb-0">
      <a href="#citizen-content" className="skip-link">
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-[#0B0D10]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
          <Link to="/cidadao" className="rounded-md" aria-label="PLUVSTATS cidadão">
            <Logo size={28} />
          </Link>
          <div className="flex items-center gap-2">
            <DemoIndicator compact />
            <Link
              to="/"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line px-3 text-[11px] font-medium text-muted transition hover:border-white/[0.14] hover:text-ink"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Área do gestor</span>
              <span className="sm:hidden">Gestor</span>
            </Link>
          </div>
        </div>
      </header>

      <main id="citizen-content" className="citizen-readable mx-auto w-full max-w-3xl px-4 py-5 sm:py-8">
        <Suspense fallback={<LoadingBlock label="Carregando página" className="min-h-[40vh]" />}>
          <Outlet />
        </Suspense>
      </main>

      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[#0B0D10]/95 backdrop-blur-md sm:hidden"
        aria-label="Navegação do cidadão"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-4">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'relative flex flex-col items-center gap-1 px-2 py-3 text-[11px] font-medium transition',
                    isActive ? 'text-ink' : 'text-muted',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'absolute top-0 h-[2px] w-8 rounded-full bg-cyan-300 transition-opacity',
                        isActive ? 'opacity-100' : 'opacity-0',
                      )}
                      aria-hidden="true"
                    />
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <footer className="mx-auto max-w-3xl px-4 pb-6 pt-2 text-center text-[9.5px] leading-relaxed text-muted/70 sm:pb-10">
        Protótipo acadêmico · dados demonstrativos.
        <br />
        {location.pathname === '/cidadao' ? 'Não substitui canais oficiais de emergência.' : ''}
      </footer>
    </div>
  )
}

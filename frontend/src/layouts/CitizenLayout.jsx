import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Home, Info, Map, PlusCircle, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { DemoBanner } from '@/components/layout/DemoBanner'
import { cn } from '@/utils/cn'

const items = [
  { to: '/cidadao', label: 'Início', icon: Home, end: true },
  { to: '/cidadao/mapa', label: 'Mapa', icon: Map },
  { to: '/cidadao/registrar', label: 'Registrar', icon: PlusCircle },
  { to: '/cidadao/informacoes', label: 'Orientações', icon: Info },
]

export function CitizenLayout() {
  const location = useLocation()
  return (
    <div className="min-h-screen bg-abyss pb-20 sm:pb-0">
      <a href="#citizen-content" className="skip-link">
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-abyss/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/cidadao" className="rounded-lg" aria-label="PLUVSTATS cidadão">
            <Logo size={30} />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted transition hover:border-cyan/30 hover:text-cyan-300"
          >
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            Área do gestor
          </Link>
        </div>
        <DemoBanner />
      </header>

      <main id="citizen-content" className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-8">
        <Outlet />
      </main>

      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-navy-950/95 backdrop-blur-xl sm:hidden"
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
                    'flex flex-col items-center gap-1 px-2 py-2.5 text-[9px] font-medium transition',
                    isActive ? 'text-cyan-300' : 'text-muted',
                  )
                }
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <footer className="mx-auto max-w-3xl px-4 pb-6 pt-2 text-center text-[9px] leading-relaxed text-muted sm:pb-10">
        Protótipo acadêmico · dados demonstrativos.
        <br />
        {location.pathname === '/cidadao' ? 'Não substitui canais oficiais de emergência.' : ''}
      </footer>
    </div>
  )
}

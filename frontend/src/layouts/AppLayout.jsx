import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { DemoBanner } from '@/components/layout/DemoBanner'
import { territory } from '@/config'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 lg:pl-[272px]">
        <header className="sticky top-0 z-30">
          <Topbar onMenuOpen={() => setSidebarOpen(true)} />
          <DemoBanner />
        </header>
        <main id="main-content" className="mx-auto w-full max-w-[1580px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
        <footer className="mx-auto flex w-full max-w-[1580px] flex-col gap-2 border-t border-line px-4 py-6 text-[10px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            <span className="font-display font-semibold tracking-wide text-ink">PLUV</span>
            <span className="font-display font-semibold tracking-wide text-cyan">STATS</span>
            <span className="mx-2 text-line">·</span>
            Protótipo acadêmico experimental · {territory.name}
          </p>
          <p className="max-w-2xl leading-relaxed">
            {territory.disclaimer} A plataforma não prevê enchentes com precisão e não substitui órgãos públicos.
          </p>
        </footer>
      </div>
    </div>
  )
}

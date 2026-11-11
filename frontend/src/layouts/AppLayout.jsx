import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { LoadingBlock } from '@/components/ui/Loading'
import { territory } from '@/config'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 lg:pl-[268px]">
        <header className="sticky top-0 z-30">
          <Topbar onMenuOpen={() => setSidebarOpen(true)} />
        </header>
        <main id="main-content" className="mx-auto w-full max-w-[1560px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Suspense fallback={<LoadingBlock label="Carregando página" className="min-h-[50vh]" />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="mx-auto w-full max-w-[1560px] px-4 pb-8 text-[10.5px] leading-relaxed text-muted/70 sm:px-6 lg:px-8">
          PLUVSTATS · protótipo acadêmico experimental · {territory.name}
          <span className="mx-1.5 text-white/15">·</span>
          coordenadas demonstrativas, sem vínculo oficial com órgãos públicos.
        </footer>
      </div>
    </div>
  )
}

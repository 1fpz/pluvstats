import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppProviders } from './providers'
import { AppLayout } from '@/layouts/AppLayout'
import { CitizenLayout } from '@/layouts/CitizenLayout'
import { LoadingBlock } from '@/components/ui/Loading'

// Route-level splitting keeps the first paint independent from the mapping and
// charting stacks, which are only needed on a few screens.
const OverviewPage = lazy(() => import('@/pages/OverviewPage').then((m) => ({ default: m.OverviewPage })))
const MapPage = lazy(() => import('@/pages/MapPage').then((m) => ({ default: m.MapPage })))
const OccurrencesPage = lazy(() => import('@/pages/OccurrencesPage').then((m) => ({ default: m.OccurrencesPage })))
const SensorsPage = lazy(() => import('@/pages/SensorsPage').then((m) => ({ default: m.SensorsPage })))
const AlertsPage = lazy(() => import('@/pages/AlertsPage').then((m) => ({ default: m.AlertsPage })))
const InterventionsPage = lazy(() => import('@/pages/InterventionsPage').then((m) => ({ default: m.InterventionsPage })))
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })))
const DiagnosticsPage = lazy(() => import('@/pages/DiagnosticsPage').then((m) => ({ default: m.DiagnosticsPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const CitizenHomePage = lazy(() => import('@/pages/citizen/CitizenHomePage').then((m) => ({ default: m.CitizenHomePage })))
const CitizenMapPage = lazy(() => import('@/pages/citizen/CitizenMapPage').then((m) => ({ default: m.CitizenMapPage })))
const CitizenReportPage = lazy(() => import('@/pages/citizen/CitizenReportPage').then((m) => ({ default: m.CitizenReportPage })))
const CitizenInfoPage = lazy(() => import('@/pages/citizen/CitizenInfoPage').then((m) => ({ default: m.CitizenInfoPage })))
const NotFoundPage = lazy(() => import('@/pages/ComingSoonPage').then((m) => ({ default: m.NotFoundPage })))

function RouteFallback() {
  return <LoadingBlock label="Carregando página" className="min-h-[50vh]" />
}

export default function App() {
  return (
    <AppProviders>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="mapa" element={<MapPage />} />
            <Route path="ocorrencias" element={<OccurrencesPage />} />
            <Route path="sensores" element={<SensorsPage />} />
            <Route path="alertas" element={<AlertsPage />} />
            <Route path="intervencoes" element={<InterventionsPage />} />
            <Route path="relatorios" element={<ReportsPage />} />
            <Route path="diagnostico" element={<DiagnosticsPage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
          </Route>

          <Route path="cidadao" element={<CitizenLayout />}>
            <Route index element={<CitizenHomePage />} />
            <Route path="mapa" element={<CitizenMapPage />} />
            <Route path="registrar" element={<CitizenReportPage />} />
            <Route path="informacoes" element={<CitizenInfoPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AppProviders>
  )
}

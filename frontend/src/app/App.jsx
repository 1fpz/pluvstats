import { Route, Routes } from 'react-router-dom'
import { AppProviders } from './providers'
import { AppLayout } from '@/layouts/AppLayout'
import { CitizenLayout } from '@/layouts/CitizenLayout'
import { OverviewPage } from '@/pages/OverviewPage'
import { MapPage } from '@/pages/MapPage'
import { OccurrencesPage } from '@/pages/OccurrencesPage'
import { SensorsPage } from '@/pages/SensorsPage'
import { AlertsPage } from '@/pages/AlertsPage'
import { InterventionsPage } from '@/pages/InterventionsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { DiagnosticsPage } from '@/pages/DiagnosticsPage'
import { ComingSoonPage, NotFoundPage } from '@/pages/ComingSoonPage'

export default function App() {
  return (
    <AppProviders>
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
          <Route
            index
            element={
              <ComingSoonPage
                eyebrow="Cidadão"
                title="Área do cidadão"
                description="Experiência mobile-first para consultar pontos de atenção e registrar ocorrências."
              />
            }
          />
          <Route
            path="mapa"
            element={
              <ComingSoonPage eyebrow="Cidadão" title="Mapa de atenção" description="Pontos de atenção demonstrativos." />
            }
          />
          <Route
            path="registrar"
            element={
              <ComingSoonPage eyebrow="Cidadão" title="Registrar ocorrência" description="Formulário simplificado e acessível." />
            }
          />
          <Route
            path="informacoes"
            element={
              <ComingSoonPage eyebrow="Cidadão" title="Orientações" description="Informações de segurança e limitações do protótipo." />
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppProviders>
  )
}

import { Route, Routes } from 'react-router-dom'
import { AppProviders } from './providers'
import { AppLayout } from '@/layouts/AppLayout'
import { CitizenLayout } from '@/layouts/CitizenLayout'
import { OverviewPage } from '@/pages/OverviewPage'
import { MapPage } from '@/pages/MapPage'
import { ComingSoonPage, NotFoundPage } from '@/pages/ComingSoonPage'

export default function App() {
  return (
    <AppProviders>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="mapa" element={<MapPage />} />
          <Route
            path="ocorrencias"
            element={
              <ComingSoonPage
                eyebrow="Operação · ocorrências"
                title="Ocorrências"
                description="CRUD completo com validação, filtros, mapa e atualização dos indicadores."
              />
            }
          />
          <Route
            path="sensores"
            element={
              <ComingSoonPage
                eyebrow="Operação · sensores"
                title="Sensores"
                description="Cards, tabela, séries, histórico, diagnóstico e diferenciação entre simulação e hardware."
              />
            }
          />
          <Route
            path="alertas"
            element={
              <ComingSoonPage
                eyebrow="Operação · alertas"
                title="Central de alertas"
                description="Severidade, histórico, reconhecimento e resolução com identificação de origem."
              />
            }
          />
          <Route
            path="intervencoes"
            element={
              <ComingSoonPage
                eyebrow="Gestão · intervenções"
                title="Intervenções"
                description="Cadastro, histórico e comparação antes/depois de nível."
              />
            }
          />
          <Route
            path="relatorios"
            element={
              <ComingSoonPage
                eyebrow="Gestão · relatórios"
                title="Relatórios"
                description="Filtros, gráficos e exportação CSV com dados demonstrativos."
              />
            }
          />
          <Route
            path="diagnostico"
            element={
              <ComingSoonPage
                eyebrow="Sistema · diagnóstico"
                title="Diagnóstico"
                description="Conectividade, validação de leituras, origem dos dados e erros de comunicação."
              />
            }
          />
          <Route
            path="configuracoes"
            element={
              <ComingSoonPage
                eyebrow="Sistema · configurações"
                title="Configurações"
                description="Modo de operação, simulador, limites experimentais e dados da demonstração."
              />
            }
          />
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

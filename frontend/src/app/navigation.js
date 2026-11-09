import {
  Activity,
  BarChart3,
  BellRing,
  Cpu,
  LayoutDashboard,
  Map,
  MapPin,
  Settings,
  Wrench,
} from 'lucide-react'

export const navigationSections = [
  {
    label: 'Operação',
    items: [
      { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true },
      { to: '/mapa', label: 'Mapa urbano', icon: Map },
      { to: '/ocorrencias', label: 'Ocorrências', icon: MapPin },
      { to: '/sensores', label: 'Sensores', icon: Cpu },
      { to: '/alertas', label: 'Alertas', icon: BellRing, badgeKey: 'activeAlerts' },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { to: '/intervencoes', label: 'Intervenções', icon: Wrench },
      { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/diagnostico', label: 'Diagnóstico', icon: Activity, accent: true },
      { to: '/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
]

export const pageTitles = {
  '/': { section: 'Operação', title: 'Visão geral' },
  '/mapa': { section: 'Operação', title: 'Mapa urbano' },
  '/ocorrencias': { section: 'Operação', title: 'Ocorrências' },
  '/sensores': { section: 'Operação', title: 'Sensores' },
  '/alertas': { section: 'Operação', title: 'Alertas' },
  '/intervencoes': { section: 'Gestão', title: 'Intervenções' },
  '/relatorios': { section: 'Gestão', title: 'Relatórios' },
  '/diagnostico': { section: 'Sistema', title: 'Diagnóstico' },
  '/configuracoes': { section: 'Sistema', title: 'Configurações' },
  '/cidadao': { section: 'Cidadão', title: 'Área do cidadão' },
}

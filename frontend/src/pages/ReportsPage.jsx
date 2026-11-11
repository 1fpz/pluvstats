import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  ClipboardList,
  Download,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { InfoNotice } from '@/components/ui/InfoNotice'
import { useData } from '@/hooks'
import { downloadCsv, toCsv } from '@/utils/csv'
import { interventionStatusMeta, occurrenceStatusMeta, occurrenceTypeMeta, severityMeta } from '@/utils/severity'
import { formatDateTime, formatShortDay } from '@/utils/formatters'
import { SEVERITIES } from '@/utils/validators'

const PERIODS = [
  { value: '7', label: '7 dias' },
  { value: '30', label: '30 dias' },
  { value: 'all', label: 'Tudo' },
]

function periodStart(period) {
  if (period === 'all') return null
  const days = Number(period)
  return Date.now() - days * 24 * 60 * 60 * 1000
}

function ChartCard({ title, description, children, footer, icon = TrendingUp }) {
  return (
    <Card>
      <CardHeader icon={icon} title={title} description={description} />
      <CardBody className="pt-4">{children}</CardBody>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  )
}

export function ReportsPage() {
  const { snapshot, loading } = useData()
  const [period, setPeriod] = useState('30')
  const [neighborhood, setNeighborhood] = useState('all')
  const [severity, setSeverity] = useState('all')

  const occurrences = useMemo(() => snapshot?.occurrences ?? [], [snapshot])
  const interventions = useMemo(() => snapshot?.interventions ?? [], [snapshot])
  const alerts = useMemo(() => snapshot?.alerts ?? [], [snapshot])

  const neighborhoods = useMemo(
    () => [...new Set(occurrences.map((item) => item.neighborhood))].sort(),
    [occurrences],
  )

  const filteredOccurrences = useMemo(() => {
    const start = periodStart(period)
    return occurrences.filter((occurrence) => {
      const reported = new Date(occurrence.reportedAt).getTime()
      return (
        (!start || reported >= start) &&
        (neighborhood === 'all' || occurrence.neighborhood === neighborhood) &&
        (severity === 'all' || occurrence.severity === severity)
      )
    })
  }, [neighborhood, occurrences, period, severity])

  const filteredInterventions = useMemo(() => {
    const start = periodStart(period)
    return interventions.filter((item) => !start || new Date(item.startedAt).getTime() >= start)
  }, [interventions, period])

  const filteredAlerts = useMemo(() => {
    const start = periodStart(period)
    return alerts.filter((item) => !start || new Date(item.openedAt).getTime() >= start)
  }, [alerts, period])

  const typeData = useMemo(() => {
    return Object.entries(occurrenceTypeMeta).map(([key, meta]) => ({
      key,
      name: meta.label,
      total: filteredOccurrences.filter((occurrence) => occurrence.type === key).length,
    }))
  }, [filteredOccurrences])

  const severityData = useMemo(() => {
    return SEVERITIES.map((key) => ({
      key,
      name: severityMeta[key].label,
      value: filteredOccurrences.filter((occurrence) => occurrence.severity === key).length,
      color: severityMeta[key].hex,
    })).filter((item) => item.value > 0)
  }, [filteredOccurrences])

  const statusData = useMemo(() => {
    return Object.entries(occurrenceStatusMeta)
      .map(([key, meta]) => ({
        key,
        name: meta.label,
        total: filteredOccurrences.filter((occurrence) => occurrence.status === key).length,
      }))
      .filter((item) => item.total > 0)
  }, [filteredOccurrences])

  const dailyData = useMemo(() => {
    const start = periodStart(period) ?? Date.now() - 30 * 24 * 60 * 60 * 1000
    const buckets = new Map()
    for (let index = 6; index >= 0; index -= 1) {
      const day = new Date(start + (index * (Date.now() - start)) / 6)
      const key = day.toISOString().slice(0, 10)
      buckets.set(key, { key, label: formatShortDay(day), total: 0 })
    }
    filteredOccurrences.forEach((occurrence) => {
      const key = new Date(occurrence.reportedAt).toISOString().slice(0, 10)
      const bucket = buckets.get(key)
      if (bucket) bucket.total += 1
    })
    return [...buckets.values()]
  }, [filteredOccurrences, period])

  const openOccurrences = filteredOccurrences.filter((item) => item.status !== 'resolved' && item.status !== 'archived')
  const recurring = filteredOccurrences.filter((item) => (item.recurrenceCount ?? 0) >= 4)
  const completedInterventions = filteredInterventions.filter((item) => item.status === 'completed')
  const resolvedAlerts = filteredAlerts.filter((item) => item.status === 'resolved')
  const totalAffected = filteredOccurrences.reduce((total, item) => total + (item.affectedPeopleEstimate ?? 0), 0)

  const exportOccurrences = () => {
    const csv = toCsv(filteredOccurrences, [
      { label: 'ID', key: 'id' },
      { label: 'Título', key: 'title' },
      { label: 'Tipo', value: (row) => occurrenceTypeMeta[row.type]?.label ?? row.type },
      { label: 'Situação', value: (row) => occurrenceStatusMeta[row.status]?.label ?? row.status },
      { label: 'Severidade', value: (row) => severityMeta[row.severity]?.label ?? row.severity },
      { label: 'Bairro', key: 'neighborhood' },
      { label: 'Endereço', key: 'address' },
      { label: 'Latitude', value: (row) => row.position?.lat ?? '' },
      { label: 'Longitude', value: (row) => row.position?.lng ?? '' },
      { label: 'Registrada em', value: (row) => formatDateTime(row.reportedAt) },
      { label: 'Recorrência', key: 'recurrenceCount' },
      { label: 'Pessoas estimadas', key: 'affectedPeopleEstimate' },
      { label: 'Sensor', value: (row) => row.sensorId ?? '' },
      { label: 'Origem', key: 'origin' },
    ])
    downloadCsv(`pluvstats-ocorrencias-${new Date().toISOString().slice(0, 10)}.csv`, csv)
  }

  const exportInterventions = () => {
    const csv = toCsv(filteredInterventions, [
      { label: 'ID', key: 'id' },
      { label: 'Título', key: 'title' },
      { label: 'Situação', value: (row) => interventionStatusMeta[row.status]?.label ?? row.status },
      { label: 'Equipe', key: 'team' },
      { label: 'Local', key: 'location' },
      { label: 'Início', value: (row) => formatDateTime(row.startedAt) },
      { label: 'Conclusão', value: (row) => (row.completedAt ? formatDateTime(row.completedAt) : '') },
      { label: 'Nível antes (cm)', key: 'beforeLevelCm' },
      { label: 'Nível depois (cm)', value: (row) => row.afterLevelCm ?? '' },
      { label: 'Sensor', value: (row) => row.sensorId ?? '' },
      { label: 'Ocorrência', value: (row) => row.occurrenceId ?? '' },
      { label: 'Origem', key: 'origin' },
    ])
    downloadCsv(`pluvstats-intervencoes-${new Date().toISOString().slice(0, 10)}.csv`, csv)
  }

  const exporterAlerts = () => {
    const csv = toCsv(filteredAlerts, [
      { label: 'ID', key: 'id' },
      { label: 'Título', key: 'title' },
      { label: 'Sensor', key: 'sensorName' },
      { label: 'Dispositivo', key: 'deviceId' },
      { label: 'Severidade', value: (row) => severityMeta[row.severity]?.label ?? row.severity },
      { label: 'Situação', key: 'status' },
      { label: 'Origem', key: 'source' },
      { label: 'Simulado', value: (row) => (row.simulated ? 'sim' : 'não') },
      { label: 'Aberto em', value: (row) => formatDateTime(row.openedAt) },
      { label: 'Resolvido em', value: (row) => (row.resolvedAt ? formatDateTime(row.resolvedAt) : '') },
    ])
    downloadCsv(`pluvstats-alertas-${new Date().toISOString().slice(0, 10)}.csv`, csv)
  }

  const resetFilters = () => {
    setPeriod('30')
    setNeighborhood('all')
    setSeverity('all')
  }

  if (loading && !snapshot) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-9 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-24" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-72" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Gestão · análise e exportação"
        title="Relatórios"
        description="Recortes analíticos sobre ocorrências, intervenções e alertas demonstrativos. Nenhum dado real de campo ou pessoal é utilizado."
        meta={
          <>
            <Badge variant="cyan" size="sm">{filteredOccurrences.length} ocorrências</Badge>
            <Badge variant="neutral" size="sm">{filteredInterventions.length} intervenções</Badge>
            <Badge variant="neutral" size="sm">{filteredAlerts.length} alertas</Badge>
          </>
        }
        actions={
          <Button icon={Download} onClick={exportOccurrences}>
            Exportar ocorrências
          </Button>
        }
      />

      <Card>
        <CardBody className="pt-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <p className="eyebrow mb-1.5">Período</p>
                <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-line bg-navy-950/50 p-1">
                  {PERIODS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={period === option.value}
                      onClick={() => setPeriod(option.value)}
                      className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium transition ${
                        period === option.value
                          ? 'bg-cyan/15 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(0,166,204,0.25)]'
                          : 'text-muted hover:bg-navy-800/70 hover:text-ink'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="report-neighborhood" className="eyebrow mb-1.5 block">Bairro</label>
                <select
                  id="report-neighborhood"
                  value={neighborhood}
                  onChange={(event) => setNeighborhood(event.target.value)}
                  className="h-9 min-w-[170px] rounded-lg border border-line bg-navy-950/60 px-2.5 text-[11px] text-ink focus:border-cyan/50 focus:outline-none"
                >
                  <option value="all">Todos os bairros</option>
                  {neighborhoods.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="report-severity" className="eyebrow mb-1.5 block">Severidade</label>
                <select
                  id="report-severity"
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value)}
                  className="h-9 min-w-[150px] rounded-lg border border-line bg-navy-950/60 px-2.5 text-[11px] text-ink focus:border-cyan/50 focus:outline-none"
                >
                  <option value="all">Todas</option>
                  {SEVERITIES.map((key) => (
                    <option key={key} value={key}>{severityMeta[key].label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" icon={RefreshCw} onClick={resetFilters}>
                Limpar filtros
              </Button>
              <Button variant="secondary" size="sm" icon={Download} onClick={exportInterventions}>
                Intervenções CSV
              </Button>
              <Button variant="secondary" size="sm" icon={Download} onClick={exporterAlerts}>
                Alertas CSV
              </Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3 text-[10px] text-muted">
            <Filter className="h-3 w-3" aria-hidden="true" />
            Recorte atual:
            <span className="font-mono text-ink">
              {period === 'all' ? 'todo o histórico' : `últimos ${period} dias`}
            </span>
            <span className="text-line">·</span>
            <span className="font-mono text-ink">{neighborhood === 'all' ? 'todos os bairros' : neighborhood}</span>
            <span className="text-line">·</span>
            <span className="font-mono text-ink">{severity === 'all' ? 'todas as severidades' : severityMeta[severity].label}</span>
          </div>
        </CardBody>
      </Card>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores do relatório">
        <StatCard label="Ocorrências abertas" value={openOccurrences.length} icon={AlertTriangle} tone={openOccurrences.length > 0 ? 'warning' : 'success'} hint={`${filteredOccurrences.length} no recorte`} />
        <StatCard label="Recorrência alta" value={recurring.length} icon={TrendingUp} tone="critical" hint="4 ou mais registros no ponto" />
        <StatCard label="Intervenções concluídas" value={completedInterventions.length} icon={ClipboardList} tone="success" hint={`${filteredInterventions.length} no recorte`} />
        <StatCard label="Pessoas estimadas" value={totalAffected} icon={FileSpreadsheet} tone="cyan" hint="Somatório demonstrativo" />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Ocorrências por tipo"
          description="Distribuição do recorte selecionado."
          footer={<span className="text-[10px] text-muted">Classificação demonstrativa</span>}
        >
          {filteredOccurrences.length === 0 ? (
            <EmptyState icon={Filter} compact title="Sem dados no recorte" description="Altere o período ou os filtros." />
          ) : (
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval={0} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ fill: 'rgba(0,166,204,0.06)' }} formatter={(value) => [value, 'Ocorrências']} />
                  <Bar dataKey="total" fill="#00A6CC" fillOpacity={0.75} radius={[5, 5, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Severidade das ocorrências"
          description="Somente registros que atendem ao recorte."
          footer={<span className="text-[10px] text-muted">Limiares de severidade são declarados, não inferidos</span>}
          icon={AlertTriangle}
        >
          {severityData.length === 0 ? (
            <EmptyState icon={Filter} compact title="Sem dados no recorte" description="Altere o período ou os filtros." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-[1fr_150px] sm:items-center">
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={82}
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {severityData.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 text-[10px]">
                {severityData.map((entry) => (
                  <li key={entry.key} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-muted">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.name}
                    </span>
                    <span className="font-mono text-ink">{entry.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Evolução de registros"
          description="Ocorrências demonstrativas ao longo do recorte."
          footer={<span className="text-[10px] text-muted">Série ilustrativa, baseada em dados fictícios</span>}
        >
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ fill: 'rgba(0,166,204,0.06)' }} formatter={(value) => [value, 'Registros']} />
                <Bar dataKey="total" fill="#33C6E0" fillOpacity={0.7} radius={[5, 5, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Situação das ocorrências"
          description="Fluxo demonstrativo até a resolução."
          icon={ClipboardList}
          footer={<span className="text-[10px] text-muted">Arquivadas são preservadas no histórico</span>}
        >
          {statusData.length === 0 ? (
            <EmptyState icon={Filter} compact title="Sem dados no recorte" description="Altere o período ou os filtros." />
          ) : (
            <ul className="space-y-3">
              {statusData.map((entry) => {
                const meta = occurrenceStatusMeta[entry.key]
                const percent = Math.round((entry.total / filteredOccurrences.length) * 100)
                return (
                  <li key={entry.key}>
                    <div className="mb-1 flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1.5 text-muted">
                        <Badge variant={meta.tone} size="xs">{meta.label}</Badge>
                      </span>
                      <span className="font-mono text-ink">{entry.total} · {percent}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-navy-950">
                      <div
                        className="h-full rounded-full bg-cyan/70"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader icon={FileSpreadsheet} title="Prévia da exportação" description={`Primeiros registros do recorte atual (${filteredOccurrences.length}).`} />
          <CardBody className="pt-3">
            {filteredOccurrences.length === 0 ? (
              <EmptyState icon={FileSpreadsheet} compact title="Nada para exportar" description="Nenhuma ocorrência atende aos filtros atuais." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-line text-[9px] uppercase tracking-[0.08em] text-muted">
                      <th scope="col" className="py-2 pr-3 font-medium">ID</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Ocorrência</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Bairro</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Severidade</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Situação</th>
                      <th scope="col" className="py-2 text-right font-medium">Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredOccurrences.slice(0, 8).map((occurrence) => (
                      <tr key={occurrence.id}>
                        <td className="py-2 pr-3 font-mono text-[9px] text-muted">{occurrence.id}</td>
                        <td className="max-w-[220px] truncate py-2 pr-3 text-ink">{occurrence.title}</td>
                        <td className="py-2 pr-3 text-muted">{occurrence.neighborhood}</td>
                        <td className="py-2 pr-3 font-mono text-[10px]" style={{ color: severityMeta[occurrence.severity].hex }}>
                          {severityMeta[occurrence.severity].label}
                        </td>
                        <td className="py-2 pr-3">
                          <Badge variant={occurrenceStatusMeta[occurrence.status].tone} size="xs">
                            {occurrenceStatusMeta[occurrence.status].label}
                          </Badge>
                        </td>
                        <td className="py-2 text-right font-mono text-[9px] text-muted">{formatDateTime(occurrence.reportedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
          <CardFooter>
            <span className="text-[10px] text-muted">CSV com separador ponto e vírgula e BOM UTF-8.</span>
            <Button variant="secondary" size="sm" icon={Download} onClick={exportOccurrences} disabled={filteredOccurrences.length === 0}>
              Baixar CSV
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader icon={AlertTriangle} title="Alertas no recorte" description="Gerados pelo motor de regras demonstrativo." />
          <CardBody className="space-y-2 pt-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
                <p className="eyebrow text-[9px]">Total</p>
                <p className="mt-1 font-mono text-lg text-ink">{filteredAlerts.length}</p>
              </div>
              <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
                <p className="eyebrow text-[9px]">Resolvidos</p>
                <p className="mt-1 font-mono text-lg text-success">{resolvedAlerts.length}</p>
              </div>
              <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
                <p className="eyebrow text-[9px]">Simulados</p>
                <p className="mt-1 font-mono text-lg text-cyan-300">{filteredAlerts.filter((item) => item.simulated).length}</p>
              </div>
              <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
                <p className="eyebrow text-[9px]">Críticos</p>
                <p className="mt-1 font-mono text-lg text-critical">{filteredAlerts.filter((item) => item.severity === 'critical').length}</p>
              </div>
            </div>
            <InfoNotice variant="warning" title="Dados ilustrativos">
              Os relatórios usam somente registros fictícios. Não há integração com bases oficiais nem dados pessoais.
            </InfoNotice>
          </CardBody>
          <CardFooter>
            <span className="text-[10px] text-muted">Recorte</span>
            <span className="font-mono text-[9px] text-muted">{period === 'all' ? 'histórico' : `${period} dias`}</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Pencil,
  Plus,
  Search,
  Send,
  Wrench,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonClass } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { InfoNotice } from '@/components/ui/InfoNotice'
import { Modal } from '@/components/ui/Modal'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { InterventionForm, emptyInterventionForm, interventionToForm } from '@/components/interventions/InterventionForm'
import { useData, useDebouncedValue } from '@/hooks'
import { INTERVENTION_STATUSES } from '@/utils/validators'
import { interventionStatusMeta, severityMeta } from '@/utils/severity'
import { formatCm, formatDateTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const STATUS_TABS = [
  { value: 'all', label: 'Todas' },
  ...INTERVENTION_STATUSES.map((status) => ({ value: status, label: interventionStatusMeta[status].label })),
]

function reductionPercent(intervention) {
  if (
    !Number.isFinite(intervention.beforeLevelCm) ||
    !Number.isFinite(intervention.afterLevelCm) ||
    intervention.beforeLevelCm <= 0
  ) {
    return null
  }
  return Math.round(((intervention.beforeLevelCm - intervention.afterLevelCm) / intervention.beforeLevelCm) * 100)
}

function ComparisonChart({ intervention }) {
  const data = [
    { name: 'Antes', value: intervention.beforeLevelCm, color: severityMeta.alert.hex },
    { name: 'Depois', value: intervention.afterLevelCm, color: severityMeta.normal.hex },
  ]
  return (
    <div style={{ height: 190 }} className="-ml-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 18, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} width={32} tickFormatter={(value) => `${value}`} />
          <Tooltip
            cursor={{ fill: 'rgba(0,166,204,0.06)' }}
            formatter={(value) => [formatCm(value, 1), 'Nível']}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={false}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} fillOpacity={0.75} />
            ))}
            <LabelList dataKey="value" position="top" formatter={(value) => `${value} cm`} fill="#9FB3C8" fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function InterventionDetail({ intervention, occurrence }) {
  const meta = interventionStatusMeta[intervention.status]
  const reduction = reductionPercent(intervention)
  return (
    <Card className="xl:sticky xl:top-32">
      <CardHeader
        icon={Wrench}
        title={intervention.id}
        description={intervention.title}
        actions={
          <Badge variant={meta.tone} size="xs">
            {meta.label}
          </Badge>
        }
      />
      <CardBody className="space-y-4 pt-4">
        <p className="text-[11px] leading-relaxed text-muted">{intervention.description}</p>

        <dl className="space-y-1.5 text-[10px]">
          {[
            ['Equipe', intervention.team || '—'],
            ['Local', intervention.location],
            ['Início', formatDateTime(intervention.startedAt)],
            ['Conclusão', intervention.completedAt ? formatDateTime(intervention.completedAt) : '—'],
            ['Sensor', intervention.sensorId || 'não associado'],
            ['Ocorrência', intervention.occurrenceId || 'não associada'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-3 border-b border-line pb-1.5 last:border-0">
              <dt className="text-muted">{label}</dt>
              <dd className="max-w-[62%] break-words text-right font-mono text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        {Number.isFinite(intervention.afterLevelCm) ? (
          <>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="eyebrow">Comparação antes/depois</p>
                {reduction !== null ? (
                  <Badge variant={reduction > 0 ? 'success' : 'warning'} size="xs">
                    {reduction > 0 ? '−' : '+'}
                    {Math.abs(reduction)}%
                  </Badge>
                ) : null}
              </div>
              <ComparisonChart intervention={intervention} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
                <p className="eyebrow text-[9px]">Antes</p>
                <p className="mt-1 font-mono text-sm text-orange-400">{formatCm(intervention.beforeLevelCm)}</p>
              </div>
              <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
                <p className="eyebrow text-[9px]">Depois</p>
                <p className="mt-1 font-mono text-sm text-success">{formatCm(intervention.afterLevelCm)}</p>
              </div>
              <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
                <p className="eyebrow text-[9px]">Variação</p>
                <p className="mt-1 font-mono text-sm text-ink">
                  {formatCm(intervention.afterLevelCm - intervention.beforeLevelCm)}
                </p>
              </div>
            </div>
            <p className="text-[9px] leading-relaxed text-muted">
              Medições informadas manualmente no registro demonstrativo. Não representam aferição instrumental
              contínua.
            </p>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-line px-3 py-3 text-[10px] text-muted">
            Nível posterior ainda não registrado. A comparação será exibida quando a intervenção for concluída.
          </div>
        )}

        {occurrence ? (
          <div className="rounded-lg border border-line bg-navy-950/40 p-3">
            <p className="eyebrow mb-1 text-[9px]">Ocorrência vinculada</p>
            <p className="text-[11px] font-medium text-ink">{occurrence.title}</p>
            <Link to={`/ocorrencias?selected=${occurrence.id}`} className="mt-1 inline-block text-[10px] text-cyan-300 hover:text-cyan-400">
              Abrir ocorrência →
            </Link>
          </div>
        ) : null}
      </CardBody>
      <CardFooter>
        <span className="text-[10px] text-muted">Origem</span>
        <span className="font-mono text-[9px] text-muted">demonstração</span>
      </CardFooter>
    </Card>
  )
}

export function InterventionsPage() {
  const { snapshot, loading, actions } = useData()
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createSeed, setCreateSeed] = useState(null)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const debouncedQuery = useDebouncedValue(query, 220)

  const interventions = useMemo(() => snapshot?.interventions ?? [], [snapshot])
  const occurrences = useMemo(() => snapshot?.occurrences ?? [], [snapshot])
  const sensors = useMemo(() => snapshot?.sensors ?? [], [snapshot])

  const counts = useMemo(() => {
    const completed = interventions.filter((item) => item.status === 'completed')
    const withLevels = completed.filter(
      (item) => Number.isFinite(item.beforeLevelCm) && Number.isFinite(item.afterLevelCm),
    )
    const averageReduction =
      withLevels.length > 0
        ? Math.round(
            withLevels.reduce(
              (total, item) => total + (item.beforeLevelCm - item.afterLevelCm),
              0,
            ) / withLevels.length,
          )
        : null
    return {
      total: interventions.length,
      inProgress: interventions.filter((item) => item.status === 'in_progress').length,
      completed: completed.length,
      averageReduction,
    }
  }, [interventions])

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase()
    return interventions
      .filter((item) => {
        const matchesQuery =
          !needle ||
          [item.id, item.title, item.location, item.team, item.description]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(needle))
        return matchesQuery && (statusFilter === 'all' || item.status === statusFilter)
      })
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
  }, [debouncedQuery, interventions, statusFilter])

  const selected = interventions.find((item) => item.id === selectedId) ?? null
  const selectedOccurrence = selected?.occurrenceId
    ? occurrences.find((occurrence) => occurrence.id === selected.occurrenceId) ?? null
    : null

  const editingInitial = useMemo(
    () => (editing ? interventionToForm(editing) : null),
    [editing],
  )

  const openCreate = () => {
    setCreateSeed(emptyInterventionForm())
    setCreateOpen(true)
  }

  const handleCreate = async (form) => {
    setBusy(true)
    try {
      const record = await actions.createIntervention(form)
      setCreateOpen(false)
      setSelectedId(record.id)
    } finally {
      setBusy(false)
    }
  }

  const handleUpdate = async (form) => {
    if (!editing) return
    setBusy(true)
    try {
      await actions.updateIntervention(editing.id, form)
      setEditing(null)
    } finally {
      setBusy(false)
    }
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
        <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-28" />
            ))}
          </div>
          <div className="skeleton h-[420px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Gestão · campo e manutenção"
        title="Intervenções"
        description="Registre ações de drenagem ou manutenção e compare o nível antes e depois. Todos os registros desta demonstração são fictícios e informados manualmente."
        meta={
          <>
            <Badge variant="cyan" size="sm">{counts.total} registros</Badge>
            <Badge variant="petrol" size="sm">{counts.inProgress} em execução</Badge>
            <span className="font-mono text-[10px] text-muted">origem demonstrativa</span>
          </>
        }
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Nova intervenção
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores de intervenções">
        <StatCard label="Intervenções" value={counts.total} icon={ClipboardList} tone="cyan" hint="Registros demonstrativos" />
        <StatCard label="Em execução" value={counts.inProgress} icon={CalendarClock} tone={counts.inProgress > 0 ? 'petrol' : 'success'} hint="Acompanhamento de campo" />
        <StatCard label="Concluídas" value={counts.completed} icon={CheckCircle2} tone="success" hint="Com histórico preservado" />
        <StatCard
          label="Redução média"
          value={counts.averageReduction === null ? '—' : `${counts.averageReduction} cm`}
          icon={ArrowDownRight}
          tone="success"
          hint="Somente concluídas com antes/depois"
        />
      </section>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedControl
          ariaLabel="Filtrar intervenções por situação"
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_TABS}
        />
        <div className="relative min-w-[240px] flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título, local, equipe ou ID"
            aria-label="Buscar intervenções"
            className="h-9 w-full rounded-lg border border-line bg-navy-950/60 pl-9 pr-3 text-xs text-ink placeholder:text-muted/70 focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/20"
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="order-2 space-y-3 xl:order-1">
          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={Wrench}
                title="Nenhuma intervenção encontrada"
                description="Ajuste os filtros ou registre uma nova intervenção."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="secondary" onClick={() => { setStatusFilter('all'); setQuery('') }}>
                      Limpar filtros
                    </Button>
                    <Button icon={Plus} onClick={openCreate}>Nova intervenção</Button>
                  </div>
                }
              />
            </Card>
          ) : (
            filtered.map((item) => {
              const meta = interventionStatusMeta[item.status]
              const reduction = reductionPercent(item)
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedId(item.id)
                    }
                  }}
                  className={cn(
                    'cursor-pointer rounded-xl border border-line bg-navy-900/50 p-4 transition hover:bg-navy-850/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40',
                    selectedId === item.id && 'ring-1 ring-cyan/40',
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={meta.tone} size="xs">{meta.label}</Badge>
                        <span className="font-mono text-[9px] text-muted">{item.id}</span>
                        {item.sensorId ? (
                          <span className="font-mono text-[9px] text-cyan-300/80">sensor {item.sensorId}</span>
                        ) : null}
                      </div>
                      <h3 className="mt-1.5 text-[13px] font-medium text-ink">{item.title}</h3>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          {item.location}
                        </span>
                        <span className="text-line">·</span>
                        <span>início {formatDateTime(item.startedAt)}</span>
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Pencil}
                      onClick={(event) => {
                        event.stopPropagation()
                        setEditing(item)
                      }}
                    >
                      Editar
                    </Button>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="mb-1 flex items-center justify-between text-[9px] text-muted">
                          <span>Antes</span>
                          <span className="font-mono text-orange-400">{formatCm(item.beforeLevelCm)}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-navy-950">
                          <div className="h-full rounded-full bg-orange-400/70" style={{ width: `${Math.min(100, item.beforeLevelCm)}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between text-[9px] text-muted">
                          <span>Depois</span>
                          <span className="font-mono text-success">
                            {Number.isFinite(item.afterLevelCm) ? formatCm(item.afterLevelCm) : '—'}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-navy-950">
                          <div
                            className="h-full rounded-full bg-success/70"
                            style={{ width: `${Number.isFinite(item.afterLevelCm) ? Math.min(100, item.afterLevelCm) : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      {reduction !== null ? (
                        <span className={cn('font-mono text-[10px]', reduction >= 0 ? 'text-success' : 'text-warning')}>
                          {reduction >= 0 ? '−' : '+'}
                          {Math.abs(reduction)}%
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1 text-[10px] text-cyan-300">
                        Detalhes
                        <Send className="h-3 w-3" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}

          <InfoNotice variant="warning" title="Limite dos dados">
            A comparação antes/depois usa valores digitados no formulário demonstrativo. Ela serve para ilustrar o
            fluxo operacional, não para comprovar eficácia hidráulica de uma intervenção real.
          </InfoNotice>
        </div>

        <aside className="order-1 xl:order-2">
          {selected ? (
            <InterventionDetail intervention={selected} occurrence={selectedOccurrence} />
          ) : (
            <Card className="xl:sticky xl:top-32">
              <CardHeader icon={BarChart3} title="Antes e depois" description="Selecione uma intervenção para comparar níveis." />
              <CardBody className="pt-4">
                <EmptyState
                  icon={Wrench}
                  compact
                  title="Nenhuma intervenção selecionada"
                  description="Clique em um cartão para abrir o comparativo e os vínculos com ocorrência e sensor."
                />
              </CardBody>
              <CardFooter>
                <span className="text-[10px] text-muted">Exportação disponível em Relatórios</span>
                <Link to="/relatorios" className={buttonClass({ variant: 'ghost', size: 'sm' })}>Relatórios</Link>
              </CardFooter>
            </Card>
          )}
        </aside>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nova intervenção demonstrativa"
        description="Registre uma ação fictícia de manutenção ou drenagem com níveis antes e depois."
        size="lg"
      >
        <InterventionForm
          initial={createSeed ?? emptyInterventionForm()}
          sensors={sensors}
          occurrences={occurrences}
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          busy={busy}
          submitLabel="Registrar intervenção"
        />
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `Editar ${editing.id}` : 'Editar intervenção'}
        description="Atualize situação, datas e níveis da intervenção demonstrativa."
        size="lg"
      >
        {editing ? (
          <InterventionForm
            initial={editingInitial}
            sensors={sensors}
            occurrences={occurrences}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            busy={busy}
          />
        ) : null}
      </Modal>
    </div>
  )
}

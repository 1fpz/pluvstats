import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  FilterX,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardBody, CardFooter } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { InfoNotice } from '@/components/ui/InfoNotice'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { OccurrenceForm, occurrenceToForm } from '@/components/occurrences/OccurrenceForm'
import { OccurrenceTypeIcon } from '@/components/occurrences/OccurrenceTypeIcon'
import { useData, useDebouncedValue } from '@/hooks'
import { OCCURRENCE_STATUSES, SEVERITIES } from '@/utils/validators'
import { occurrenceStatusMeta, occurrenceTypeMeta, severityMeta } from '@/utils/severity'
import { scoreOccurrence } from '@/domain/intelligence'
import { formatDateTime, formatRelativeTime, formatCoordinates } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const SORTS = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'priority', label: 'Maior prioridade' },
  { value: 'recurrence', label: 'Maior recorrência' },
  { value: 'severity', label: 'Maior severidade' },
]

function PriorityBars({ priority }) {
  return (
    <div className="space-y-2">
      {priority.factors.map((factor) => (
        <div key={factor.key}>
          <div className="mb-1 flex items-center justify-between gap-2 text-[10px]">
            <span className="text-muted">
              {factor.label} <span className="text-muted/60">· peso {Math.round(factor.weight * 100)}%</span>
            </span>
            <span className="font-mono text-ink">{factor.value}</span>
          </div>
          <ProgressBar value={factor.value} tone={severityMeta[priority.band].tone} />
          <p className="mt-0.5 text-[9px] leading-relaxed text-muted/80">{factor.detail}</p>
        </div>
      ))}
    </div>
  )
}

export function OccurrencesPage() {
  const { snapshot, loading, actions } = useData()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 220)
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('all')
  const [sort, setSort] = useState('recent')
  const [detailId, setDetailId] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const occurrences = useMemo(() => snapshot?.occurrences ?? [], [snapshot])
  const sensors = useMemo(() => snapshot?.sensors ?? [], [snapshot])

  useEffect(() => {
    const selected = searchParams.get('selected')
    if (selected) setDetailId(selected)
    if (searchParams.get('new') === '1') setCreateOpen(true)
  }, [searchParams])

  const clearQuery = () => {
    if (searchParams.toString()) setSearchParams({}, { replace: true })
  }

  const neighborhoods = useMemo(
    () => [...new Set(occurrences.map((occurrence) => occurrence.neighborhood))].sort(),
    [occurrences],
  )

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase()
    const list = occurrences.filter((occurrence) => {
      const matchesQuery =
        !needle ||
        [occurrence.title, occurrence.id, occurrence.address, occurrence.neighborhood, occurrence.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(needle))
      return (
        matchesQuery &&
        (statusFilter === 'all' || occurrence.status === statusFilter) &&
        (severityFilter === 'all' || occurrence.severity === severityFilter) &&
        (neighborhoodFilter === 'all' || occurrence.neighborhood === neighborhoodFilter)
      )
    })
    return list.sort((a, b) => {
      if (sort === 'priority') {
        return (
          scoreOccurrence(b, { sensors }).score - scoreOccurrence(a, { sensors }).score
        )
      }
      if (sort === 'recurrence') return (b.recurrenceCount ?? 0) - (a.recurrenceCount ?? 0)
      if (sort === 'severity') {
        const order = { attention: 1, alert: 2, critical: 3 }
        return (order[b.severity] ?? 0) - (order[a.severity] ?? 0)
      }
      return new Date(b.reportedAt) - new Date(a.reportedAt)
    })
  }, [debouncedQuery, neighborhoodFilter, occurrences, sensors, severityFilter, sort, statusFilter])

  const selected = occurrences.find((occurrence) => occurrence.id === detailId) ?? null
  const editingInitial = useMemo(
    () => (editing ? occurrenceToForm(editing) : null),
    [editing],
  )
  const selectedPriority = selected ? scoreOccurrence(selected, { sensors }) : null
  const activeOccurrences = occurrences.filter((occurrence) =>
    ['open', 'validated', 'in_progress'].includes(occurrence.status),
  )
  const criticalCount = occurrences.filter(
    (occurrence) => occurrence.severity === 'critical' && occurrence.status !== 'resolved',
  ).length
  const recurring = occurrences.filter((occurrence) => (occurrence.recurrenceCount ?? 0) >= 4).length
  const averageRecurrence =
    occurrences.length > 0
      ? occurrences.reduce((sum, occurrence) => sum + (occurrence.recurrenceCount ?? 0), 0) /
        occurrences.length
      : 0

  const resetFilters = () => {
    setQuery('')
    setStatusFilter('all')
    setSeverityFilter('all')
    setNeighborhoodFilter('all')
    setSort('recent')
  }

  const handleCreate = async (form) => {
    setBusy(true)
    try {
      await actions.createOccurrence(form)
      setCreateOpen(false)
      clearQuery()
    } finally {
      setBusy(false)
    }
  }

  const handleUpdate = async (form) => {
    if (!editing) return
    setBusy(true)
    try {
      await actions.updateOccurrence(editing.id, form)
      setEditing(null)
      clearQuery()
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    try {
      await actions.deleteOccurrence(deleting.id)
      setDeleting(null)
      setDetailId(null)
      clearQuery()
    } finally {
      setBusy(false)
    }
  }

  const openEdit = (occurrence) => {
    setDetailId(null)
    setEditing(occurrence)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operação · registros demonstrativos"
        title="Ocorrências"
        description="Crie, consulte, atualize e exclua registros. Toda ocorrência é identificada como demonstração e atualiza os indicadores e o mapa."
        meta={
          <>
            <Badge variant="cyan" size="sm">
              {occurrences.length} registros
            </Badge>
            <Badge variant="warning" size="sm">
              {activeOccurrences.length} ativos
            </Badge>
            <span className="font-mono text-[10px] text-muted">sem dados pessoais</span>
          </>
        }
        actions={
          <Button
            icon={Plus}
            onClick={() => {
              clearQuery()
              setCreateOpen(true)
            }}
          >
            Nova ocorrência
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores de ocorrências">
        <StatCard label="Ocorrências ativas" value={activeOccurrences.length} icon={MapPin} tone="warning" hint="Abertas, validadas ou em intervenção" />
        <StatCard label="Severidade crítica" value={criticalCount} icon={AlertTriangle} tone={criticalCount > 0 ? 'critical' : 'success'} hint="Ocorrências críticas não resolvidas" />
        <StatCard label="Alta recorrência" value={recurring} icon={TrendingUp} tone="cyan" hint="4 ou mais registros no histórico" />
        <StatCard label="Média de recorrência" value={averageRecurrence.toFixed(1)} icon={FilterX} tone="petrol" hint="Por ponto, base demonstrativa" />
      </section>

      <Card>
        <CardBody className="flex flex-col gap-3 py-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por título, ID, endereço ou bairro"
                aria-label="Buscar ocorrências"
                className="h-9 w-full rounded-lg border border-line bg-navy-950/60 pl-9 pr-3 text-xs text-ink placeholder:text-muted/70 focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/20"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filtrar por situação"
                className="h-9 rounded-lg border border-line bg-navy-950/60 px-2.5 text-[11px] text-ink focus:border-cyan/50 focus:outline-none"
              >
                <option value="all">Todas as situações</option>
                {OCCURRENCE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {occurrenceStatusMeta[status]?.label ?? status}
                  </option>
                ))}
              </select>
              <select
                value={severityFilter}
                onChange={(event) => setSeverityFilter(event.target.value)}
                aria-label="Filtrar por severidade"
                className="h-9 rounded-lg border border-line bg-navy-950/60 px-2.5 text-[11px] text-ink focus:border-cyan/50 focus:outline-none"
              >
                <option value="all">Todas as severidades</option>
                {SEVERITIES.map((severity) => (
                  <option key={severity} value={severity}>
                    {severityMeta[severity]?.label ?? severity}
                  </option>
                ))}
              </select>
              <select
                value={neighborhoodFilter}
                onChange={(event) => setNeighborhoodFilter(event.target.value)}
                aria-label="Filtrar por bairro"
                className="h-9 max-w-[160px] rounded-lg border border-line bg-navy-950/60 px-2.5 text-[11px] text-ink focus:border-cyan/50 focus:outline-none"
              >
                <option value="all">Todos os bairros</option>
                {neighborhoods.map((neighborhood) => (
                  <option key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Ordenar ocorrências"
                className="h-9 rounded-lg border border-line bg-navy-950/60 px-2.5 text-[11px] text-ink focus:border-cyan/50 focus:outline-none"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button size="sm" variant="ghost" onClick={resetFilters}>
                Limpar
              </Button>
            </div>
          </div>
          <p className="font-mono text-[10px] text-muted">
            {filtered.length} de {occurrences.length} registro(s) · ordenação {SORTS.find((item) => item.value === sort)?.label.toLowerCase()}
          </p>
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        {loading && !snapshot ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Nenhuma ocorrência encontrada"
            description="Ajuste os filtros ou registre uma nova ocorrência demonstrativa."
            action={
              <div className="flex gap-2">
                <Button variant="secondary" onClick={resetFilters}>
                  Limpar filtros
                </Button>
                <Button icon={Plus} onClick={() => setCreateOpen(true)}>
                  Nova ocorrência
                </Button>
              </div>
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line text-[9px] uppercase tracking-[0.1em] text-muted">
                    <th scope="col" className="px-4 py-3 font-medium">Ocorrência</th>
                    <th scope="col" className="px-3 py-3 font-medium">Tipo</th>
                    <th scope="col" className="px-3 py-3 font-medium">Situação</th>
                    <th scope="col" className="px-3 py-3 font-medium">Severidade</th>
                    <th scope="col" className="px-3 py-3 text-center font-medium">Recorr.</th>
                    <th scope="col" className="px-3 py-3 text-center font-medium">Prior.</th>
                    <th scope="col" className="px-3 py-3 font-medium">Registro</th>
                    <th scope="col" className="px-3 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((occurrence) => {
                    const status = occurrenceStatusMeta[occurrence.status] ?? occurrenceStatusMeta.open
                    const priority = scoreOccurrence(occurrence, { sensors })
                    return (
                      <tr key={occurrence.id} className="group transition hover:bg-navy-850/50">
                        <td className="max-w-[320px] px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setDetailId(occurrence.id)}
                            className="block max-w-full text-left"
                          >
                            <span className="block truncate font-medium text-ink group-hover:text-cyan-300">
                              {occurrence.title}
                            </span>
                            <span className="mt-0.5 block truncate font-mono text-[9px] text-muted">
                              {occurrence.id} · {occurrence.neighborhood}
                            </span>
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 text-[10px] text-muted">
                            <OccurrenceTypeIcon type={occurrence.type} className="h-3.5 w-3.5" />
                            {occurrenceTypeMeta[occurrence.type]?.label ?? occurrence.type}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={status.tone} size="xs">{status.label}</Badge>
                        </td>
                        <td className="px-3 py-3">
                          <SeverityBadge severity={occurrence.severity} size="xs" />
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-[11px] text-ink">
                          {occurrence.recurrenceCount ?? 1}x
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={cn('font-mono text-[11px] font-semibold', severityMeta[priority.band].text)}>
                            {priority.score}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-[9px] text-muted">
                          {formatRelativeTime(occurrence.reportedAt)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(occurrence)}
                              className="grid h-7 w-7 place-items-center rounded-lg text-muted transition hover:bg-navy-800 hover:text-cyan-300"
                              aria-label={`Editar ${occurrence.title}`}
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(occurrence)}
                              className="grid h-7 w-7 place-items-center rounded-lg text-muted transition hover:bg-critical/10 hover:text-critical"
                              aria-label={`Excluir ${occurrence.title}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line lg:hidden">
              {filtered.map((occurrence) => {
                const status = occurrenceStatusMeta[occurrence.status] ?? occurrenceStatusMeta.open
                return (
                  <li key={occurrence.id} className="p-4">
                    <button type="button" onClick={() => setDetailId(occurrence.id)} className="w-full text-left">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-ink">{occurrence.title}</p>
                          <p className="mt-1 font-mono text-[9px] text-muted">
                            {occurrence.id} · {occurrence.neighborhood}
                          </p>
                        </div>
                        <SeverityBadge severity={occurrence.severity} size="xs" />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge variant={status.tone} size="xs">{status.label}</Badge>
                        <span className="font-mono text-[9px] text-muted">{occurrence.recurrenceCount}x recorrente</span>
                        <span className="font-mono text-[9px] text-muted">· {formatRelativeTime(occurrence.reportedAt)}</span>
                      </div>
                    </button>
                    <div className="mt-2 flex justify-end gap-1">
                      <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(occurrence)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setDeleting(occurrence)}>
                        Excluir
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
        <CardFooter>
          <span className="text-[10px] text-muted">CRUD demonstrativo · as alterações ficam neste ambiente.</span>
          <span className="font-mono text-[10px] text-muted">{filtered.length} registro(s)</span>
        </CardFooter>
      </Card>

      <InfoNotice variant="demo" title="Registros fictícios">
        As ocorrências existentes e as criadas nesta tela são demonstrativas. Não há integração com canais oficiais
        da Prefeitura de Santo André e não há coleta de dados pessoais.
      </InfoNotice>

      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false)
          clearQuery()
        }}
        title="Nova ocorrência demonstrativa"
        description="Os indicadores e o mapa são atualizados após salvar. Campos com * são obrigatórios."
        size="lg"
      >
        <OccurrenceForm
          key="create"
          initial={null}
          sensors={sensors}
          onSubmit={handleCreate}
          onCancel={() => {
            setCreateOpen(false)
            clearQuery()
          }}
          submitLabel="Registrar ocorrência"
          busy={busy}
        />
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={`Editar ${editing?.id ?? 'ocorrência'}`}
        description="Atualize os dados e salve. O histórico de alertas não é alterado."
        size="lg"
      >
        {editing ? (
          <OccurrenceForm
            key={editing.id}
            initial={editingInitial}
            sensors={sensors}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            submitLabel="Salvar alterações"
            busy={busy}
          />
        ) : null}
      </Modal>

      <Modal
        open={Boolean(selected)}
        onClose={() => {
          setDetailId(null)
          clearQuery()
        }}
        title={selected?.title ?? 'Ocorrência'}
        description={selected ? `${selected.id} · ${selected.address}` : ''}
        size="lg"
        footer={
          selected ? (
            <>
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => {
                  setDeleting(selected)
                }}
              >
                Excluir
              </Button>
              <Button variant="secondary" icon={Pencil} onClick={() => openEdit(selected)}>
                Editar
              </Button>
              <Button
                onClick={() => {
                  setDetailId(null)
                  clearQuery()
                }}
              >
                Fechar
              </Button>
            </>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              <SeverityBadge severity={selected.severity} />
              <Badge variant={(occurrenceStatusMeta[selected.status] ?? occurrenceStatusMeta.open).tone}>
                {(occurrenceStatusMeta[selected.status] ?? occurrenceStatusMeta.open).label}
              </Badge>
              <Badge variant="neutral">
                <OccurrenceTypeIcon type={selected.type} className="mr-1 h-3 w-3" />
                {occurrenceTypeMeta[selected.type]?.label ?? selected.type}
              </Badge>
              <Badge variant="cyan">Demonstração</Badge>
            </div>

            <p className="text-xs leading-relaxed text-muted">{selected.description}</p>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
                <p className="eyebrow text-[9px]">Recorrência</p>
                <p className="mt-1 font-mono text-lg font-semibold text-mist">{selected.recurrenceCount ?? 1}x</p>
              </div>
              <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
                <p className="eyebrow text-[9px]">Prioridade</p>
                <p className={cn('mt-1 font-mono text-lg font-semibold', severityMeta[selectedPriority.band].text)}>
                  {selectedPriority.score}
                </p>
              </div>
              <div className="rounded-lg border border-line bg-navy-950/40 p-2.5">
                <p className="eyebrow text-[9px]">Pessoas estimadas</p>
                <p className="mt-1 font-mono text-lg font-semibold text-mist">
                  {selected.affectedPeopleEstimate ?? 0}
                </p>
              </div>
            </div>

            <dl className="grid gap-x-6 gap-y-2 text-[11px] sm:grid-cols-2">
              <div className="flex justify-between gap-3 border-b border-line pb-1.5">
                <dt className="text-muted">Bairro</dt>
                <dd className="text-ink">{selected.neighborhood}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-line pb-1.5">
                <dt className="text-muted">Sensor</dt>
                <dd className="font-mono text-ink">{selected.sensorId ?? 'não vinculado'}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-line pb-1.5">
                <dt className="text-muted">Coordenadas</dt>
                <dd className="font-mono text-ink">
                  {formatCoordinates(selected.position.lat, selected.position.lng)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-line pb-1.5">
                <dt className="text-muted">Registrado</dt>
                <dd className="font-mono text-ink">{formatDateTime(selected.reportedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-line pb-1.5">
                <dt className="text-muted">Atualizado</dt>
                <dd className="font-mono text-ink">{formatDateTime(selected.updatedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-line pb-1.5">
                <dt className="text-muted">Origem</dt>
                <dd className="text-ink">{selected.origin === 'demonstration' ? 'Demonstração' : selected.origin}</dd>
              </div>
            </dl>

            <div>
              <p className="eyebrow mb-2">Pontuação explicável experimental</p>
              <PriorityBars priority={selectedPriority} />
            </div>

            {selected.evidence?.length ? (
              <div>
                <p className="eyebrow mb-1.5">Evidências demonstradas</p>
                <ul className="space-y-1 text-[10px] text-muted">
                  {selected.evidence.map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-cyan" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Excluir ocorrência?"
        description="Esta ação remove o registro demonstrativo deste ambiente. Não é possível desfazer."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)} disabled={busy}>
              Cancelar
            </Button>
            <Button variant="danger" icon={Trash2} loading={busy} onClick={handleDelete}>
              Excluir definitivamente
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-lg border border-critical/25 bg-critical/[0.05] p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-critical" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium text-ink">{deleting?.title}</p>
            <p className="mt-1 font-mono text-[10px] text-muted">{deleting?.id}</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

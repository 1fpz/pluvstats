import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { INTERVENTION_STATUSES, validateIntervention } from '@/utils/validators'
import { interventionStatusMeta } from '@/utils/severity'
import { territory } from '@/config'
import { toDateTimeLocal } from '@/utils/datetime'

export function emptyInterventionForm(overrides = {}) {
  return {
    title: '',
    description: '',
    status: 'planned',
    team: 'Equipe técnica — demonstração',
    startedAt: toDateTimeLocal(new Date()),
    completedAt: '',
    beforeLevelCm: '',
    afterLevelCm: '',
    location: '',
    sensorId: '',
    occurrenceId: '',
    ...overrides,
  }
}

export function interventionToForm(intervention) {
  return {
    title: intervention.title ?? '',
    description: intervention.description ?? '',
    status: intervention.status ?? 'planned',
    team: intervention.team ?? '',
    startedAt: toDateTimeLocal(intervention.startedAt),
    completedAt: intervention.completedAt ? toDateTimeLocal(intervention.completedAt) : '',
    beforeLevelCm: intervention.beforeLevelCm ?? '',
    afterLevelCm: intervention.afterLevelCm ?? '',
    location: intervention.location ?? '',
    sensorId: intervention.sensorId ?? '',
    occurrenceId: intervention.occurrenceId ?? '',
  }
}

export function InterventionForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar intervenção',
  busy = false,
  sensors = [],
  occurrences = [],
}) {
  const [form, setForm] = useState(initial ?? emptyInterventionForm())
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(initial ?? emptyInterventionForm())
    setErrors({})
  }, [initial])

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validateIntervention(form)
    if (form.status === 'completed' && !form.completedAt) {
      nextErrors.completedAt = 'Informe a data de conclusão.'
    }
    if (
      form.startedAt &&
      form.completedAt &&
      new Date(form.completedAt).getTime() < new Date(form.startedAt).getTime()
    ) {
      nextErrors.completedAt = 'A conclusão não pode ser anterior ao início.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    try {
      await onSubmit(form)
    } catch (error) {
      if (error?.fieldErrors) setErrors(error.fieldErrors)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Título"
        required
        value={form.title}
        onChange={update('title')}
        error={errors.title}
        placeholder="Ex.: Limpeza emergencial de bocas de lobo"
        data-autofocus
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Situação" required value={form.status} onChange={update('status')} error={errors.status}>
          {INTERVENTION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {interventionStatusMeta[status]?.label ?? status}
            </option>
          ))}
        </Select>
        <Input
          label="Equipe responsável"
          value={form.team}
          onChange={update('team')}
          error={errors.team}
          placeholder="Equipe de drenagem"
        />
      </div>

      <Input
        label="Local"
        required
        value={form.location}
        onChange={update('location')}
        error={errors.location}
        placeholder="Rua, número e referência"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Início"
          type="datetime-local"
          required
          value={form.startedAt}
          onChange={update('startedAt')}
          error={errors.startedAt}
        />
        <Input
          label="Conclusão"
          type="datetime-local"
          value={form.completedAt}
          onChange={update('completedAt')}
          error={errors.completedAt}
          hint={form.status === 'completed' ? 'Obrigatória para intervenções concluídas.' : 'Preencha ao concluir.'}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nível antes (cm)"
          type="number"
          min="0"
          max="100"
          step="0.1"
          required
          value={form.beforeLevelCm}
          onChange={update('beforeLevelCm')}
          error={errors.beforeLevelCm}
          placeholder="Ex.: 58"
        />
        <Input
          label="Nível depois (cm)"
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={form.afterLevelCm}
          onChange={update('afterLevelCm')}
          error={errors.afterLevelCm}
          hint="Opcional até a conclusão; usado na comparação antes/depois."
          placeholder="Ex.: 21"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Sensor associado" value={form.sensorId} onChange={update('sensorId')} error={errors.sensorId}>
          <option value="">Sem sensor associado</option>
          {sensors.map((sensor) => (
            <option key={sensor.id} value={sensor.id}>
              {sensor.id} · {sensor.shortName ?? sensor.name}
            </option>
          ))}
        </Select>
        <Select
          label="Ocorrência associada"
          value={form.occurrenceId}
          onChange={update('occurrenceId')}
          error={errors.occurrenceId}
        >
          <option value="">Sem ocorrência associada</option>
          {occurrences.map((occurrence) => (
            <option key={occurrence.id} value={occurrence.id}>
              {occurrence.id} · {occurrence.title}
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        label="Descrição da intervenção"
        required
        rows={4}
        value={form.description}
        onChange={update('description')}
        error={errors.description}
        placeholder="Descreva o serviço executado, recursos e observações de campo."
      />

      <div className="rounded-lg border border-line bg-navy-950/40 p-3 text-[10px] leading-relaxed text-muted">
        Registro demonstrativo. Níveis antes/depois são informados manualmente e não substituem medição
        instrumental. Área de referência: {territory.name}.
      </div>

      <div className="flex flex-wrap justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
          Cancelar
        </Button>
        <Button type="submit" icon={Save} loading={busy}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

import { useEffect, useState } from 'react'
import { AlertTriangle, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { OCCURRENCE_STATUSES, OCCURRENCE_TYPES, SEVERITIES, validateOccurrence } from '@/utils/validators'
import { occurrenceStatusMeta, occurrenceTypeMeta, severityMeta } from '@/utils/severity'
import { territory } from '@/config'
import { toDateTimeLocal } from '@/utils/datetime'

export function emptyOccurrenceForm(overrides = {}) {
  return {
    title: '',
    type: 'flooding',
    status: 'open',
    severity: 'attention',
    address: '',
    neighborhood: '',
    description: '',
    lat: String(territory.center[0]),
    lng: String(territory.center[1]),
    reportedAt: toDateTimeLocal(new Date()),
    recurrenceCount: 1,
    sensorId: '',
    affectedPeopleEstimate: 0,
    ...overrides,
  }
}

export function occurrenceToForm(occurrence) {
  return {
    title: occurrence.title ?? '',
    type: occurrence.type ?? 'flooding',
    status: occurrence.status ?? 'open',
    severity: occurrence.severity ?? 'attention',
    address: occurrence.address ?? '',
    neighborhood: occurrence.neighborhood ?? '',
    description: occurrence.description ?? '',
    lat: String(occurrence.position?.lat ?? territory.center[0]),
    lng: String(occurrence.position?.lng ?? territory.center[1]),
    reportedAt: toDateTimeLocal(occurrence.reportedAt),
    recurrenceCount: occurrence.recurrenceCount ?? 1,
    sensorId: occurrence.sensorId ?? '',
    affectedPeopleEstimate: occurrence.affectedPeopleEstimate ?? 0,
  }
}

export function OccurrenceForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar ocorrência',
  busy = false,
  sensors = [],
  compact = false,
}) {
  const [form, setForm] = useState(initial ?? emptyOccurrenceForm())
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(initial ?? emptyOccurrenceForm())
    setErrors({})
  }, [initial])

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validateOccurrence(form)
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

  const errorCount = Object.values(errors).filter(Boolean).length

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errorCount > 0 ? (
        <div className="flex items-start gap-2 rounded-lg border border-critical/30 bg-critical/[0.06] px-3 py-2 text-[11px] text-critical" role="alert">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Revise {errorCount} campo(s) destacado(s) antes de salvar.
        </div>
      ) : null}

      <Input
        label="Título da ocorrência"
        required
        value={form.title}
        onChange={update('title')}
        error={errors.title}
        placeholder="Ex.: Alagamento na Rua Oratório próximo ao córrego"
        data-autofocus
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Tipo" value={form.type} onChange={update('type')} error={errors.type}>
          {OCCURRENCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {occurrenceTypeMeta[type]?.label ?? type}
            </option>
          ))}
        </Select>
        <Select label="Situação" value={form.status} onChange={update('status')} error={errors.status}>
          {OCCURRENCE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {occurrenceStatusMeta[status]?.label ?? status}
            </option>
          ))}
        </Select>
        <Select label="Severidade" value={form.severity} onChange={update('severity')} error={errors.severity}>
          {SEVERITIES.map((severity) => (
            <option key={severity} value={severity}>
              {severityMeta[severity]?.label ?? severity}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Endereço de referência"
          required
          value={form.address}
          onChange={update('address')}
          error={errors.address}
          placeholder="Rua, número ou ponto de referência"
        />
        <Input
          label="Bairro"
          required
          value={form.neighborhood}
          onChange={update('neighborhood')}
          error={errors.neighborhood}
          placeholder="Bairro"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Latitude"
          required
          inputMode="decimal"
          value={form.lat}
          onChange={update('lat')}
          error={errors.lat}
        />
        <Input
          label="Longitude"
          required
          inputMode="decimal"
          value={form.lng}
          onChange={update('lng')}
          error={errors.lng}
        />
        <Input
          label="Recorrência"
          type="number"
          min="1"
          max="99"
          value={form.recurrenceCount}
          onChange={update('recurrenceCount')}
          error={errors.recurrenceCount}
          hint="Nº de registros"
        />
        <Input
          label="Pessoas estimadas"
          type="number"
          min="0"
          value={form.affectedPeopleEstimate}
          onChange={update('affectedPeopleEstimate')}
          hint="Estimativa demonstrativa"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Data e hora do registro"
          type="datetime-local"
          required
          value={form.reportedAt}
          onChange={update('reportedAt')}
          error={errors.reportedAt}
        />
        <Select
          label="Sensor associado"
          value={form.sensorId}
          onChange={update('sensorId')}
          hint="Opcional. Sensores simulados não validam ocorrências reais."
        >
          <option value="">Sem vínculo</option>
          {sensors.map((sensor) => (
            <option key={sensor.id} value={sensor.id}>
              {sensor.id} · {sensor.shortName ?? sensor.name}
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        label="Descrição"
        required
        rows={compact ? 3 : 4}
        value={form.description}
        onChange={update('description')}
        error={errors.description}
        placeholder="Descreva o que foi observado, a extensão e os impactos aparentes. Não inclua dados pessoais."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="max-w-sm text-[10px] leading-relaxed text-muted">
          Registro demonstrativo. Não inclua nomes, documentos, telefones ou outros dados pessoais.
        </p>
        <div className="flex gap-2">
          {onCancel ? (
            <Button variant="ghost" onClick={onCancel} disabled={busy}>
              Cancelar
            </Button>
          ) : null}
          <Button type="submit" icon={Save} loading={busy}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}

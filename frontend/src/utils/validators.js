export const OCCURRENCE_TYPES = ['flooding', 'waterlogging', 'drainage', 'overflow', 'other']
export const OCCURRENCE_STATUSES = ['open', 'validated', 'in_progress', 'resolved', 'archived']
export const SEVERITIES = ['attention', 'alert', 'critical']
export const INTERVENTION_STATUSES = ['planned', 'in_progress', 'completed']

function isFiniteNumber(value) {
  return value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value))
}

export function validateOccurrence(form) {
  const errors = {}
  const title = String(form.title ?? '').trim()
  if (title.length < 8) errors.title = 'Descreva o problema com pelo menos 8 caracteres.'
  if (title.length > 140) errors.title = 'O título deve ter no máximo 140 caracteres.'

  if (!OCCURRENCE_TYPES.includes(form.type)) errors.type = 'Selecione um tipo válido.'
  if (!OCCURRENCE_STATUSES.includes(form.status)) errors.status = 'Selecione uma situação válida.'
  if (!SEVERITIES.includes(form.severity)) errors.severity = 'Selecione uma severidade válida.'

  const description = String(form.description ?? '').trim()
  if (description.length < 20) errors.description = 'Detalhe a ocorrência com pelo menos 20 caracteres.'
  if (description.length > 800) errors.description = 'A descrição deve ter no máximo 800 caracteres.'

  if (!String(form.address ?? '').trim()) errors.address = 'Informe um endereço de referência.'
  if (!String(form.neighborhood ?? '').trim()) errors.neighborhood = 'Informe o bairro.'

  const lat = Number(form.lat)
  const lng = Number(form.lng)
  if (!isFiniteNumber(form.lat) || lat < -24.2 || lat > -23.2) {
    errors.lat = 'Latitude fora da área de demonstração (-24,2 a -23,2).'
  }
  if (!isFiniteNumber(form.lng) || lng < -47.1 || lng > -45.9) {
    errors.lng = 'Longitude fora da área de demonstração (-47,1 a -45,9).'
  }

  if (!form.reportedAt || Number.isNaN(new Date(form.reportedAt).getTime())) {
    errors.reportedAt = 'Informe uma data e hora válidas.'
  }

  if (form.recurrenceCount !== undefined && form.recurrenceCount !== '') {
    const recurrence = Number(form.recurrenceCount)
    if (!Number.isInteger(recurrence) || recurrence < 1 || recurrence > 99) {
      errors.recurrenceCount = 'A recorrência deve ser um inteiro entre 1 e 99.'
    }
  }

  return errors
}

export function validateIntervention(form) {
  const errors = {}
  if (String(form.title ?? '').trim().length < 6) {
    errors.title = 'Informe um título com pelo menos 6 caracteres.'
  }
  if (!INTERVENTION_STATUSES.includes(form.status)) errors.status = 'Selecione uma situação válida.'
  if (!String(form.location ?? '').trim()) errors.location = 'Informe o local da intervenção.'
  if (!form.startedAt || Number.isNaN(new Date(form.startedAt).getTime())) {
    errors.startedAt = 'Informe a data de início.'
  }
  if (form.beforeLevelCm === '' || !isFiniteNumber(form.beforeLevelCm)) {
    errors.beforeLevelCm = 'Informe o nível antes da intervenção.'
  } else if (Number(form.beforeLevelCm) < 0 || Number(form.beforeLevelCm) > 100) {
    errors.beforeLevelCm = 'O nível deve estar entre 0 e 100 cm.'
  }
  if (form.afterLevelCm !== '' && form.afterLevelCm !== undefined && form.afterLevelCm !== null) {
    if (!isFiniteNumber(form.afterLevelCm)) {
      errors.afterLevelCm = 'O nível depois deve ser numérico.'
    } else if (Number(form.afterLevelCm) < 0 || Number(form.afterLevelCm) > 100) {
      errors.afterLevelCm = 'O nível deve estar entre 0 e 100 cm.'
    }
  }
  if (String(form.description ?? '').trim().length < 15) {
    errors.description = 'Descreva a intervenção com pelo menos 15 caracteres.'
  }
  return errors
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}

export function toOccurrencePayload(form) {
  return {
    title: String(form.title).trim(),
    type: form.type,
    status: form.status,
    severity: form.severity,
    position: { lat: Number(form.lat), lng: Number(form.lng) },
    address: String(form.address).trim(),
    neighborhood: String(form.neighborhood).trim(),
    description: String(form.description).trim(),
    reportedAt: new Date(form.reportedAt).toISOString(),
    recurrenceCount: Number(form.recurrenceCount) || 1,
    sensorId: form.sensorId || null,
    affectedPeopleEstimate: Number(form.affectedPeopleEstimate) || 0,
    reporter: String(form.reporter ?? 'Canal de demonstração').trim(),
  }
}

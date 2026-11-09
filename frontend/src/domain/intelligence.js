import { severityRank } from '@/utils/severity'

/**
 * Experimental, explainable prioritisation. It is NOT a predictive model and
 * NOT an official risk classification. Weights are documented in
 * documentation/architecture/intelligence.md and tested in both runtimes.
 */
export const PRIORITY_WEIGHTS = Object.freeze({
  recurrence: 0.3,
  severity: 0.3,
  recency: 0.2,
  corroboration: 0.2,
})

const SEVERITY_SCORE = {
  normal: 10,
  attention: 40,
  alert: 70,
  critical: 100,
}

const OPEN_STATUS_WEIGHT = {
  open: 1,
  validated: 0.9,
  in_progress: 0.75,
  resolved: 0.25,
  archived: 0.1,
}

export function priorityBand(score) {
  if (score >= 80) return 'critical'
  if (score >= 62) return 'alert'
  if (score >= 40) return 'attention'
  return 'normal'
}

export function scoreOccurrence(occurrence, { sensors = [], now = new Date() } = {}) {
  const recurrence = Math.min(100, (occurrence.recurrenceCount ?? 0) * 14)
  const severity = SEVERITY_SCORE[occurrence.severity] ?? 20
  const ageHours = Math.max(
    0,
    (now.getTime() - new Date(occurrence.reportedAt ?? now).getTime()) / 36e5,
  )
  const recency = Math.max(0, 100 - ageHours * 2.2)
  const linkedSensor = sensors.find((sensor) => sensor.id === occurrence.sensorId)
  const sensorSignal = linkedSensor
    ? SEVERITY_SCORE[
        linkedSensor.alertSeverity ??
          (linkedSensor.levelCm === null ? 'normal' : linkedSensor.levelCm >= 50 ? 'alert' : linkedSensor.levelCm >= 25 ? 'attention' : 'normal')
      ]
    : 20
  const statusWeight = OPEN_STATUS_WEIGHT[occurrence.status] ?? 0.5
  const corroboration = (sensorSignal * 0.7 + severity * 0.3) * statusWeight

  const factors = [
    {
      key: 'recurrence',
      label: 'Recorrência',
      value: Math.round(recurrence),
      weight: PRIORITY_WEIGHTS.recurrence,
      detail: `${occurrence.recurrenceCount ?? 0} registro(s) no histórico demonstrativo.`,
    },
    {
      key: 'severity',
      label: 'Severidade relatada',
      value: severity,
      weight: PRIORITY_WEIGHTS.severity,
      detail: `Severidade ${occurrence.severity}.`,
    },
    {
      key: 'recency',
      label: 'Atualidade',
      value: Math.round(recency),
      weight: PRIORITY_WEIGHTS.recency,
      detail: `Registro com ${ageHours.toFixed(0)} h de idade.`,
    },
    {
      key: 'corroboration',
      label: 'Corroboração',
      value: Math.round(corroboration),
      weight: PRIORITY_WEIGHTS.corroboration,
      detail: linkedSensor
        ? `Sensor ${linkedSensor.id} associado (${linkedSensor.source === 'simulation' ? 'simulado' : 'hardware'}).`
        : 'Sem sensor associado; usa apenas o relato.',
    },
  ]

  const raw = factors.reduce((sum, factor) => sum + factor.value * factor.weight, 0)
  const score = Math.round(Math.min(100, raw))
  return {
    score,
    band: priorityBand(score),
    factors,
    experimental: true,
    note: 'Pontuação explicável experimental. Não representa risco oficial.',
  }
}

export function rankOccurrences(occurrences, options = {}) {
  return occurrences
    .map((occurrence) => ({ occurrence, priority: scoreOccurrence(occurrence, options) }))
    .sort((a, b) => b.priority.score - a.priority.score)
}

export function summarizeSensors(sensors) {
  const total = sensors.length
  const simulated = sensors.filter((sensor) => sensor.source === 'simulation').length
  const hardware = total - simulated
  const validated = sensors.filter((sensor) => sensor.validated).length
  const critical = sensors.filter(
    (sensor) => sensor.levelCm !== null && sensor.levelCm >= 75,
  ).length
  const online = sensors.filter(
    (sensor) => sensor.status === 'simulation_active' || sensor.status === 'hardware_validated',
  ).length
  const worstRank = sensors.reduce(
    (worst, sensor) =>
      Math.max(
        worst,
        severityRank(
          sensor.levelCm === null
            ? 'normal'
            : sensor.levelCm >= 75
              ? 'critical'
              : sensor.levelCm >= 50
                ? 'alert'
                : sensor.levelCm >= 25
                  ? 'attention'
                  : 'normal',
        ),
      ),
    0,
  )
  const levels = ['normal', 'attention', 'alert', 'critical']
  return {
    total,
    simulated,
    hardware,
    validated,
    online,
    critical,
    worstSeverity: levels[worstRank],
    averageLevelCm:
      sensors.filter((sensor) => Number.isFinite(sensor.levelCm)).reduce((sum, sensor) => sum + sensor.levelCm, 0) /
        Math.max(1, sensors.filter((sensor) => Number.isFinite(sensor.levelCm)).length) || 0,
  }
}

import { appConfig } from '@/config'
import { demoSensors } from '@/data/sensors'
import { demoInterventions, demoOccurrences } from '@/data/occurrences'
import {
  applySimulationCommand,
  createSimulationState,
  deriveSensorView,
  latestReadingFor,
  tickSimulation,
} from '@/domain/simulationEngine'
import {
  acknowledgeAlertRecord,
  evaluateAlerts,
  resolveAlertRecord,
} from '@/domain/alertEngine'
import { severityRank } from '@/utils/severity'
import { nextSequentialId, createId } from '@/utils/ids'
import { hasErrors, toOccurrencePayload, validateIntervention, validateOccurrence } from '@/utils/validators'

const STORAGE_KEY = 'pluvstats.demo.state.v2'

export class ValidationError extends Error {
  constructor(fieldErrors) {
    super('Dados inválidos.')
    this.name = 'ValidationError'
    this.fieldErrors = fieldErrors
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function activeAlertsBySensor(alerts) {
  const map = new Map()
  alerts
    .filter((alert) => alert.status !== 'resolved')
    .forEach((alert) => {
      const current = map.get(alert.sensorId)
      if (!current || severityRank(alert.severity) > severityRank(current.severity)) {
        map.set(alert.sensorId, alert)
      }
    })
  return map
}

export function createSeedSnapshot(config = appConfig, now = new Date()) {
  const sensors = clone(demoSensors)
  const occurrences = clone(demoOccurrences)
  const interventions = clone(demoInterventions)
  const simulation = createSimulationState(sensors, config, { now, scenario: 'normal', running: true })

  const readingsBySensor = {}
  sensors
    .filter((sensor) => sensor.source === 'simulation')
    .forEach((sensor) => {
      readingsBySensor[sensor.id] = latestReadingFor(sensor, simulation, { now })
    })

  const alertResult = evaluateAlerts({
    sensors,
    readingsBySensor,
    alerts: [],
    config,
    now,
  })

  const activity = [
    ...occurrences
      .slice()
      .sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt))
      .slice(0, 6)
      .map((occurrence) => ({
        id: `ACT-${occurrence.id}`,
        kind: 'occurrence',
        title: 'Ocorrência demonstrativa registrada',
        description: occurrence.title,
        at: occurrence.updatedAt ?? occurrence.reportedAt,
        severity: occurrence.severity,
        source: 'simulation',
      })),
    ...alertResult.alerts.slice(0, 4).map((alert) => ({
      id: `ACT-${alert.id}`,
      kind: 'alert',
      title: alert.title,
      description: `${alert.sensorName} · ${alert.description}`,
      at: alert.openedAt,
      severity: alert.severity,
      source: alert.source,
    })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 10)

  return {
    version: 2,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    sensors,
    occurrences,
    interventions,
    alerts: alertResult.alerts,
    simulation,
    readings: readingsBySensor,
    activity,
  }
}

export class DemoRepository {
  constructor({ storageKey = STORAGE_KEY, config = appConfig } = {}) {
    this.storageKey = storageKey
    this.config = config
    this.state = null
    this.listeners = new Set()
    this.sourceKind = 'demo'
  }

  init() {
    if (this.state) return this.state
    this.state = this.load() ?? createSeedSnapshot(this.config)
    this.persist()
    return this.state
  }

  load() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null
      const raw = window.localStorage.getItem(this.storageKey)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (parsed.version !== 2) return null
      if (!Array.isArray(parsed.sensors) || !Array.isArray(parsed.occurrences)) return null
      return parsed
    } catch {
      return null
    }
  }

  persist() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return
      window.localStorage.setItem(this.storageKey, JSON.stringify(this.state))
    } catch {
      // Storage can be unavailable or full; the in-memory demo keeps working.
    }
  }

  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  emit() {
    const snapshot = this.getSnapshot()
    this.listeners.forEach((listener) => listener(snapshot))
  }

  commit() {
    this.state.updatedAt = new Date().toISOString()
    this.persist()
    this.emit()
  }

  getSnapshot({ now = new Date() } = {}) {
    if (!this.state) this.init()
    const alertsBySensor = activeAlertsBySensor(this.state.alerts)
    const sensors = this.state.sensors.map((sensor) => {
      const view = deriveSensorView(sensor, this.state.simulation, { now })
      const active = alertsBySensor.get(sensor.id)
      return {
        ...view,
        alertSeverity: active?.severity ?? null,
        activeAlertId: active?.id ?? null,
      }
    })

    return {
      ...this.state,
      sensors,
      alerts: [...this.state.alerts].sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt)),
      simulation: {
        ...this.state.simulation,
        simulatedSensors: sensors.filter((sensor) => sensor.source === 'simulation').length,
      },
      now: now.toISOString(),
      sourceKind: this.sourceKind,
      isDemo: true,
      counts: {
        activeAlerts: this.state.alerts.filter((alert) => alert.status !== 'resolved').length,
        criticalAlerts: this.state.alerts.filter(
          (alert) => alert.status !== 'resolved' && alert.severity === 'critical',
        ).length,
        openOccurrences: this.state.occurrences.filter((occurrence) =>
          ['open', 'validated', 'in_progress'].includes(occurrence.status),
        ).length,
        sensors: sensors.length,
        validatedHardware: sensors.filter((sensor) => sensor.validated).length,
      },
    }
  }

  logActivity(entry) {
    this.state.activity = [
      {
        id: createId('ACT'),
        at: new Date().toISOString(),
        source: 'simulation',
        ...entry,
      },
      ...(this.state.activity ?? []),
    ].slice(0, 40)
  }

  refreshAlerts(now = new Date()) {
    const readingsBySensor = {}
    this.state.sensors
      .filter((sensor) => sensor.source === 'simulation')
      .forEach((sensor) => {
        readingsBySensor[sensor.id] = latestReadingFor(sensor, this.state.simulation, { now })
      })
    const result = evaluateAlerts({
      sensors: this.state.sensors,
      readingsBySensor,
      alerts: this.state.alerts,
      config: this.config,
      now,
    })
    this.state.alerts = result.alerts
    this.state.readings = readingsBySensor
    result.created.forEach((alert) => {
      this.logActivity({
        kind: 'alert',
        title: alert.title,
        description: `${alert.sensorName} · ${alert.description}`,
        at: alert.openedAt,
        severity: alert.severity,
        source: alert.source,
      })
    })
    result.updated.forEach((alert) => {
      this.logActivity({
        kind: 'alert',
        title: `Severidade atualizada: ${alert.title}`,
        description: `${alert.sensorName} · agora em ${alert.severity}.`,
        at: alert.lastObservedAt,
        severity: alert.severity,
        source: alert.source,
      })
    })
    return result
  }

  async tickSimulation({ now = new Date() } = {}) {
    if (!this.state) this.init()
    const { state, readings } = tickSimulation(
      this.state.simulation,
      this.state.sensors,
      this.config,
      { now },
    )
    this.state.simulation = state
    const readingsBySensor = Object.fromEntries(readings.map((reading) => [reading.sensor_id, reading]))
    const result = evaluateAlerts({
      sensors: this.state.sensors,
      readingsBySensor,
      alerts: this.state.alerts,
      config: this.config,
      now,
    })
    this.state.alerts = result.alerts
    this.state.readings = readingsBySensor
    result.created.forEach((alert) => {
      this.logActivity({
        kind: 'alert',
        title: alert.title,
        description: `${alert.sensorName} · ${alert.description}`,
        at: alert.openedAt,
        severity: alert.severity,
        source: alert.source,
      })
    })
    this.commit()
    return this.getSnapshot({ now })
  }

  async controlSimulation(command, { now = new Date() } = {}) {
    if (!this.state) this.init()
    this.state.simulation = applySimulationCommand(
      this.state.simulation,
      command,
      this.state.sensors,
      this.config,
      { now },
    )
    this.refreshAlerts(now)
    this.logActivity({
      kind: 'simulation',
      title: 'Controle do simulador',
      description: `Ação "${command.action}" aplicada ao ambiente demonstrativo.`,
      severity: 'normal',
      source: 'simulation',
    })
    this.commit()
    return this.getSnapshot({ now })
  }

  async createOccurrence(form) {
    const errors = validateOccurrence(form)
    if (hasErrors(errors)) throw new ValidationError(errors)
    const payload = toOccurrencePayload(form)
    const record = {
      ...payload,
      id: nextSequentialId('OCO', this.state.occurrences),
      updatedAt: new Date().toISOString(),
      origin: 'demonstration',
      evidence: ['Registro criado no ambiente de demonstração'],
    }
    this.state.occurrences = [record, ...this.state.occurrences]
    this.logActivity({
      kind: 'occurrence',
      title: 'Ocorrência demonstrativa criada',
      description: record.title,
      at: record.updatedAt,
      severity: record.severity,
      source: 'simulation',
    })
    this.commit()
    return record
  }

  async updateOccurrence(id, form) {
    const errors = validateOccurrence(form)
    if (hasErrors(errors)) throw new ValidationError(errors)
    const index = this.state.occurrences.findIndex((item) => item.id === id)
    if (index === -1) throw new Error('Ocorrência não encontrada.')
    const payload = toOccurrencePayload(form)
    const record = {
      ...this.state.occurrences[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    }
    this.state.occurrences[index] = record
    this.logActivity({
      kind: 'occurrence',
      title: 'Ocorrência demonstrativa atualizada',
      description: record.title,
      at: record.updatedAt,
      severity: record.severity,
      source: 'simulation',
    })
    this.commit()
    return record
  }

  async deleteOccurrence(id) {
    const record = this.state.occurrences.find((item) => item.id === id)
    if (!record) throw new Error('Ocorrência não encontrada.')
    this.state.occurrences = this.state.occurrences.filter((item) => item.id !== id)
    this.logActivity({
      kind: 'occurrence',
      title: 'Ocorrência demonstrativa excluída',
      description: record.title,
      at: new Date().toISOString(),
      severity: 'normal',
      source: 'simulation',
    })
    this.commit()
    return { id }
  }

  async createIntervention(form) {
    const errors = validateIntervention(form)
    if (hasErrors(errors)) throw new ValidationError(errors)
    const occurrence = this.state.occurrences.find((item) => item.id === form.occurrenceId)
    const record = {
      id: nextSequentialId('INT', this.state.interventions),
      occurrenceId: form.occurrenceId || null,
      title: String(form.title).trim(),
      description: String(form.description).trim(),
      status: form.status,
      team: String(form.team ?? 'Equipe técnica — demonstração').trim(),
      startedAt: new Date(form.startedAt).toISOString(),
      completedAt: form.completedAt ? new Date(form.completedAt).toISOString() : null,
      beforeLevelCm: Number(form.beforeLevelCm),
      afterLevelCm:
        form.afterLevelCm === '' || form.afterLevelCm === undefined || form.afterLevelCm === null
          ? null
          : Number(form.afterLevelCm),
      location: String(form.location).trim(),
      position: occurrence?.position ?? null,
      sensorId: form.sensorId || occurrence?.sensorId || null,
      origin: 'demonstration',
    }
    this.state.interventions = [record, ...this.state.interventions]
    this.logActivity({
      kind: 'intervention',
      title: 'Intervenção demonstrativa registrada',
      description: record.title,
      at: record.startedAt,
      severity: 'normal',
      source: 'simulation',
    })
    this.commit()
    return record
  }

  async updateIntervention(id, form) {
    const errors = validateIntervention(form)
    if (hasErrors(errors)) throw new ValidationError(errors)
    const index = this.state.interventions.findIndex((item) => item.id === id)
    if (index === -1) throw new Error('Intervenção não encontrada.')
    const record = {
      ...this.state.interventions[index],
      title: String(form.title).trim(),
      description: String(form.description).trim(),
      status: form.status,
      team: String(form.team ?? '').trim(),
      startedAt: new Date(form.startedAt).toISOString(),
      completedAt: form.completedAt ? new Date(form.completedAt).toISOString() : null,
      beforeLevelCm: Number(form.beforeLevelCm),
      afterLevelCm:
        form.afterLevelCm === '' || form.afterLevelCm === undefined || form.afterLevelCm === null
          ? null
          : Number(form.afterLevelCm),
      location: String(form.location).trim(),
      sensorId: form.sensorId || null,
    }
    this.state.interventions[index] = record
    this.logActivity({
      kind: 'intervention',
      title: 'Intervenção demonstrativa atualizada',
      description: record.title,
      at: new Date().toISOString(),
      severity: 'normal',
      source: 'simulation',
    })
    this.commit()
    return record
  }

  async acknowledgeAlert(id) {
    const index = this.state.alerts.findIndex((alert) => alert.id === id)
    if (index === -1) throw new Error('Alerta não encontrado.')
    const record = acknowledgeAlertRecord(this.state.alerts[index])
    this.state.alerts[index] = record
    this.logActivity({
      kind: 'alert',
      title: 'Alerta reconhecido',
      description: `${record.sensorName} · ${record.title}`,
      at: record.acknowledgedAt,
      severity: record.severity,
      source: record.source,
    })
    this.commit()
    return record
  }

  async resolveAlert(id) {
    const index = this.state.alerts.findIndex((alert) => alert.id === id)
    if (index === -1) throw new Error('Alerta não encontrado.')
    const record = resolveAlertRecord(this.state.alerts[index])
    this.state.alerts[index] = record
    this.logActivity({
      kind: 'alert',
      title: 'Alerta resolvido',
      description: `${record.sensorName} · ${record.title}`,
      at: record.resolvedAt,
      severity: record.severity,
      source: record.source,
    })
    this.commit()
    return record
  }

  async resetDemo() {
    this.state = createSeedSnapshot(this.config)
    this.commit()
    return this.getSnapshot()
  }
}

export const demoRepository = new DemoRepository()

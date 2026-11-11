import { runtimeConfig } from '@/config'
import { ValidationError } from './demoRepository'
import { hasErrors, toOccurrencePayload, validateIntervention, validateOccurrence } from '@/utils/validators'

const API_TIMEOUT_MS = runtimeConfig.requestTimeoutMs

function toCamel(value) {
  return String(value).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function fieldErrorsFromDetail(detail) {
  const errors = {}
  if (!Array.isArray(detail)) return errors
  detail.forEach((item) => {
    const parts = (item?.loc ?? []).filter((part) => part !== 'body')
    if (!parts.length) return
    let key = parts[0]
    if (key === 'position') {
      key = parts[1] === 'lat' ? 'lat' : 'lng'
    } else if (key === 'sensor_id') {
      key = 'sensorId'
    } else if (key === 'reported_at') {
      key = 'reportedAt'
    } else {
      key = toCamel(key)
    }
    errors[key] = item?.msg ? 'Valor inválido para este campo.' : 'Valor inválido.'
  })
  return errors
}

function interventionPayload(form) {
  const after = form.afterLevelCm
  return {
    occurrenceId: form.occurrenceId || null,
    title: String(form.title).trim(),
    description: String(form.description).trim(),
    status: form.status,
    team: String(form.team ?? '').trim() || null,
    startedAt: new Date(form.startedAt).toISOString(),
    completedAt: form.completedAt ? new Date(form.completedAt).toISOString() : null,
    beforeLevelCm: Number(form.beforeLevelCm),
    afterLevelCm: after === '' || after === undefined || after === null ? null : Number(after),
    location: String(form.location).trim(),
    sensorId: form.sensorId || null,
  }
}

export class ApiRepository {
  constructor({ baseUrl, fetchImpl } = {}) {
    this.baseUrl = String(baseUrl).replace(/\/+$/, '')
    // Keep the global receiver: `window.fetch` must be called bound to window.
    this.fetchImpl = fetchImpl ?? ((...args) => globalThis.fetch(...args))
    this.snapshot = null
    this.listeners = new Set()
    this.sourceKind = 'api'
    this.info = {
      kind: 'api',
      label: 'API PLUVSTATS',
      description:
        'Dados servidos pela API local. O ambiente permanece demonstrativo enquanto não houver leitura física validada.',
    }
  }

  endpoint(path) {
    return this.baseUrl.endsWith('/api') ? `${this.baseUrl}${path.replace(/^\/api/, '')}` : `${this.baseUrl}${path}`
  }

  async request(path, { method = 'GET', body } = {}) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS)
    try {
      const response = await this.fetchImpl(this.endpoint(path), {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })
      const text = await response.text()
      let payload = null
      if (text) {
        try {
          payload = JSON.parse(text)
        } catch {
          payload = null
        }
      }
      if (!response.ok) {
        if (response.status === 422) {
          throw new ValidationError(fieldErrorsFromDetail(payload?.detail))
        }
        const detail = payload?.detail
        const message =
          typeof detail === 'string'
            ? detail
            : `A API respondeu com status ${response.status}.`
        throw new Error(message)
      }
      return payload
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error('Tempo esgotado ao consultar a API PLUVSTATS.')
      }
      throw error
    } finally {
      clearTimeout(timeout)
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

  async init() {
    this.snapshot = await this.request('/api/snapshot')
    this.emit()
    return this.snapshot
  }

  getSnapshot() {
    return this.snapshot
  }

  async refresh() {
    this.snapshot = await this.request('/api/snapshot')
    this.emit()
    return this.snapshot
  }

  async tickSimulation() {
    const payload = await this.request('/api/simulation/tick', { method: 'POST' })
    this.snapshot = payload?.snapshot ?? (await this.request('/api/snapshot'))
    this.emit()
    return this.snapshot
  }

  async controlSimulation(command) {
    const payload = await this.request('/api/simulation/commands', { method: 'POST', body: command })
    this.snapshot = payload?.snapshot ?? (await this.request('/api/snapshot'))
    this.emit()
    return this.snapshot
  }

  async createOccurrence(form) {
    const errors = validateOccurrence(form)
    if (hasErrors(errors)) throw new ValidationError(errors)
    const record = await this.request('/api/occurrences', {
      method: 'POST',
      body: toOccurrencePayload(form),
    })
    await this.refresh()
    return record
  }

  async updateOccurrence(id, form) {
    const errors = validateOccurrence(form)
    if (hasErrors(errors)) throw new ValidationError(errors)
    const record = await this.request(`/api/occurrences/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: toOccurrencePayload(form),
    })
    await this.refresh()
    return record
  }

  async deleteOccurrence(id) {
    const result = await this.request(`/api/occurrences/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    await this.refresh()
    return result
  }

  async createIntervention(form) {
    const errors = validateIntervention(form)
    if (hasErrors(errors)) throw new ValidationError(errors)
    const record = await this.request('/api/interventions', {
      method: 'POST',
      body: interventionPayload(form),
    })
    await this.refresh()
    return record
  }

  async updateIntervention(id, form) {
    const errors = validateIntervention(form)
    if (hasErrors(errors)) throw new ValidationError(errors)
    const record = await this.request(`/api/interventions/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: interventionPayload(form),
    })
    await this.refresh()
    return record
  }

  async acknowledgeAlert(id) {
    const record = await this.request(`/api/alerts/${encodeURIComponent(id)}/acknowledge`, {
      method: 'POST',
    })
    await this.refresh()
    return record
  }

  async resolveAlert(id) {
    const record = await this.request(`/api/alerts/${encodeURIComponent(id)}/resolve`, {
      method: 'POST',
    })
    await this.refresh()
    return record
  }

  async resetDemo() {
    const payload = await this.request('/api/demo/reset', { method: 'POST' })
    this.snapshot = payload?.snapshot ?? (await this.request('/api/snapshot'))
    this.emit()
    return this.snapshot
  }
}

export function createApiRepository(baseUrl, options = {}) {
  return new ApiRepository({ baseUrl, ...options })
}

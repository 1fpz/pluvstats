import { runtimeConfig } from '@/config'
import { createApiRepository } from './apiRepository'
import { demoRepository } from './demoRepository'

const DEMO_INFO = {
  kind: 'demo',
  label: 'Demonstração local',
  description: 'Dados gerados no navegador pelo runtime de demonstração. Nenhum hardware está conectado.',
}

const API_INFO = {
  kind: 'api',
  label: 'API PLUVSTATS',
  description:
    'Dados servidos pela API local. O ambiente permanece demonstrativo enquanto não houver leitura física validada.',
}

export const dataSourceInfo = { ...DEMO_INFO }

const listeners = new Set()
let activeSource = demoRepository
let activeUnsubscribe = null
let lastApiError = null

function forwardToFacade(source) {
  if (activeUnsubscribe) activeUnsubscribe()
  activeSource = source
  activeUnsubscribe = source.subscribe((snapshot) => {
    listeners.forEach((listener) => listener(snapshot))
  })
}

function publishInfo(info) {
  Object.assign(dataSourceInfo, info)
}

/**
 * Single access point for persisted data. The local demonstration repository
 * remains the default. When VITE_API_BASE_URL is configured the API is probed
 * once at startup; a missing or unreachable API falls back to the local demo
 * without breaking the interface.
 */
export const dataSource = {
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  init() {
    return activeSource.init()
  },
  getSnapshot() {
    return activeSource.getSnapshot()
  },
  tickSimulation(...args) {
    return activeSource.tickSimulation(...args)
  },
  controlSimulation(...args) {
    return activeSource.controlSimulation(...args)
  },
  createOccurrence(...args) {
    return activeSource.createOccurrence(...args)
  },
  updateOccurrence(...args) {
    return activeSource.updateOccurrence(...args)
  },
  deleteOccurrence(...args) {
    return activeSource.deleteOccurrence(...args)
  },
  createIntervention(...args) {
    return activeSource.createIntervention(...args)
  },
  updateIntervention(...args) {
    return activeSource.updateIntervention(...args)
  },
  acknowledgeAlert(...args) {
    return activeSource.acknowledgeAlert(...args)
  },
  resolveAlert(...args) {
    return activeSource.resolveAlert(...args)
  },
  resetDemo(...args) {
    return activeSource.resetDemo(...args)
  },
}

export async function initializeDataSource() {
  if (runtimeConfig.isConfiguredApi) {
    const api = createApiRepository(runtimeConfig.apiBaseUrl)
    try {
      await api.init()
      lastApiError = null
      publishInfo(API_INFO)
      forwardToFacade(api)
      return api.getSnapshot()
    } catch (error) {
      lastApiError = error?.message ?? 'API indisponível.'
      publishInfo({
        ...DEMO_INFO,
        label: 'Demonstração local (fallback)',
        description: `A API configurada não respondeu: ${lastApiError} O runtime local assumiu com dados simulados.`,
      })
    }
  } else {
    publishInfo(DEMO_INFO)
  }

  demoRepository.init()
  forwardToFacade(demoRepository)
  return demoRepository.getSnapshot()
}

export function getDataSourceDiagnostics() {
  return {
    configuredApi: runtimeConfig.isConfiguredApi,
    apiBaseUrl: runtimeConfig.apiBaseUrl || null,
    activeKind: dataSourceInfo.kind,
    activeLabel: dataSourceInfo.label,
    lastApiError,
  }
}

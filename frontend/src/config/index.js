import rawConfig from '../../../shared/pluvstats.config.json'

const env = import.meta.env ?? {}

function trimTrailingSlash(value) {
  return typeof value === 'string' ? value.replace(/\/+$/, '') : value
}

export const appConfig = rawConfig

export const product = rawConfig.product
export const territory = rawConfig.territory
export const thresholds = rawConfig.thresholds
export const sensorGeometry = rawConfig.sensorGeometry
export const simulationConfig = rawConfig.simulation
export const scenarioDefinitions = rawConfig.simulation.scenarios
export const operationConfig = rawConfig.operation

export const runtimeConfig = {
  apiBaseUrl: trimTrailingSlash(env.VITE_API_BASE_URL ?? ''),
  weatherBaseUrl: trimTrailingSlash(env.VITE_WEATHER_BASE_URL ?? 'https://api.open-meteo.com/v1'),
  operationMode: env.VITE_OPERATION_MODE === 'hardware' ? 'hardware' : 'demo',
  weatherCacheTtlMinutes: Number(env.VITE_WEATHER_CACHE_TTL_MINUTES ?? 15),
  requestTimeoutMs: 7000,
  isConfiguredApi: Boolean(env.VITE_API_BASE_URL),
}

export const DEMO_LABEL = 'AMBIENTE DE DEMONSTRAÇÃO — DADOS SIMULADOS'

export const HARDWARE_ABSENCE_MESSAGE =
  'Nenhum sensor físico validado. O sistema está apresentando uma demonstração funcional da experiência de monitoramento.'

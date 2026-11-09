import { runtimeConfig, territory } from '@/config'

const CACHE_KEY = 'pluvstats.weather.v1'

const WMO = {
  0: { label: 'Céu limpo', icon: 'sun' },
  1: { label: 'Predominantemente limpo', icon: 'sun' },
  2: { label: 'Parcialmente nublado', icon: 'cloud-sun' },
  3: { label: 'Nublado', icon: 'cloud' },
  45: { label: 'Neblina', icon: 'cloud-fog' },
  48: { label: 'Neblina com geada', icon: 'cloud-fog' },
  51: { label: 'Garoa leve', icon: 'cloud-drizzle' },
  53: { label: 'Garoa moderada', icon: 'cloud-drizzle' },
  55: { label: 'Garoa intensa', icon: 'cloud-drizzle' },
  56: { label: 'Garoa congelante', icon: 'cloud-drizzle' },
  57: { label: 'Garoa congelante intensa', icon: 'cloud-drizzle' },
  61: { label: 'Chuva leve', icon: 'cloud-rain' },
  63: { label: 'Chuva moderada', icon: 'cloud-rain' },
  65: { label: 'Chuva forte', icon: 'cloud-rain' },
  66: { label: 'Chuva congelante', icon: 'cloud-rain' },
  67: { label: 'Chuva congelante forte', icon: 'cloud-rain' },
  71: { label: 'Neve leve', icon: 'snowflake' },
  73: { label: 'Neve moderada', icon: 'snowflake' },
  75: { label: 'Neve forte', icon: 'snowflake' },
  80: { label: 'Pancadas leves', icon: 'cloud-rain' },
  81: { label: 'Pancadas moderadas', icon: 'cloud-rain' },
  82: { label: 'Pancadas violentas', icon: 'cloud-rain-wind' },
  95: { label: 'Tempestade', icon: 'cloud-lightning' },
  96: { label: 'Tempestade com granizo', icon: 'cloud-lightning' },
  99: { label: 'Tempestade com granizo forte', icon: 'cloud-lightning' },
}

export class WeatherError extends Error {
  constructor(message) {
    super(message)
    this.name = 'WeatherError'
  }
}

function cacheGet() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function cacheSet(value) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(value))
  } catch {
    // Cache is an optimisation; failure must not break the weather panel.
  }
}

function describeCode(code) {
  return WMO[code] ?? { label: 'Condição não classificada', icon: 'cloud' }
}

function buildUrl() {
  const base = runtimeConfig.weatherBaseUrl || 'https://api.open-meteo.com/v1'
  const params = new URLSearchParams({
    latitude: String(territory.center[0]),
    longitude: String(territory.center[1]),
    current: 'temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m',
    hourly: 'precipitation,precipitation_probability,temperature_2m',
    daily: 'precipitation_sum,precipitation_probability_max,weather_code',
    timezone: 'America/Sao_Paulo',
    forecast_days: '2',
  })
  return `${base}/forecast?${params.toString()}`
}

function normalize(payload) {
  const now = new Date().toISOString()
  const currentCondition = describeCode(payload.current?.weather_code)
  const hourlyTimes = payload.hourly?.time ?? []
  const currentIndex = hourlyTimes.findIndex(
    (time) => new Date(time).getTime() >= Date.now() - 60 * 60 * 1000,
  )
  const start = currentIndex === -1 ? 0 : Math.max(0, currentIndex)

  return {
    source: 'Open-Meteo',
    sourceUrl: 'https://open-meteo.com/',
    fetchedAt: now,
    timezone: payload.timezone ?? 'America/Sao_Paulo',
    coordinates: {
      lat: payload.latitude ?? territory.center[0],
      lng: payload.longitude ?? territory.center[1],
    },
    current: {
      temperatureC: payload.current?.temperature_2m ?? null,
      humidity: payload.current?.relative_humidity_2m ?? null,
      precipitationMm: payload.current?.precipitation ?? 0,
      rainMm: payload.current?.rain ?? 0,
      windKmh: payload.current?.wind_speed_10m ?? null,
      weatherCode: payload.current?.weather_code ?? null,
      condition: currentCondition.label,
      icon: currentCondition.icon,
      fetchedAt: now,
    },
    hourly: hourlyTimes.slice(start, start + 24).map((time, index) => {
      const sourceIndex = start + index
      return {
        time,
        precipitationMm: payload.hourly?.precipitation?.[sourceIndex] ?? 0,
        probability: payload.hourly?.precipitation_probability?.[sourceIndex] ?? 0,
        temperatureC: payload.hourly?.temperature_2m?.[sourceIndex] ?? null,
      }
    }),
    daily: (payload.daily?.time ?? []).slice(0, 2).map((time, index) => ({
      date: time,
      precipitationMm: payload.daily?.precipitation_sum?.[index] ?? 0,
      probability: payload.daily?.precipitation_probability_max?.[index] ?? 0,
      condition: describeCode(payload.daily?.weather_code?.[index]).label,
    })),
    disclaimer:
      'Dados meteorológicos externos da Open-Meteo. Não são leituras do sensor PLUVSTATS e não constituem alerta oficial.',
  }
}

export async function fetchWeather({ force = false } = {}) {
  const cached = cacheGet()
  const ttlMs = runtimeConfig.weatherCacheTtlMinutes * 60 * 1000
  const cachedAge = cached ? Date.now() - new Date(cached.data?.fetchedAt).getTime() : Infinity

  if (!force && cached?.data && cachedAge < ttlMs) {
    return { data: cached.data, fromCache: true, cacheAgeMs: cachedAge }
  }

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), runtimeConfig.requestTimeoutMs)

  try {
    const response = await fetch(buildUrl(), {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      throw new WeatherError(`A Open-Meteo respondeu com status ${response.status}.`)
    }
    const payload = await response.json()
    if (!payload?.current) throw new WeatherError('Resposta meteorológica sem dados atuais.')
    const data = normalize(payload)
    cacheSet({ data })
    return { data, fromCache: false, cacheAgeMs: 0 }
  } catch (error) {
    if (cached?.data) {
      return {
        data: cached.data,
        fromCache: true,
        cacheAgeMs: Date.now() - new Date(cached.data.fetchedAt).getTime(),
        error: error?.name === 'AbortError' ? 'Tempo esgotado ao consultar a Open-Meteo.' : error.message,
      }
    }
    if (error?.name === 'AbortError') {
      throw new WeatherError('A consulta à Open-Meteo excedeu o tempo limite. Tente novamente.')
    }
    throw new WeatherError(
      error instanceof WeatherError
        ? error.message
        : 'Não foi possível consultar a Open-Meteo. Verifique a conexão e tente novamente.',
    )
  } finally {
    window.clearTimeout(timeout)
  }
}

export function clearWeatherCache() {
  try {
    window.localStorage.removeItem(CACHE_KEY)
  } catch {
    // no-op
  }
}

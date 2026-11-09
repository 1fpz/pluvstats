const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
})

const integerFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
})

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return dateTimeFormatter.format(date)
}

export function formatTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return timeFormatter.format(date)
}

export function formatShortDay(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return dayFormatter.format(date)
}

export function formatNumber(value, options = {}) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return numberFormatter.format(Number(value), options)
}

export function formatInteger(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return integerFormatter.format(Number(value))
}

export function formatCm(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return `${Number(value).toFixed(digits).replace('.', ',')} cm`
}

export function formatRate(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  const sign = Number(value) > 0 ? '+' : ''
  return `${sign}${formatNumber(value)} cm/min`
}

export function formatCoordinates(lat, lng) {
  if (lat === null || lng === null) return '—'
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`
}

export function formatRelativeTime(value, reference = Date.now()) {
  if (!value) return '—'
  const date = new Date(value)
  const diff = reference - date.getTime()
  if (Number.isNaN(diff)) return '—'
  const seconds = Math.round(diff / 1000)
  if (seconds < 10) return 'agora'
  if (seconds < 60) return `${seconds}s atrás`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min atrás`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h atrás`
  const days = Math.round(hours / 24)
  return `${days} d atrás`
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '—'
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`
  if (m > 0) return `${m}min ${String(s).padStart(2, '0')}s`
  return `${s}s`
}

export function formatPercent(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return `${Number(value).toFixed(digits).replace('.', ',')}%`
}

export function titleCase(value) {
  if (!value) return ''
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function truncate(value, max = 90) {
  if (!value) return ''
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

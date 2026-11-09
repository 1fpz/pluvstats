import { cn } from '@/utils/cn'

/** Lightweight dependency-free sparkline used in dense cards and tables. */
export function Sparkline({ values = [], width = 120, height = 34, stroke = '#00A6CC', className, fill = true }) {
  const data = values.filter((value) => Number.isFinite(Number(value))).map(Number)
  if (data.length < 2) {
    return <div className={cn('h-[34px] w-[120px] rounded bg-navy-800/50', className)} aria-hidden="true" />
  }
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = width / (data.length - 1)
  const points = data.map((value, index) => {
    const x = index * step
    const y = height - 3 - ((value - min) / range) * (height - 6)
    return [x, y]
  })
  const line = points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const area = `0,${height} ${line} ${width},${height}`
  const gradientId = `spark-${stroke.replace('#', '')}-${Math.round(width)}-${Math.round(height)}`
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill ? <polygon points={area} fill={`url(#${gradientId})`} /> : null}
      <polyline points={line} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

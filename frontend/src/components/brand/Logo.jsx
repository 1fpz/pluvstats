import { useId } from 'react'
import { cn } from '@/utils/cn'

export function LogoMark({ className, size = 32 }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`mark-${id}`} x1="14" y1="18" x2="50" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8FD0CA" />
          <stop offset="1" stopColor="#3F827C" />
        </linearGradient>
      </defs>
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15" fill="#11151A" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <path
        d="M16 27.5c5.3 0 5.3-5.5 10.7-5.5s5.3 5.5 10.6 5.5 5.3-5.5 10.7-5.5"
        stroke={`url(#mark-${id})`}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M16 38c5.3 0 5.3-5.5 10.7-5.5S32 38 37.3 38s5.3-5.5 10.7-5.5"
        stroke={`url(#mark-${id})`}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="45.5" cy="46.5" r="2.5" fill="#8FD0CA" />
    </svg>
  )
}

export function Logo({ size = 32, showTagline = false, className }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      <div className="leading-none">
        <p className="text-[15px] font-bold tracking-[0.01em] text-mist">
          PLUV<span className="text-cyan-300">STATS</span>
        </p>
        {showTagline ? (
          <p className="mt-2 max-w-[190px] text-[9.5px] font-medium uppercase tracking-[0.13em] text-muted">
            Inteligência territorial para águas urbanas
          </p>
        ) : null}
      </div>
    </div>
  )
}

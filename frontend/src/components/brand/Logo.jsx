import { useId } from 'react'
import { cn } from '@/utils/cn'

export function LogoMark({ className, size = 36 }) {
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
        <linearGradient id={`drop-${id}`} x1="18" y1="14" x2="48" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2BC4E6" />
          <stop offset="0.55" stopColor="#00A6CC" />
          <stop offset="1" stopColor="#148B86" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="63" height="63" rx="16" fill="#081F33" stroke="rgba(148,184,208,0.18)" />
      <path
        d="M32 11.5c6.2 7.8 12.4 16 12.4 23.5 0 9.3-5.6 14.8-12.4 14.8s-12.4-5.5-12.4-14.8c0-7.5 6.2-15.7 12.4-23.5Z"
        fill={`url(#drop-${id})`}
      />
      <path
        d="M23.2 36.6c4.6 1.7 9.3-1 12.7-3.3 3.1-2.1 6.2-3.1 9-2.3M25.6 42.1c3.6.8 7.1-.6 9.9-2.3"
        stroke="#F4F8FC"
        strokeOpacity="0.9"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="43.4" cy="21.2" r="2.3" fill="#F4F8FC" />
    </svg>
  )
}

export function Logo({ size = 36, showTagline = false, className }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoMark size={size} />
      <div className="leading-none">
        <p className="font-display text-[17px] font-bold tracking-[0.08em] text-mist">
          PLUV<span className="text-cyan">STATS</span>
        </p>
        {showTagline ? (
          <p className="mt-2 max-w-[190px] font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
            Inteligência territorial para águas urbanas
          </p>
        ) : null}
      </div>
    </div>
  )
}

import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export function Spinner({ className, label = 'Carregando' }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-xs text-muted', className)} role="status">
      <Loader2 className="h-4 w-4 animate-spin text-cyan" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export function LoadingBlock({ label = 'Carregando dados', className }) {
  return (
    <div className={cn('flex min-h-40 flex-col items-center justify-center gap-3', className)} role="status">
      <div className="relative grid h-10 w-10 place-items-center rounded-full border border-cyan/20">
        <span className="absolute inset-0 animate-ping-slow rounded-full border border-cyan/30" />
        <Loader2 className="h-4 w-4 animate-spin text-cyan" aria-hidden="true" />
      </div>
      <p className="text-xs text-muted">{label}</p>
    </div>
  )
}

export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />
}

export function SkeletonCard() {
  return (
    <div className="panel space-y-4 p-5" aria-hidden="true">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-2 w-full" />
    </div>
  )
}

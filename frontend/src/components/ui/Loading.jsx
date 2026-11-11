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
      <Loader2 className="h-5 w-5 animate-spin text-cyan" aria-hidden="true" />
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
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-2 w-full" />
    </div>
  )
}

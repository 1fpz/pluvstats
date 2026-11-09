import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/utils/cn'

const ToastContext = createContext(null)

const VARIANTS = {
  success: { icon: CheckCircle2, className: 'border-success/30 text-success' },
  error: { icon: AlertTriangle, className: 'border-critical/30 text-critical' },
  warning: { icon: AlertTriangle, className: 'border-warning/30 text-warning' },
  info: { icon: Info, className: 'border-cyan/30 text-cyan-300' },
}

let toastCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({ title, description, variant = 'info', duration = 4200 }) => {
      const id = ++toastCounter
      setToasts((current) => [...current.slice(-3), { id, title, description, variant }])
      if (duration > 0) window.setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss],
  )

  const value = useMemo(() => ({ showToast, dismiss }), [showToast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[2000] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
        role="region"
        aria-label="Notificações"
      >
        {toasts.map((toast) => {
          const meta = VARIANTS[toast.variant] ?? VARIANTS.info
          const Icon = meta.icon
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-navy-850/95 p-3.5 shadow-panel backdrop-blur animate-fade-up',
                meta.className,
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                {toast.title ? <p className="text-xs font-semibold text-ink">{toast.title}</p> : null}
                {toast.description ? (
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="text-muted transition hover:text-ink"
                aria-label="Fechar notificação"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast deve ser usado dentro de ToastProvider.')
  return context
}

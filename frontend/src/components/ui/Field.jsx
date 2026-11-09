import { useId } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

const controlBase =
  'w-full rounded-xl border bg-navy-950/60 px-3 text-sm text-ink placeholder:text-muted/70 transition focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/20 disabled:cursor-not-allowed disabled:opacity-60'

export function FormField({ label, htmlFor, hint, error, required, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label htmlFor={htmlFor} className="flex items-center gap-1 text-xs font-medium text-ink">
          {label}
          {required ? <span className="text-cyan">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-[11px] text-critical" role="alert">
          <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] leading-relaxed text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({ label, hint, error, required, className, id, ...props }) {
  const generated = useId()
  const inputId = id ?? generated
  return (
    <FormField label={label} htmlFor={inputId} hint={hint} error={error} required={required}>
      <input
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(controlBase, 'h-10', error ? 'border-critical/60' : 'border-line', className)}
        {...props}
      />
    </FormField>
  )
}

export function Select({ label, hint, error, required, className, id, children, ...props }) {
  const generated = useId()
  const selectId = id ?? generated
  return (
    <FormField label={label} htmlFor={selectId} hint={hint} error={error} required={required}>
      <select
        id={selectId}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(controlBase, 'h-10 appearance-none', error ? 'border-critical/60' : 'border-line', className)}
        {...props}
      >
        {children}
      </select>
    </FormField>
  )
}

export function Textarea({ label, hint, error, required, className, id, rows = 4, ...props }) {
  const generated = useId()
  const textareaId = id ?? generated
  return (
    <FormField label={label} htmlFor={textareaId} hint={hint} error={error} required={required}>
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(controlBase, 'resize-y py-2.5', error ? 'border-critical/60' : 'border-line', className)}
        {...props}
      />
    </FormField>
  )
}

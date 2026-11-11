import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const variants = {
  primary: 'bg-mist text-abyss hover:bg-white active:bg-ink',
  secondary: 'border border-line bg-white/[0.03] text-ink hover:border-white/[0.16] hover:bg-white/[0.06]',
  ghost: 'text-muted hover:bg-white/[0.05] hover:text-ink',
  danger: 'border border-critical/30 bg-critical/[0.08] text-critical hover:bg-critical/[0.14]',
  subtle: 'bg-cyan/[0.1] text-cyan-300 hover:bg-cyan/[0.16]',
  link: 'text-cyan-300 underline-offset-4 hover:text-cyan-400 hover:underline',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-[13px] gap-2',
  lg: 'h-10 px-4 text-sm gap-2',
  icon: 'h-9 w-9',
  'icon-sm': 'h-7 w-7',
}

export function buttonClass({ variant = 'primary', size = 'md', className = '' } = {}) {
  return cn(
    'inline-flex select-none items-center justify-center rounded-lg font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-abyss disabled:cursor-not-allowed disabled:opacity-45',
    variants[variant] ?? variants.primary,
    sizes[size] ?? sizes.md,
    className,
  )
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className,
  type = 'button',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonClass({ variant, size, className })}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {children}
      {IconRight && !loading ? <IconRight className="h-4 w-4" aria-hidden="true" /> : null}
    </button>
  )
}

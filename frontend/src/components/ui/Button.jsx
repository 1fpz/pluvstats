import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const variants = {
  primary:
    'bg-cyan text-abyss hover:bg-cyan-400 active:bg-cyan-600 shadow-[0_8px_24px_-12px_rgba(0,166,204,0.8)] disabled:hover:bg-cyan',
  secondary: 'border border-line bg-navy-800/80 text-ink hover:border-cyan/35 hover:bg-navy-700/80',
  ghost: 'text-muted hover:bg-navy-800/70 hover:text-ink',
  danger: 'border border-critical/35 bg-critical/10 text-critical hover:bg-critical/20',
  subtle: 'bg-cyan/10 text-cyan-300 hover:bg-cyan/15',
  link: 'text-cyan-300 underline-offset-4 hover:text-cyan-400 hover:underline',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
  icon: 'h-9 w-9',
  'icon-sm': 'h-7 w-7',
}

export function buttonClass({ variant = 'primary', size = 'md', className = '' } = {}) {
  return cn(
    'inline-flex select-none items-center justify-center rounded-xl font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/70 focus-visible:ring-offset-2 focus-visible:ring-offset-abyss disabled:cursor-not-allowed disabled:opacity-50',
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

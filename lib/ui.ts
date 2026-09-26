import { cn } from '@/lib/utils'

const base =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-heading text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-5 [&_svg]:shrink-0'

export const btn = {
  primary: cn(base, 'bg-primary text-primary-foreground hover:bg-primary/90'),
  sun: cn(base, 'bg-sun text-ink hover:bg-sun/85'),
  outline: cn(base, 'border-2 border-primary bg-card text-primary hover:bg-primary-soft'),
  ghost: cn(base, 'text-foreground hover:bg-muted'),
  onInk: cn(base, 'border-2 border-ink-foreground/70 text-ink-foreground hover:bg-ink-foreground/10'),
  danger: cn(base, 'bg-destructive text-destructive-foreground hover:bg-destructive/90'),
}

export const card = 'rounded-3xl bg-card text-card-foreground shadow-sm ring-1 ring-border'

export const inputClass =
  'min-h-12 w-full rounded-2xl border-2 border-input bg-card px-4 text-base text-foreground placeholder:text-muted-foreground/80 focus-visible:border-primary aria-[invalid=true]:border-destructive'

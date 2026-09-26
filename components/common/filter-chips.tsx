'use client'

import { cn } from '@/lib/utils'

export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="pb-2 font-bold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={cn(
                'min-h-11 rounded-full px-4 font-bold ring-1 transition-colors',
                active
                  ? 'bg-primary text-primary-foreground ring-primary'
                  : 'bg-card text-foreground ring-border hover:bg-primary-soft',
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

'use client'

import { HeartHandshake } from 'lucide-react'
import Link from 'next/link'
import { useT } from '@/components/providers/preferences-provider'
import { cn } from '@/lib/utils'

export function Logo({ onInk = false, href = '/' }: { onInk?: boolean; href?: string }) {
  const t = useT()
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-full">
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-full',
          onInk ? 'bg-sun text-ink' : 'bg-primary text-primary-foreground',
        )}
      >
        <HeartHandshake aria-hidden="true" className="size-5" />
      </span>
      <span className={cn('font-heading text-xl font-extrabold', onInk ? 'text-ink-foreground' : 'text-foreground')}>
        {t('common.appName')}
      </span>
    </Link>
  )
}

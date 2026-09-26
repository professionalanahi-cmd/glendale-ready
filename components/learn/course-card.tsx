'use client'

import { Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePreferences } from '@/components/providers/preferences-provider'
import type { Course } from '@/lib/types'
import { card } from '@/lib/ui'
import { cn } from '@/lib/utils'

export function CourseCard({ course, compact = false }: { course: Course; compact?: boolean }) {
  const { t, locale } = usePreferences()
  return (
    <article className={cn(card, 'group relative flex flex-col overflow-hidden')}>
      <div className="relative aspect-[16/10] bg-primary-soft">
        <Image
          src={course.thumbnail || '/placeholder.svg'}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-sm font-bold text-primary">{t(`topics.${course.topic}`)}</p>
        <h3 className="font-heading text-xl font-extrabold text-balance">
          <Link href={`/learn/${course.id}`} className="after:absolute after:inset-0 hover:underline">
            {course.title[locale]}
          </Link>
        </h3>
        {!compact ? <p className="leading-relaxed text-pretty text-muted-foreground">{course.description[locale]}</p> : null}
        <p className="mt-auto flex items-center gap-2 pt-2 text-sm font-bold">
          <Clock aria-hidden="true" className="size-4" />
          {t('common.minutes', { n: course.durationMinutes })}
        </p>
      </div>
    </article>
  )
}

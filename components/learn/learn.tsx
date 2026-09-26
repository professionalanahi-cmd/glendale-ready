'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/common/bits'
import { FilterChips } from '@/components/common/filter-chips'
import { useProfile } from '@/components/providers/auth-provider'
import { usePreferences } from '@/components/providers/preferences-provider'
import { courses } from '@/lib/content/courses'
import { useHazards } from '@/lib/hooks'
import { recommendedCourses } from '@/lib/recommend'
import type { TopicCategory } from '@/lib/types'
import { CourseCard } from './course-card'

type Filter = TopicCategory | 'all'

export function Learn() {
  const { t } = usePreferences()
  const { profile } = useProfile()
  const { data } = useHazards(profile)
  const [filter, setFilter] = useState<Filter>('all')

  const recommended = recommendedCourses(data?.hazards, profile).slice(0, 3)
  const topics = Array.from(new Set(courses.map((c) => c.topic)))
  const list = filter === 'all' ? courses : courses.filter((c) => c.topic === filter)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-5 py-10">
      <PageHeader title={t('learn.title')} subtitle={t('learn.subtitle')} />

      {recommended.length ? (
        <section aria-labelledby="recommended" className="flex flex-col gap-4">
          <h2 id="recommended" className="font-heading text-2xl font-extrabold">
            {t('learn.recommended')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="all-courses" className="flex flex-col gap-5">
        <h2 id="all-courses" className="font-heading text-2xl font-extrabold">
          {t('learn.all')}
        </h2>
        <FilterChips<Filter>
          label={t('learn.filterLabel')}
          value={filter}
          onChange={setFilter}
          options={[{ value: 'all', label: t('learn.allTopics') }, ...topics.map((tp) => ({ value: tp, label: t(`topics.${tp}`) }))]}
        />
        <div aria-live="polite">
          {list.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <p className="text-lg">{t('learn.empty')}</p>
          )}
        </div>
      </section>
    </div>
  )
}

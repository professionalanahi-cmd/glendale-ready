'use client'

import { useState } from 'react'
import { InfoNote, PageHeader } from '@/components/common/bits'
import { FilterChips } from '@/components/common/filter-chips'
import { usePreferences } from '@/components/providers/preferences-provider'
import { trainingEvents } from '@/lib/content/catalog'
import type { TopicCategory } from '@/lib/types'
import { EventCard } from './event-card'

type Filter = TopicCategory | 'all'

export function Training() {
  const { t } = usePreferences()
  const [filter, setFilter] = useState<Filter>('all')
  const upcoming = trainingEvents
    .filter((e) => new Date(e.end).getTime() >= Date.now())
    .sort((a, b) => a.start.localeCompare(b.start))
  const topics = Array.from(new Set(upcoming.map((e) => e.category)))
  const list = filter === 'all' ? upcoming : upcoming.filter((e) => e.category === filter)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
      <PageHeader title={t('training.title')} subtitle={t('training.subtitle')} />
      {upcoming.some((e) => e.isDemo) ? <InfoNote>{t('training.demoEvent')}</InfoNote> : null}
      {topics.length > 1 ? (
        <FilterChips<Filter>
          label={t('training.filterLabel')}
          value={filter}
          onChange={setFilter}
          options={[{ value: 'all', label: t('training.allTopics') }, ...topics.map((tp) => ({ value: tp, label: t(`topics.${tp}`) }))]}
        />
      ) : null}
      <div aria-live="polite">
        {list.length ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {list.map((e) => (
              <li key={e.id} className="flex">
                <EventCard event={e} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg">{t('training.empty')}</p>
        )}
      </div>
    </div>
  )
}

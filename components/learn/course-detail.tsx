'use client'

import { ArrowLeft, CheckCircle2, Clock, FileText, PlayCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { SourceNote } from '@/components/common/bits'
import { ListenButton } from '@/components/common/listen-button'
import { usePreferences } from '@/components/providers/preferences-provider'
import { intlTag, pick } from '@/lib/i18n'
import type { Course, LocalizedText } from '@/lib/types'
import { card } from '@/lib/ui'
import { cn } from '@/lib/utils'

function Steps({ id, title, items }: { id: string; title: string; items: LocalizedText[] }) {
  const { t, locale } = usePreferences()
  if (!items.length) return null
  const text = [title, ...items.map((i) => pick(i, locale))].join('. ')
  return (
    <section aria-labelledby={id} className={cn(card, 'flex flex-col gap-4 p-6')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={id} className="font-heading text-2xl font-extrabold">
          {title}
        </h2>
        <ListenButton text={text} label={t('learn.readAloud')} />
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((i) => (
          <li key={i.en} className="flex items-start gap-3 text-lg leading-relaxed">
            <CheckCircle2 aria-hidden="true" className="mt-1.5 size-5 shrink-0 text-primary" />
            {pick(i, locale)}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function CourseDetail({ course }: { course: Course }) {
  const { t, locale } = usePreferences()
  const fmt = (d: string) => new Date(d).toLocaleDateString(intlTag[locale], { dateStyle: 'long' })
  const hasContent = course.before.length + course.during.length + course.after.length > 0

  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-8 px-5 py-10">
      <Link href="/learn" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full px-3 font-bold text-primary hover:bg-primary-soft">
        <ArrowLeft aria-hidden="true" className="size-5" />
        {t('learn.backToCourses')}
      </Link>

      <header className="flex flex-col gap-3">
        <p className="text-sm font-bold tracking-wide text-primary uppercase">{t(`topics.${course.topic}`)}</p>
        <h1 className="font-heading text-4xl font-extrabold text-balance">{pick(course.title, locale)}</h1>
        <p className="text-xl leading-relaxed text-pretty">{pick(course.description, locale)}</p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <Clock aria-hidden="true" className="size-4" />
          {t('learn.courseLength', { n: course.durationMinutes })}
        </p>
      </header>

      <section aria-label={t('learn.videoLabel')} className="flex flex-col gap-3">
        {course.media.videoAvailable ? (
          <video controls preload="metadata" poster={course.thumbnail} className="aspect-video w-full rounded-3xl bg-ink">
            <source src={course.media.videoSrc} />
            {course.media.transcriptAvailable && course.media.transcriptSrc ? (
              <track kind="captions" src={course.media.transcriptSrc} srcLang={locale} label={locale} default />
            ) : null}
          </video>
        ) : (
          <div className="relative aspect-video overflow-hidden rounded-3xl bg-ink">
            <Image src={course.thumbnail} alt="" fill sizes="(min-width: 896px) 896px, 100vw" className="object-cover opacity-40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-ink-foreground">
              <PlayCircle aria-hidden="true" className="size-14" />
              <p className="font-heading text-xl font-extrabold">{t('learn.videoComingSoon')}</p>
            </div>
          </div>
        )}
        {!course.media.transcriptAvailable ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <FileText aria-hidden="true" className="size-4" />
            {t('learn.transcriptComingSoon')}
          </p>
        ) : null}
      </section>

      {course.learn.length ? (
        <section aria-labelledby="learn-list" className="flex flex-col gap-3">
          <h2 id="learn-list" className="font-heading text-2xl font-extrabold">
            {t('learn.whatYouLearn')}
          </h2>
          <ul className="flex list-disc flex-col gap-2 pl-6 text-lg leading-relaxed">
            {course.learn.map((l) => (
              <li key={l.en}>{pick(l, locale)}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasContent ? (
        <>
          <Steps id="before" title={t('learn.before')} items={course.before} />
          <Steps id="during" title={t('learn.during')} items={course.during} />
          <Steps id="after" title={t('learn.after')} items={course.after} />
        </>
      ) : (
        <p className="text-lg">{t('learn.contentComingSoon')}</p>
      )}

      <footer className="flex flex-col gap-2 border-t border-border pt-6">
        <SourceNote source={course.source} />
        <p className="text-sm text-muted-foreground">
          {t('learn.published')}: {fmt(course.publishedAt)} · {t('learn.updated')}: {fmt(course.updatedAt)}
        </p>
      </footer>
    </article>
  )
}

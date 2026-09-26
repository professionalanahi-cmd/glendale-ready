'use client'

import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useRef, useState } from 'react'
import { PageHeader, SourceNote } from '@/components/common/bits'
import { usePreferences } from '@/components/providers/preferences-provider'
import { alarmSounds } from '@/lib/content/catalog'
import { pick } from '@/lib/i18n'
import type { AlarmSound } from '@/lib/types'
import { card } from '@/lib/ui'
import { cn } from '@/lib/utils'

function SoundCard({ sound }: { sound: AlarmSound }) {
  const { t, locale } = usePreferences()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const name = pick(sound.name, locale)

  function toggle() {
    const el = audioRef.current
    if (!el) return
    if (el.paused) el.play().catch(() => setFailed(true))
    else el.pause()
  }

  return (
    <article className={cn(card, 'flex flex-col gap-4 p-6')}>
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-coral-soft text-coral">
          {sound.audioSrc && !failed ? <Volume2 aria-hidden="true" className="size-6" /> : <VolumeX aria-hidden="true" className="size-6" />}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="font-heading text-xl font-extrabold text-balance">{name}</h2>
          <p className="text-muted-foreground">
            {t('sounds.agency')}: {sound.agency}
          </p>
        </div>
      </div>

      {sound.audioSrc && !failed ? (
        <>
          <audio
            ref={audioRef}
            src={sound.audioSrc}
            preload="none"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onError={() => setFailed(true)}
          />
          <button
            type="button"
            onClick={toggle}
            aria-pressed={playing}
            className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-primary px-5 font-heading font-bold text-primary-foreground hover:bg-primary/90"
          >
            {playing ? <Pause aria-hidden="true" className="size-5" /> : <Play aria-hidden="true" className="size-5" />}
            {playing ? t('sounds.pause') : t('sounds.play')}
            <span className="sr-only">: {name}</span>
          </button>
        </>
      ) : (
        <p role={failed ? 'alert' : undefined} className="rounded-2xl bg-muted p-3 font-bold">
          {failed ? t('sounds.loadError') : t('sounds.sampleComingSoon')}
        </p>
      )}

      <dl className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <dt className="font-bold">{t('sounds.meaning')}</dt>
          <dd className="leading-relaxed text-pretty">{(sound.meaning && pick(sound.meaning, locale)) ?? t('sounds.meaningComingSoon')}</dd>
        </div>
        {sound.whenHeard ? (
          <div className="flex flex-col gap-0.5">
            <dt className="font-bold">{t('sounds.whenHeard')}</dt>
            <dd className="leading-relaxed text-pretty">{pick(sound.whenHeard, locale)}</dd>
          </div>
        ) : null}
      </dl>
      <SourceNote source={sound.source} className="mt-auto" />
    </article>
  )
}

export function Sounds() {
  const { t } = usePreferences()
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
      <PageHeader title={t('sounds.title')} subtitle={t('sounds.subtitle')} />
      <div className="grid gap-4 md:grid-cols-2">
        {alarmSounds.map((s) => (
          <SoundCard key={s.id} sound={s} />
        ))}
      </div>
    </div>
  )
}

'use client'

import { Square, Volume2 } from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { speechLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const subscribeNoop = () => () => {}

/** Reads text aloud with the browser's built-in speech. Hidden when unsupported. */
export function ListenButton({ text, label, className }: { text: string; label?: string; className?: string }) {
  const { t, locale } = usePreferences()
  const [speaking, setSpeaking] = useState(false)
  const supported = useSyncExternalStore(
    subscribeNoop,
    () => 'speechSynthesis' in window,
    () => false,
  )

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  if (!supported) return null

  function toggle() {
    const synth = window.speechSynthesis
    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = speechLang[locale]
    utterance.rate = 0.9
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    setSpeaking(true)
    synth.speak(utterance)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-full bg-muted px-4 text-sm font-bold text-foreground hover:bg-primary-soft',
        className,
      )}
    >
      {speaking ? <Square aria-hidden="true" className="size-4" /> : <Volume2 aria-hidden="true" className="size-4" />}
      {speaking ? t('common.stopListening') : (label ?? t('common.listen'))}
    </button>
  )
}

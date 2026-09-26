'use client'

import { Square, Volume2 } from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { speechLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

function subscribeVoices(onChange: () => void) {
  if (!('speechSynthesis' in window)) return () => {}
  window.speechSynthesis.addEventListener('voiceschanged', onChange)
  return () => window.speechSynthesis.removeEventListener('voiceschanged', onChange)
}

/** Many devices have no voice for some languages (e.g. Armenian); a mismatched voice mispronounces the text. */
function hasVoiceFor(lang: string) {
  if (!('speechSynthesis' in window)) return false
  const prefix = lang.split('-')[0].toLowerCase()
  return window.speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith(prefix))
}

/** Reads text aloud with the browser's built-in speech. Hidden when no matching voice is available. */
export function ListenButton({ text, label, className }: { text: string; label?: string; className?: string }) {
  const { t, locale } = usePreferences()
  const [speaking, setSpeaking] = useState(false)
  const supported = useSyncExternalStore(
    subscribeVoices,
    () => hasVoiceFor(speechLang[locale]),
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

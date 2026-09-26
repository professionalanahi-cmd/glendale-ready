import type { Locale, LocalizedText } from '@/lib/types'
import en from './en'
import es from './es'
import hy from './hy'

/**
 * To add a language, create `<code>.ts` typed as `Dictionary`,
 * register it here, and add the code to `Locale` and SUPPORTED_LOCALES.
 */
export const dictionaries = { en, es, hy } as const

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  hy: 'Հայերեն',
}

/** BCP 47 tags for Intl date/number formatting. */
export const intlTag: Record<Locale, string> = { en: 'en-US', es: 'es-US', hy: 'hy-AM' }

type Vars = Record<string, string | number>

function lookup(dict: unknown, path: string): string | undefined {
  let node: unknown = dict
  for (const part of path.split('.')) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return typeof node === 'string' ? node : undefined
}

export function translate(locale: Locale, key: string, vars?: Vars): string {
  const raw = lookup(dictionaries[locale], key) ?? lookup(dictionaries.en, key) ?? key
  if (!vars) return raw
  return raw.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`))
}

export function pick(text: LocalizedText, locale: Locale): string {
  return text[locale] || text.en
}

export const speechLang: Record<Locale, string> = intlTag

import type { Metadata } from 'next'
import { SettingsScreen } from '@/components/settings/settings'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <SettingsScreen />
    </div>
  )
}

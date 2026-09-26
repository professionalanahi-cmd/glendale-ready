import type { Metadata } from 'next'
import { NearbyHelp } from '@/components/help/nearby-help'

export const metadata: Metadata = { title: 'Nearby Help' }

export default function HelpPage() {
  return <NearbyHelp />
}

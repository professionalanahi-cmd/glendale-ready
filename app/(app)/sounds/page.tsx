import type { Metadata } from 'next'
import { Sounds } from '@/components/sounds/sounds'

export const metadata: Metadata = { title: 'Emergency Sounds' }

export default function SoundsPage() {
  return <Sounds />
}

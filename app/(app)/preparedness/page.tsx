import type { Metadata } from 'next'
import { Preparedness } from '@/components/preparedness/preparedness'

export const metadata: Metadata = { title: 'My Preparedness' }

export default function PreparednessPage() {
  return <Preparedness />
}

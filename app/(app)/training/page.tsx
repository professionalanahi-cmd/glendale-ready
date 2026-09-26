import type { Metadata } from 'next'
import { Training } from '@/components/training/training'

export const metadata: Metadata = { title: 'Training & Events' }

export default function TrainingPage() {
  return <Training />
}

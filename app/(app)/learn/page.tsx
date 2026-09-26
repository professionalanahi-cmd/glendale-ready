import type { Metadata } from 'next'
import { Learn } from '@/components/learn/learn'

export const metadata: Metadata = { title: 'Learn' }

export default function LearnPage() {
  return <Learn />
}

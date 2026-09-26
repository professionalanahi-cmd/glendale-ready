import { notFound } from 'next/navigation'
import { HazardDetail } from '@/components/hazards/hazard-detail'
import type { HazardCategory } from '@/lib/types'

const CATEGORIES: HazardCategory[] = ['earthquake', 'wildfire', 'flood', 'dam-inundation', 'debris-flow']

export default async function HazardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!CATEGORIES.includes(id as HazardCategory)) notFound()
  return <HazardDetail category={id as HazardCategory} />
}

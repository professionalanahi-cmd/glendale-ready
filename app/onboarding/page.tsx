import type { Metadata } from 'next'
import { RequireAuth } from '@/components/app/require-auth'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

export const metadata: Metadata = { title: 'Your preparedness profile' }

export default function OnboardingPage() {
  return (
    <RequireAuth>
      <OnboardingWizard />
    </RequireAuth>
  )
}

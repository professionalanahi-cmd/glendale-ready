import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FullPageLoading } from '@/components/app/require-auth'
import { ProfileEditor } from '@/components/settings/profile-editor'

export const metadata: Metadata = { title: 'Profile & locations' }

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <Suspense fallback={<FullPageLoading />}>
        <ProfileEditor />
      </Suspense>
    </div>
  )
}

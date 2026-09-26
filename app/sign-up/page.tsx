import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'

export const metadata: Metadata = { title: 'Create account' }

export default function Page() {
  return <AuthShell variant="sign-up" />
}

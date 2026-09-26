import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'

export const metadata: Metadata = { title: 'Sign in' }

export default function Page() {
  return <AuthShell variant="sign-in" />
}

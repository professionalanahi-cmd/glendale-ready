import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'

export const metadata: Metadata = { title: 'Reset password' }

export default function Page() {
  return <AuthShell variant="forgot" />
}

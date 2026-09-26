import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Atkinson_Hyperlegible, Nunito } from 'next/font/google'
import { AuthProvider } from '@/components/providers/auth-provider'
import { PreferencesProvider } from '@/components/providers/preferences-provider'
import { preferencesBootScript } from '@/lib/display'
import './globals.css'

const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-atkinson',
})
const nunito = Nunito({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-nunito' })

export const metadata: Metadata = {
  title: {
    default: 'Glendale Ready — Preparedness for your household',
    template: '%s · Glendale Ready',
  },
  description:
    'Understand the hazards around your Glendale home, learn simple ways to prepare, and find nearby help. Clear, accessible, and in English and Spanish.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1d7564',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${atkinson.variable} ${nunito.variable} bg-background`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferencesBootScript }} />
      </head>
      <body className="antialiased">
        <PreferencesProvider>
          <AuthProvider>{children}</AuthProvider>
        </PreferencesProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600'] })
import { QueryProvider } from '@/lib/query-provider'

export const metadata: Metadata = {
  title: 'RemindWell - Stay Consistent with Your Goals',
  description: 'A beautiful reminder and habit tracking app to help you build better habits and stay consistent with your goals.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}><QueryProvider>{children}</QueryProvider></body>
    </html>
  )
}

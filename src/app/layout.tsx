import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ResponsiveContainer } from '@/components/ResponsiveContainer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LLM Conversation App',
  description: 'Interact with AI models seamlessly',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} dark:bg-gray-900 dark:text-gray-100 full-screen`}>
        <ResponsiveContainer>
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          {children}
        </ResponsiveContainer>
      </body>
    </html>
  )
}

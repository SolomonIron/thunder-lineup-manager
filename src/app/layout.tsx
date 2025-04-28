// src/app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'Thunder Lineup Manager',
  description: 'Baseball lineup management for Ohio Thunder',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-thunder-background min-h-screen`}>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
// src/app/layout.tsx
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { DatabaseProvider } from '@/context/DatabaseContext'

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
      <body className={`${inter.variable} font-sans bg-gray-50 min-h-screen`}>
        <DatabaseProvider>
          <div className="flex">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen pl-20 md:pl-64">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
                <Breadcrumbs />
                {children}
              </main>
            </div>
          </div>
        </DatabaseProvider>
      </body>
    </html>
  )
}
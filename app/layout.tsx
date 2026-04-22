import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Using Inter as a standard sans-serif font
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kill Larry Management',
  description: 'Based in NYC',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} bg-black text-white h-full m-0`}>
        {children}
      </body>
    </html>
  )
}


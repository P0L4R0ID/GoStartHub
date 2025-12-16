import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Go Start Hub - Platform for Young Innovators',
  description: 'A platform for young innovators and students to showcase prototypes and connect with mentors and funding opportunities in Malaysia',
  icons: {
    icon: '/images/gostarthublogo.png',
    apple: '/images/gostarthublogo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Navbar />
        <PageBackground>
          <main>{children}</main>
        </PageBackground>
        <Footer />
      </body>
    </html>
  )
}


import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth-context'
import NavBar from '@/components/nav-bar'
import Sidebar from '@/components/sidebar'
import MobileNav from '@/components/mobile-nav'
import ParticleBackground from '@/components/particle-background'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'LearnLedger - Credential Management Platform',
  description: 'Modern platform for learning achievements and credential management',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} antialiased overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ParticleBackground />
            <NavBar />
            <Sidebar />
            <main className="pt-16 pb-20 md:ml-[260px] md:pb-8 transition-all duration-300">
              {children}
            </main>
            <MobileNav />
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

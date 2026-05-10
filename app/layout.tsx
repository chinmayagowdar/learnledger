import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'
import NavBar from '@/components/nav-bar'
import Sidebar from '@/components/sidebar'
import MobileNav from '@/components/mobile-nav'
import ParticleBackground from '@/components/particle-background'

const _inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'LearnLedger - Credential Management Platform',
  description: 'Modern platform for learning achievements and credential management with glassmorphism design',
  generator: 'v0.app',
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
      <body className="font-sans antialiased overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ParticleBackground />
            <NavBar />
            <Sidebar />
            <main className="pt-16 pb-20 md:ml-[260px] md:pb-8 transition-all duration-300">
              {children}
            </main>
            <MobileNav />
            <Toaster position="top-right" richColors />
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { PwaRegister } from '@/components/PwaRegister'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Training Log',
  description: 'Registro de entrenamiento adaptativo — uso personal.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Training Log',
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  other: {
    // Next's appleWebApp.capable only emits the newer unprefixed
    // "mobile-web-app-capable" meta tag; iOS Safari (including versions
    // still in real use) needs the apple-prefixed one to render standalone
    // when added to the home screen, so it's set explicitly here too.
    'apple-mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#f5f5f7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  )
}

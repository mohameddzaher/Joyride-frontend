import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { ConditionalLayout } from '@/components/layout';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Joyride - Therapeutic & Developmental Toys',
    template: '%s | Joyride',
  },
  description:
    'Discover therapeutic and developmental toys at Joyride. Shop sensory toys, motor skills kits, speech tools, and cognitive development games for children ages 3+.',
  keywords: [
    'therapeutic toys',
    'developmental toys',
    'sensory toys',
    'motor skills',
    'speech therapy toys',
    'autism support toys',
    'Montessori',
    'child development',
    'Saudi Arabia',
  ],
  authors: [{ name: 'Joyride' }],
  creator: 'Joyride',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://joyride.com',
    siteName: 'Joyride',
    title: 'Joyride - Therapeutic & Developmental Toys',
    description:
      'Discover therapeutic and developmental toys at Joyride. Shop sensory toys, motor skills kits, speech tools, and cognitive development games for children ages 3+.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Joyride - Therapeutic & Developmental Toys',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Joyride - Therapeutic & Developmental Toys',
    description:
      'Discover therapeutic and developmental toys at Joyride. Shop sensory toys, motor skills kits, speech tools, and cognitive development games for children ages 3+.',
    images: ['/og-image.jpg'],
    creator: '@joyride',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-beige-50 font-sans antialiased">
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}

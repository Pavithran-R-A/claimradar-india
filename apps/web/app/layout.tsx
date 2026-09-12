import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Newsreader } from 'next/font/google';
import { brandConfig } from '@claimradar/config';
import './globals.css';

export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: brandConfig.siteName,
    template: `%s | ${brandConfig.siteName}`,
  },
  description: brandConfig.description,
  applicationName: brandConfig.siteName,
  metadataBase: new URL(brandConfig.url),
  manifest: '/manifest.webmanifest',
  themeColor: '#0D2148',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-light">
      <body className={`${geistSans.variable} ${newsreader.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

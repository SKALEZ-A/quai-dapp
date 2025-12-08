import type { ReactNode } from "react";
import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: "Synq - Social Dapp on Quai",
  description: "Synq is a unified Web3 platform for social interaction, identity (QNS), and cross-chain transfers on the Quai Network.",
  keywords: ['Synq', 'Quai', 'QNS', 'Web3', 'Social Dapp', 'cross-chain', 'bridge', 'decentralized'],
  authors: [{ name: 'Synq', url: 'https://synqdapp.com' }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Synq - Social Dapp on Quai',
    description:
      'Synq is a unified Web3 platform for social interaction, identity (QNS), and cross-chain transfers on the Quai Network.',
    url: 'https://synqdapp.com',
    siteName: 'Synq',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'Synq' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synq - Social Dapp on Quai',
    description:
      'Unified Web3 platform for social interaction, identity (QNS) and cross-chain transfers on Quai Network.',
    images: ['/opengraph-image.png'],
    creator: '@synq_web3',
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
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 

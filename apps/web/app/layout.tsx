import type { ReactNode } from "react";
import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: "Synq - Social Dapp on Quai",
  description: "Social Dapp + QNS + Bridge on Quai",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
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

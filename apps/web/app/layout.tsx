import type { ReactNode } from "react";
import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: "Quai Superapp",
  description: "Social + QNS + Bridge on Quai"
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

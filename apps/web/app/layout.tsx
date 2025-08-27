import type { ReactNode } from "react";

export const metadata = { title: "Quai Superapp", description: "Social + QNS + Bridge on Quai" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

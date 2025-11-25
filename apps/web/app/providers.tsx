"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/config';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

// Dynamically import WagmiProvider to avoid SSR issues
const DynamicWagmiProvider = dynamic(
  () => Promise.resolve(WagmiProvider),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
          <img src="/assets/logo.png" alt="Synq Logo" className="h-6 md:h-8" />
          <p className="text-white text-3xl fw-extrabold mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <DynamicWagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </DynamicWagmiProvider>
  );
}

import React from 'react';
import Sidebar from '@/components/Sidebar';
import QnsHeader from '@/components/QnsHeader';

export default function QNSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 pt-0 lg:pt-8">
          {children}
      </main>
    </div>
  );
}

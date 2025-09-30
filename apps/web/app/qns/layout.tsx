import React from 'react';
import Sidebar from '@/components/Sidebar';
import QnsHeader from '@/components/QnsHeader';

export default function QNSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[280px_1fr] h-screen bg-background">
      <Sidebar />
      <main className="overflow-y-auto">
        <QnsHeader />
        <div className="max-w-5xl mx-auto px-6">
          {children}
        </div>
      </main>
    </div>
  );
}

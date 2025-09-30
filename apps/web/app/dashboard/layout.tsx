import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[280px_1fr] h-screen bg-background">
      <Sidebar />
      <main className="overflow-y-auto p-10">
        {children}
      </main>
    </div>
  );
}

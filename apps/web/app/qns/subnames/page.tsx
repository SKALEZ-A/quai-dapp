"use client";

import React from 'react';

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function QnsSubnamesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4">
        <button className="flex items-center gap-2 px-4 py-2 border border-border bg-surface rounded-lg">Creation Date <ChevronDownIcon /></button>
        <div className="flex items-center gap-3 bg-surface border border-border rounded-lg px-4 py-2 flex-grow max-w-md">
          <SearchIcon className="text-text-secondary" />
          <input type="text" placeholder="Search" className="bg-transparent border-none outline-none w-full text-white" />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-16 text-center text-text-secondary">
        No subname have been added
      </div>
    </div>
  );
}

"use client";

import React from 'react';

const MoreIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="5" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="19" cy="12" r="1.5" fill="currentColor"/>
  </svg>
);

export default function QnsOwnershipPage() {
  return (
    <div className="max-w-4xl">
      {/* Roles card */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-space-grotesk">Roles</h2>
          <span className="bg-[#1a5e42] text-[#1AB675] px-3 py-1 rounded-full text-sm font-medium">2 addresses</span>
        </div>
        <div className="flex flex-col gap-4">
          {/* Role item */}
          <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
            <div className="flex items-center gap-3 flex-grow">
              <div className="w-8 h-8 rounded-full bg-text-secondary" />
              <span>0xb5B...Fb489</span>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-md text-sm bg-surface border border-border text-primary border-primary">Owner</span>
            </div>
            <button className="text-text-secondary" title="More"><MoreIcon /></button>
          </div>

          <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
            <div className="flex items-center gap-3 flex-grow">
              <div className="w-8 h-8 rounded-full bg-text-secondary" />
              <span>0xb5B...Fb489</span>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-md text-sm bg-surface border border-border">Manager</span>
              <span className="px-3 py-1 rounded-md text-sm bg-surface border border-border">Eth Records</span>
            </div>
            <button className="text-text-secondary" title="More"><MoreIcon /></button>
          </div>
        </div>
      </div>

      {/* Dates card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-surface border border-border rounded-xl p-6 mb-8">
        <div>
          <span className="block text-text-secondary mb-2">Names expires</span>
          <p className="font-mono font-medium">Feb 1, 2033 &nbsp; 03:22:39</p>
        </div>
        <div>
          <span className="block text-text-secondary mb-2">Grace period ends</span>
          <p className="font-mono font-medium">May 2, 2033 &nbsp; 03:22:39</p>
        </div>
        <div>
          <span className="block text-text-secondary mb-2">Registered</span>
          <p className="font-mono font-medium">Feb 1, 2033 &nbsp; 03:22:39</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button className="px-4 py-3 rounded-lg bg-primary text-white">Set Reminder</button>
        <button className="px-4 py-3 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors">Extend</button>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';

const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function QnsRecordsPage() {
  const [activeTab, setActiveTab] = useState<'text'|'address'>('address');

  const addressRecords = [
    { key: 'Eth', value: '0x6154DCeEadd948111678616deD394A544E3ABe4' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Tabs + Content */}
      <div className="bg-surface border border-border rounded-xl">
        <div className="flex border-b border-border">
          <button
            className={`px-6 py-4 text-base font-medium ${activeTab==='text' ? 'text-text-primary border-b-2 border-secondary' : 'text-text-secondary'}`}
            onClick={() => setActiveTab('text')}
          >
            Text <span className="ml-2 bg-background px-2 py-0.5 rounded text-sm">0 Records</span>
          </button>
          <button
            className={`px-6 py-4 text-base font-medium ${activeTab==='address' ? 'text-text-primary border-b-2 border-secondary' : 'text-text-secondary'}`}
            onClick={() => setActiveTab('address')}
          >
            Address <span className="ml-2 bg-background px-2 py-0.5 rounded text-sm">{addressRecords.length} Records</span>
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'address' && (
            <div className="flex flex-col gap-4">
              {addressRecords.map((record) => (
                <div key={record.key} className="flex items-center justify-between border border-border rounded-lg p-4">
                  <span className="text-text-secondary font-medium">{record.key}</span>
                  <div className="flex items-center gap-4 font-mono">
                    <span>{record.value}</span>
                    <button className="text-text-secondary hover:text-text-primary" title="Copy">
                      <CopyIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'text' && (
            <div className="text-center p-10 text-text-secondary">No text records have been added.</div>
          )}
        </div>
      </div>

      {/* Other records */}
      <div className="flex flex-col gap-8">
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-2">No Content Hash</h3>
          <p className="text-text-secondary">No IPFS or decentralized content hash has been set for this name.</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-2">No ABI</h3>
          <p className="text-text-secondary">No contract ABI has been set for this name.</p>
        </div>
      </div>
    </div>
  );
}

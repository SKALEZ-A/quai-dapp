"use client";

import React, { useState } from 'react';

// Minimal inline icons
const ScoreIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const TransactionsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M21 12V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="m16 19 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ConnectionsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const EarningsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const BridgeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M16 17l5-5-5-5M4 12h17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 7l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ActivityIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function DashboardAnalyticsPage() {
  const [activeFilter, setActiveFilter] = useState<'All'|'Social'|'QNS'|'Bridge'>('All');
  const [activeDateRange, setActiveDateRange] = useState<'7D'|'30D'|'90D'>('30D');

  return (
    <div className="flex flex-col gap-6 text-white">
      {/* Header */}
      <div className="bg-black p-6 rounded-lg">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <h1 className="text-4xl font-space-grotesk font-bold">Analytics & Metrics</h1>
          <div className="flex bg-zinc-800 border border-zinc-700 rounded-lg p-1">
            {(['7D','30D','90D'] as const).map(range => (
              <span key={range} className={`px-4 py-2 rounded-md font-medium cursor-pointer ${activeDateRange===range?'bg-zinc-900 text-white':'text-zinc-400 hover:text-white'}`} onClick={() => setActiveDateRange(range)}>{range}</span>
            ))}
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-[#00C8531A] border border-[#00C8531A]">
            <ScoreIcon className="w-8 h-8 mb-3 opacity-80" />
            <span className="block text-base opacity-80">Social Score</span>
            <p className="text-4xl font-bold font-space-grotesk">8,394</p>
            <small className="text-sm opacity-70">Based on engagement & interactions</small>
          </div>
          <div className="p-6 rounded-xl bg-[#2962FF1A] border border-[#2962FF1A]">
            <TransactionsIcon className="w-8 h-8 mb-3 opacity-80" />
            <span className="block text-base opacity-80">Transactions</span>
            <p className="text-4xl font-bold font-space-grotesk">147</p>
            <small className="text-sm opacity-70">Successful transactions this month</small>
          </div>
          <div className="p-6 rounded-xl bg-[#7C4DFF1A] border border-[#7C4DFF1A]">
            <ConnectionsIcon className="w-8 h-8 mb-3 opacity-80" />
            <span className="block text-base opacity-80">Connections</span>
            <p className="text-4xl font-bold font-space-grotesk">42</p>
            <small className="text-sm opacity-70">New connections this week</small>
          </div>
          <div className="p-6 rounded-xl bg-[#EF44441A] border border-[#EF44441A]">
            <EarningsIcon className="w-8 h-8 mb-3 opacity-80" />
            <span className="block text-base opacity-80">Earnings</span>
            <p className="text-4xl font-bold font-space-grotesk">42</p>
            <small className="text-sm opacity-70">Tips & rewards earned</small>
          </div>
        </div>

        {/* Streak + Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-black rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <h3 className="text-xl font-space-grotesk font-bold">Daily Activity Streak</h3>
            </div>
            <div className="mb-6 flex">
              <div className="w-12 h-12 mr-4 flex items-center justify-center rounded-full bg-purple-600">
                <p className="text-xl font-bold text-white">15</p>
              </div>
              <div className="flex-grow mt-4">
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-[#8b1e3f] rounded-full" style={{ width: '75%' }} />
                </div>
                <span className="text-sm text-zinc-400 block">75% to next milestone</span>
              </div>
            </div>
            <div>
              <p className="text-sm mb-1 text-white ml-1">Days</p>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-6 bg-purple-600 rounded-md"/>))}
                {Array.from({ length: 2 }).map((_, i) => (<div key={i} className="h-6 bg-zinc-800 rounded-md"/>))}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <h3 className="text-xl font-space-grotesk font-bold">Engagement Overview</h3>
            </div>
            <div className="mb-6">
              <div className="flex justify-between mb-2 text-sm"><span>Messages Sent</span><span>127</span></div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full" style={{ width: '80%' }} /></div>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm"><span>Tips Received</span><span>8.9 QI</span></div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-green-500 to-green-700 rounded-full" style={{ width: '60%' }} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bridge & Activity */}
      <div className="grid grid-cols-1 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <BridgeIcon className="w-6 h-6 text-zinc-400" />
            <h3 className="text-xl font-space-grotesk font-bold">Bridge & Asset</h3>
            <button className="ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium">Bridge Now</button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-green-500">
              <ScoreIcon className="w-6 h-6 mb-2 text-green-400" />
              <span className="block text-xl font-bold">$12,392</span>
              <small className="text-zinc-400">Volume this month</small>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-blue-500">
              <ConnectionsIcon className="w-6 h-6 mb-2 text-blue-400" />
              <span className="block text-xl font-bold">7</span>
              <small className="text-zinc-400">Chains Connected</small>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-purple-500">
              <TransactionsIcon className="w-6 h-6 mb-2 text-purple-400" />
              <span className="block text-xl font-bold">98%</span>
              <small className="text-zinc-400">Success Rate</small>
            </div>
          </div>
          <h4 className="font-semibold mb-4">Recent Transactions</h4>
          <div className="text-sm">
            <div className="grid grid-cols-[2fr_1.5fr_1fr] items-center py-2"><span>quantum.qns → Quai</span><span>1.5ETH - 10m ago</span><span className="font-medium text-right text-green-500">Completed</span></div>
            <div className="grid grid-cols-[2fr_1.5fr_1fr] items-center py-2"><span>Quai → Polygon</span><span>500QUAI - 10m ago</span><span className="font-medium text-right text-yellow-500">Pending</span></div>
            <div className="grid grid-cols-[2fr_1.5fr_1fr] items-center py-2"><span>BSC → Quai</span><span>1.5ETH - 10m ago</span><span className="font-medium text-right text-red-500">Failed</span></div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <ActivityIcon className="w-6 h-6 text-zinc-400" />
            <h3 className="text-xl font-space-grotesk font-bold">Activity Feed</h3>
          </div>
          <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-4">
            {(['All','Social','QNS','Bridge'] as const).map(filter => (
              <button key={filter} className={`px-3 py-2 border-b-2 ${activeFilter===filter?'border-purple-600 text-white':'border-transparent text-zinc-400 hover:text-white'}`} onClick={() => setActiveFilter(filter)}>
                {filter} <sup>{filter==='All'?5:2}</sup>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-900/30 text-purple-400"><span>Q</span></div>
              <div className="flex-grow"><p className="text-sm">Renewed domain <strong>quantum.qns</strong> for 1 year</p><span className="text-xs text-zinc-400 font-mono">0x123...abc</span></div>
              <div className="flex flex-col items-end text-xs text-zinc-400"><span className="px-2 py-1 bg-purple-600 rounded-md text-white mb-1">Qns</span><span>5m ago</span></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-900/30 text-red-400">$</div>
              <div className="flex-grow"><p className="text-sm">Received tip <strong>0.5 QI from alice.qns</strong></p><span className="text-xs text-zinc-400 font-mono">0x456...def</span></div>
              <div className="flex flex-col items-end text-xs text-zinc-400"><span className="px-2 py-1 bg-red-600 rounded-md text-white mb-1">Social</span><span>5m ago</span></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-900/30 text-blue-400">⇄</div>
              <div className="flex-grow"><p className="text-sm">Cross-chain transfer <strong>1.2ETH - Quai Network</strong></p><span className="text-xs text-zinc-400 font-mono">0x123...abc</span></div>
              <div className="flex flex-col items-end text-xs text-zinc-400"><span className="px-2 py-1 bg-blue-600 rounded-md text-white mb-1">Bridge</span><span>5m ago</span></div>
            </div>
            <button className="text-purple-400 hover:text-purple-300 text-sm mt-2 self-start">See more</button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';

const ProfileIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const OtherIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function DashboardSettingsPage() {
  const { address } = useAccount();

  return (
    <div className="min-h-screen text-gray-200">
      <h1 className="text-4xl font-extrabold font-space-grotesk mb-8 text-white">Settings</h1>

      <div className="flex flex-col gap-8">
        {/* Profile and Identity */}
        <div className="border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6 text-white">
            <ProfileIcon className="w-7 h-7" />
            <h2 className="text-xl font-space-grotesk font-bold">Profile and Identity</h2>
          </div>
          <div className="flex flex-col gap-6">
            <div className="pb-6 border-b border-gray-700">
              <Link href="/dashboard/profile" className="block">
                <p className="text-gray-400 py-2 hover:text-white transition-colors text-sm">Edit Profile</p>
                <p className="text-gray-400 py-2 hover:text-white transition-colors text-sm">Change profile photo</p>
                <p className="text-gray-400 py-2 hover:text-white transition-colors text-sm">Change cover photo</p>
                <p className="text-gray-400 py-2 hover:text-white transition-colors text-sm">Edit Bio</p>
              </Link>
            </div>
            <div className="pb-6 border-b border-gray-700">
              <h3 className="font-medium text-white font-manrope mb-2">Linked Wallet</h3>
              <p className="text-gray-400 text-sm font-mono">{address ?? 'Not connected'}</p>
            </div>
            <div>
              <h3 className="font-medium text-white font-manrope mb-2">Username/Domain Management</h3>
              <p className="text-gray-400 text-sm">alice.qns</p>
            </div>
          </div>
        </div>

        {/* Other */}
        <div className="border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6 text-white">
            <OtherIcon className="w-7 h-7" />
            <h2 className="text-xl font-space-grotesk font-bold">Other</h2>
          </div>
          <div className="flex flex-col gap-6">
            <div className="pb-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="font-medium text-white font-manrope">Default Network</h3>
              <div className="relative inline-block w-72">
                <select className="w-full appearance-none px-4 py-3 bg-black rounded-lg text-white text-sm cursor-pointer" defaultValue="quai">
                  <option value="quai" className="bg-transparent">Quai</option>
                  <option value="ethereum" className="bg-transparent">Ethereum</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-white font-manrope">Help and Support</h3>
              <p className="text-gray-400 py-2 hover:text-white transition-colors text-sm">Report a Bug</p>
              <p className="text-gray-400 py-2 hover:text-white transition-colors text-sm">Contact Support</p>
              <p className="text-gray-400 py-2 hover:text-white transition-colors text-sm">Terms of Service/Privacy Policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const QnsHeader = () => {
  const { isConnected } = useAccount();
  const currentUser = useCurrentUser();
  const router = useRouter();
  
  return (
    <header className="py-6 mb-10">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-3 border border-border rounded-lg py-2.5 px-4 w-75 max-w-md cursor-pointer" onClick={() => router.push('/qns/namesearch')}>
                <SearchIcon className="text-sm" /> <span className=" text-sm text-gray-400">Search for a name</span>
            </div>
            <div className="flex items-center gap-6">
                <Link href="/qns/profile" className="text-text-secondary font-medium hover:text-text-primary">My Names</Link>
                <button className="py-2.5 px-5 rounded-md font-medium bg-primary text-white text-sm">
                    {isConnected && currentUser.address ? (
                        currentUser.short_address
                    ) : (
                        <></>
                    )}
                </button>
            </div>
        </div>
    </header>
  );
};
export default QnsHeader;

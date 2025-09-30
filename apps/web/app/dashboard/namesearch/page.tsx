"use client";

import React from 'react';

export default function DashboardNameSearchPage() {
  return (
    <div className="mt-10">
      <div className="text-center">
        <p className="font-space-grotesk font-extrabold text-6xl py-7">Your web3 username</p>
        <p className="font-manrope text-md text-gray-400">Your identity across web3, one name for all your crypto addresses, and your decentralised website.</p>
      </div>
      <div className="flex justify-center mt-6">
        <input placeholder="Search for a name" className="w-3/4 text-center bg-transparent rounded-md border border-gray-500 py-2 text-sm outline-none" />
      </div>
    </div>
  );
}

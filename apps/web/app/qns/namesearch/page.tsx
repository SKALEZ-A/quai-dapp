"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QnsNameSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to profile page with search query
      router.push(`/qns/profile?search=${encodeURIComponent(searchQuery.trim().toLowerCase())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="mt-6">
      <div className="text-center">
        <p className="font-space-grotesk font-extrabold text-6xl py-7 text-text-primary">Your web3 username</p>
        <p className="font-manrope text-md text-gray-400">Your identity across web3, one name for all your crypto addresses, and your decentralised website.</p>
      </div>
      <div className="flex justify-center mt-8 gap-4">
        <input 
          placeholder="hello" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-2/3 text-center bg-surface rounded-lg border border-border py-3 px-4 text-base outline-none focus:border-primary transition-colors text-text-primary placeholder:text-gray-500" 
        />
        <button
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
          className="px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-space-grotesk font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Search
        </button>
      </div>
    </div>
  );
}

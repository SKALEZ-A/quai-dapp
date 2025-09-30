"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';

// SVG Icon Components
const CopyIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const PostIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const BridgeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 17H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.5 7H20a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const BuyIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;


const recentPosts = [
    { id: 1, name: 'alice.qns', time: '3m ago', content: 'just minted a new custom domain.... cant wait to unveil' },
    { id: 2, name: 'alex.qns', time: '4h ago', content: 'Narrative & Popularity = Gold. Community size doesn\'t matter, the uniqueness of the play matters. Volume is also an important tool as it keeps track of how much goes in and out of the token.' },
    { id: 3, name: 'david.qns', time: '1d ago', content: 'added 4 photos' },
];

const UserOverview = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();

  const copyItem = async (item: string) => {
    try {
      await navigator.clipboard.writeText(item);
      console.log("Copied to clipboard:", item);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-screen text-gray-100 font-sans">
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        

        {/* Overview Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overview Header */}
          <div className="">
            <div className="">
              {/* Profile Card */}
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                  <img src={currentUser.profileImg} className="w-auto h-full" alt={currentUser.name} />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-2xl font-space-grotesk font-bold text-gray-50 mb-1">{currentUser.name}</h2>
                  <span className="text-base text-gray-400 text-sm">@{currentUser.username}</span>
                </div>
              </div>

              {/* Wallet Address Card */}
              <div className=" py-6 md:py-8">
                  {/* <h3 className="text-lg font-semibold mb-4 hidden">Wallet Address</h3>  Hidden as per design */}
                  <div className="flex justify-between items-center text-sm mb-4">
                      <span className="text-gray-400">Wallet Address</span>
                      <div className="flex items-center gap-2 bg-gray-800 px-2 py-1 rounded-md font-mono text-xs">
                          {currentUser.short_address}
                          <button className="text-gray-400 hover:text-gray-100 transition-colors" onClick={() => copyItem(currentUser.address ?? "")}><CopyIcon /></button>
                      </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Synq Payment Code</span>
                      <div className="flex items-center gap-2 bg-gray-800 px-2 py-1 rounded-md font-mono text-xs">
                          {currentUser.username}
                          <button className="text-gray-400 hover:text-gray-100 transition-colors" onClick={() => copyItem(currentUser.username)}><CopyIcon /></button>
                      </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Wallet Balance Card */}
          <div className="">
            <h2 className="font-space-grotesk font-bold text-xl mb-4">Wallet Address</h2>
              <div className="bg-black border border-gray-700 rounded-xl py-8 p-6 flex flex-col md:flex-row justify-between items-start pb-8 mb-6 border-b border-gray-700">
                  <div className="flex flex-col mb-4 md:mb-0">
                      <span className="text-gray-400 text-base mb-2 text-sm">Quai (Qi)</span>
                      <span className="text-2xl font-space-grotesk font-bold leading-tight flex items-baseline mt-6">1,234.56<small className="text-md text-gray-400 ml-1">QI</small></span>
                      <span className="text-sm text-gray-400 mt-2">≈ $8,542.12 USD</span>
                  </div>
                  <div className="px-3 py-1 rounded-md text-xs font-medium bg-green-900 bg-opacity-30 text-green-400">
                      +2.5%
                  </div>
              </div>
          </div>

          {/* Quick Actions Card */}
          <div className="">
              <h3 className="text-xl font-semibold mb-4">Quick Action</h3>
              <div className="">
                <div className="mb-4">
                  <button onClick={() => router.push('/dashboard/social')} className="h-[80px] w-full flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-[#b12c5b] text-gray-50 font-medium hover:opacity-90 transition-opacity text-sm">
                    <PostIcon />
                    Post
                  </button>
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => router.push('/dashboard/bridge')} className="w-1/2 h-[80px] flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-[#000000] text-gray-50 font-medium hover:opacity-90 transition-opacity text-sm">
                    <BridgeIcon />
                    Bridge
                  </button>
                  <button onClick={() => router.push('/qns/profile')} className="w-1/2 h-[80px] flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-[#3366ff] text-gray-50 font-medium hover:opacity-90 transition-opacity text-sm">
                    <BuyIcon />
                    Buy QNS
                  </button>
                </div>
              </div>
          </div>
        </div>

        {/* Social Activity Card */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Social Activity</h3>
            <button onClick={() => router.push('/dashboard/social')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-700 text-gray-50 font-medium">
                <PostIcon /> Post
            </button>
          </div>
          <div className="bg-black border border-gray-700 rounded-xl p-6 md:p-8 recent-posts-feed">
            <h4 className="text-base text-gray-100 font-medium mb-10">Recent Posts</h4>
            {recentPosts.map(post => (
              <div className="flex gap-4 items-start pb-6 mb-6 last:mb-0 last:pb-0 last:border-b-0 border-b border-gray-700" key={post.id}>
                <div className="w-10 h-10 rounded-full bg-gray-500 flex-shrink-0"></div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-0">
                    <span className="font-bold text-gray-50">{post.name}</span>
                    <span className="text-sm text-gray-400">{post.time}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-sm">{post.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOverview;

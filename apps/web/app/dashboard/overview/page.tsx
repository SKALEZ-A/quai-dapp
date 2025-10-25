"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getUserDomains } from '@/lib/qns';
import { useSocial } from '@/hooks/useSocial';
import { useBalance } from 'wagmi';
import { formatEther } from 'viem';
import FollowButton from '@/components/FollowButton';

// SVG Icon Components
const CopyIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const PostIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const BridgeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 17H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.5 7H20a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const BuyIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const DomainIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2"/></svg>;
const SendIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const SettingsIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;


const UserOverview = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const [myDomains, setMyDomains] = useState<string[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [domainsLoaded, setDomainsLoaded] = useState(false);
  const { posts: recentPosts, isLoading: postsLoading } = useSocial();
  
  // Fetch wallet balance
  const { data: balance, isLoading: balanceLoading, error: balanceError } = useBalance({
    address: currentUser.address as `0x${string}` | undefined,
  });

  useEffect(() => {
    if (currentUser.address && !domainsLoaded) {
      loadDomains();
    }
  }, [currentUser.address, domainsLoaded]);

  const loadDomains = async () => {
    if (!currentUser.address) {
      console.log("No user address available for loading domains");
      return;
    }
    
    // Avoid duplicate loading
    if (loadingDomains) return;
    
    console.log("Loading domains for address:", currentUser.address);
    setLoadingDomains(true);
    try {
      const domains = await getUserDomains(currentUser.address);
      console.log("Loaded domains:", domains);
      setMyDomains(domains);
      setDomainsLoaded(true);
    } catch (error) {
      console.error("Error loading domains:", error);
    } finally {
      setLoadingDomains(false);
    }
  };

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
      <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 lg:px-0">
        

        {/* Overview Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overview Header */}
          <div className="">
            <div className="">
              {/* Profile Card */}
              <div className="flex items-center gap-3 lg:gap-5">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                  <img src={currentUser.profileImg} className="w-auto h-full" alt={currentUser.name} />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl lg:text-2xl font-space-grotesk font-bold text-gray-50 mb-1">{currentUser.name}</h2>
                  <span className="text-sm lg:text-base text-gray-400">@{currentUser.username}</span>
                  {currentUser.address && (
                    <span className="text-xs text-gray-500 mt-1">Address: {currentUser.short_address}</span>
                  )}
                </div>
              </div>

              {/* Wallet Address Card */}
              <div className=" py-6 md:py-8">
                  {/* <h3 className="text-lg font-semibold mb-4 hidden">Wallet Address</h3>  Hidden as per design */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm mb-4 gap-2">
                      <span className="text-gray-400">Wallet Address</span>
                      <div className="flex items-center gap-2 bg-gray-800 px-2 py-1 rounded-md font-mono text-xs">
                          <span className="truncate">{currentUser.short_address}</span>
                          <button className="text-gray-400 hover:text-gray-100 transition-colors flex-shrink-0" onClick={() => copyItem(currentUser.address ?? "")}><CopyIcon /></button>
                      </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-2">
                      <span className="text-gray-400">Synq Payment Code</span>
                      <div className="flex items-center gap-2 bg-gray-800 px-2 py-1 rounded-md font-mono text-xs">
                          <span className="truncate">{currentUser.username}</span>
                          <button className="text-gray-400 hover:text-gray-100 transition-colors flex-shrink-0" onClick={() => copyItem(currentUser.username)}><CopyIcon /></button>
                      </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Wallet Balance Card */}
          <div className="">
            <h2 className="font-space-grotesk font-bold text-xl mb-4">Wallet Balance</h2>
              <div className="bg-black border border-gray-700 rounded-xl py-8 p-6 flex flex-col md:flex-row justify-between items-start pb-8 mb-6">
                  <div className="flex flex-col mb-4 md:mb-0">
                      <span className="text-gray-400 text-sm mb-2">Quai (Qi)</span>
                      {balanceLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-600 border-t-primary rounded-full"></div>
                          <span className="text-gray-400">Loading balance...</span>
                        </div>
                      ) : balanceError ? (
                        <span className="text-red-400 text-sm">Error loading balance</span>
                      ) : balance ? (
                        <>
                          <span className="text-2xl font-space-grotesk font-bold leading-tight flex items-baseline mt-6">
                            {parseFloat(formatEther(balance.value)).toFixed(4)}
                            <small className="text-md text-gray-400 ml-1">QI</small>
                          </span>
                          <span className="text-sm text-gray-400 mt-2">
                            {balance.formatted} {balance.symbol}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">No wallet connected</span>
                      )}
                  </div>
                  {balance && (
                    <div className="px-3 py-1 rounded-md text-xs font-medium bg-green-900 bg-opacity-30 text-green-400">
                        Live
                    </div>
                  )}
              </div>
          </div>

          {/* Quick Actions Card */}
          <div className="">
              <h3 className="text-xl font-semibold mb-4">Quick Action</h3>
              <div className="">
                <div className="mb-4">
                  <button onClick={() => router.push('/dashboard/social')} className="h-[70px] lg:h-[80px] w-full flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-[#b12c5b] text-gray-50 font-medium hover:opacity-90 transition-opacity text-sm">
                    <PostIcon />
                    Post
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <button onClick={() => router.push('/dashboard/bridge')} className="w-full sm:w-1/2 h-[70px] lg:h-[80px] flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-[#000000] text-gray-50 font-medium hover:opacity-90 transition-opacity text-sm">
                    <BridgeIcon />
                    Bridge
                  </button>
                  <button onClick={() => router.push('/qns/profile')} className="w-full sm:w-1/2 h-[70px] lg:h-[80px] flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-[#3366ff] text-gray-50 font-medium hover:opacity-90 transition-opacity text-sm">
                    <BuyIcon />
                    Buy QNS
                  </button>
                </div>
              </div>
          </div>
        </div>

        {/* My QNS Domains Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-space-grotesk font-semibold flex items-center gap-2">
              <DomainIcon /> My QNS Domains
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={() => {
                  setDomainsLoaded(false);
                  loadDomains();
                }} 
                disabled={loadingDomains}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-700 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loadingDomains ? "Loading..." : "Refresh"}
              </button>
              <button onClick={() => router.push('/qns/namesearch')} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90 transition-opacity">
                <BuyIcon /> Buy Domain
              </button>
            </div>
          </div>
          
          <div className="bg-black border border-gray-700 rounded-xl p-6">
            {loadingDomains ? (
              <div className="text-center py-8 text-gray-400">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-600 border-t-primary rounded-full mb-2"></div>
                <p>Loading your domains...</p>
              </div>
            ) : myDomains.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌐</div>
                <p className="text-gray-400 mb-4">You don't own any QNS domains yet</p>
                <button onClick={() => router.push('/qns/namesearch')} className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Get Your First Domain
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myDomains.map((domain, index) => (
                  <div key={index} className="border border-gray-700 rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <DomainIcon />
                        <span className="font-space-grotesk font-bold text-text-primary">{domain}<span className="text-primary">.qns</span></span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded">Active</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <button 
                        onClick={() => copyItem(domain + '.qns')}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-gray-800 hover:bg-gray-700 rounded transition-colors text-gray-300"
                      >
                        <CopyIcon /> Copy
                      </button>
                      <button 
                        onClick={() => alert('Transfer feature coming soon!')}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-gray-800 hover:bg-gray-700 rounded transition-colors text-gray-300"
                      >
                        <SendIcon /> Send
                      </button>
                      <button 
                        onClick={() => alert('Domain settings coming soon!')}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-gray-800 hover:bg-primary/20 rounded transition-colors text-gray-300"
                      >
                        <SettingsIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Social Activity Card */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h3 className="text-xl font-semibold">Social Activity</h3>
            <button onClick={() => router.push('/dashboard/social')} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-pink-700 text-gray-50 font-medium">
                <PostIcon /> Post
            </button>
          </div>
          <div className="bg-black border border-gray-700 rounded-xl p-6 md:p-8 recent-posts-feed">
            <h4 className="text-base text-gray-100 font-medium mb-10">Recent Posts</h4>
            {postsLoading ? (
              <div className="text-center py-8 text-gray-400">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-600 border-t-primary rounded-full mb-2"></div>
                <p>Loading recent posts...</p>
              </div>
            ) : recentPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No recent posts yet. Start sharing your thoughts!</p>
              </div>
            ) : (
              recentPosts.slice(0, 3).map(post => {
                const timeAgo = new Date(post.createdAt).toLocaleDateString();
                const authorName = post.author.displayName || post.author.qnsName || `${post.author.address.slice(0, 6)}...${post.author.address.slice(-4)}`;
                
                return (
                  <div className="flex gap-4 items-start pb-6 mb-6 last:mb-0 last:pb-0 last:border-b-0 border-b border-gray-700" key={post.id}>
                    <div className="w-10 h-10 rounded-full bg-gray-500 flex-shrink-0 overflow-hidden">
                      {post.author.avatarUrl ? (
                        <img src={post.author.avatarUrl} alt={authorName} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-0">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => router.push(`/dashboard/profile/${post.author.address}`)}
                            className="font-bold text-gray-50 hover:text-white transition-colors"
                          >
                            {authorName}
                          </button>
                          <span className="text-sm text-gray-400">{timeAgo}</span>
                        </div>
                        <FollowButton 
                          targetAddress={post.author.address}
                          currentUserAddress={currentUser.address || ''}
                        />
                      </div>
                      <p className="text-gray-300 leading-relaxed text-sm">{post.textPreview}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOverview;

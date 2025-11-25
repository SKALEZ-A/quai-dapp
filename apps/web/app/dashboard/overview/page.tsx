"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getUserDomains } from '@/lib/qns';
import { useSocial } from '@/hooks/useSocial';
import { useBalance } from 'wagmi';
import { formatEther } from 'viem';
import FollowButton from '@/components/FollowButton';
import { formatTimeAgo } from '@/utils/timeFormat';

// SVG Icon Components
const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const PostIcon = (props: React.SVGProps<SVGSVGElement>) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const BridgeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M8.5 17H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15.5 7H20a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const BuyIcon = (props: React.SVGProps<SVGSVGElement>) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const DomainIcon = (props: React.SVGProps<SVGSVGElement>) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2" /></svg>;

const SendIcon = (props: React.SVGProps<SVGSVGElement>) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /><path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;


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
      console.log('🔵 useEffect triggered - loading domains for:', currentUser.address);
      loadDomains();
    } else if (!currentUser.address) {
      console.log('⚠️ No user address available');
    } else if (domainsLoaded) {
      console.log('ℹ️ Domains already loaded, skipping');
    }
  }, [currentUser.address, domainsLoaded]);

  const loadDomains = async () => {
    if (!currentUser.address) {
      console.log("❌ No user address available for loading domains");
      return;
    }

    // Avoid duplicate loading
    if (loadingDomains) {
      console.log("⚠️ Already loading domains, skipping duplicate request");
      return;
    }

    console.log("🔄 Loading domains for address:", currentUser.address);
    setLoadingDomains(true);

    try {
      // First try API cache for instant results
      console.log("🔄 Checking API cache first...");
      try {
        const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api-production-af00.up.railway.app'}/profiles/${currentUser.address}`);
        if (apiResponse.ok) {
          const profileData = await apiResponse.json();
          if (profileData.profile?.qnsName) {
            console.log("✅ Found domain from API cache (instant):", profileData.profile.qnsName);
            setMyDomains([profileData.profile.qnsName]);
            // Continue to blockchain query to verify/update
          }
        }
      } catch (apiError) {
        console.log("ℹ️ API cache check failed, will query blockchain:", apiError);
      }

      // Query blockchain for actual purchased domains with increased timeout
      console.log("🔄 Querying blockchain for purchased domains (this may take 30-60 seconds)...");
      const domains = await Promise.race([
        getUserDomains(currentUser.address),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Blockchain query timeout after 60 seconds')), 60000)) // Increased to 60 seconds
      ]) as string[];

      console.log("✅ Loaded domains from blockchain:", domains);

      if (domains.length > 0) {
        // Format domains with .quai suffix for display
        const formattedDomains = domains.map(domain => {
          // Strip any existing suffix and add .quai
          const cleanDomain = domain.toLowerCase().replace(/\.(quai|qns)$/, '');
          return `${cleanDomain}.quai`;
        });

        console.log("✅ Formatted domains for display:", formattedDomains);
        setMyDomains(formattedDomains);

        // Sync domains to database in background (non-blocking)
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api-production-af00.up.railway.app'}/profiles/sync-qns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: currentUser.address })
        })
          .then(res => res.json())
          .then(syncData => {
            if (syncData.success) {
              console.log("✅ Domains synced to database:", syncData.domains);
              currentUser.refreshProfile();
            } else {
              console.warn("⚠️ Database sync failed:", syncData.error);
            }
          })
          .catch(syncError => {
            console.warn("⚠️ Database sync failed (non-critical):", syncError);
          });
      } else {
        console.log("ℹ️ No domains found on blockchain for this address");
        // If API cache had a domain but blockchain didn't, keep the cached domain
        if (myDomains.length === 0) {
          setMyDomains([]);
        } else {
          console.log("ℹ️ Keeping cached domain from API:", myDomains);
        }
      }

      setDomainsLoaded(true);
    } catch (error) {
      console.error("❌ Error loading domains from blockchain:", error);

      // If we already have domains from cache, keep them
      if (myDomains.length > 0) {
        console.log("✅ Using cached domains from API:", myDomains);
        setDomainsLoaded(true);
        setLoadingDomains(false);
        return;
      }

      // Try API fallback as last resort
      try {
        console.log("🔄 Attempting API fallback for domains...");
        const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api-production-af00.up.railway.app'}/profiles/${currentUser.address}`);
        if (apiResponse.ok) {
          const profileData = await apiResponse.json();
          if (profileData.profile?.qnsName) {
            console.log("✅ Found domain from API fallback:", profileData.profile.qnsName);
            setMyDomains([profileData.profile.qnsName]);
            setDomainsLoaded(true);
            setLoadingDomains(false);
            return;
          }
        }
      } catch (apiError) {
        console.warn("⚠️ API fallback also failed:", apiError);
      }

      console.log("ℹ️ No domains will be displayed (all queries failed)");
      setMyDomains([]);
      setDomainsLoaded(true);
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

  // Handle IPFS URLs for image display
  const getImageUrl = (url?: string | null): string => {
    // Handle null, undefined, or empty string
    if (!url || url.trim() === '') return '/assets/avatars/default-avatar.png';

    // If already a full URL or relative path, return as-is
    if (url.startsWith('http') || url.startsWith('/')) return url;

    // IPFS CID - convert to Pinata gateway URL
    return `https://gateway.pinata.cloud/ipfs/${url}`;
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
              <div className="py-6 md:py-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
                  <span className="text-gray-400 text-sm sm:text-base font-medium">Wallet Address</span>
                  <div className="flex items-center justify-between sm:justify-end gap-3 bg-gray-800/50 border border-gray-700/50 px-3 py-2.5 rounded-lg font-mono text-xs sm:text-sm w-full sm:w-auto max-w-full sm:max-w-[320px] transition-colors hover:border-gray-600">
                    <span className="truncate text-gray-200 select-all">
                      {currentUser.short_address}
                    </span>
                    <button
                      className="text-gray-400 hover:text-white transition-colors flex-shrink-0 p-1 hover:bg-gray-700 rounded"
                      onClick={() => copyItem(currentUser.address ?? "")}
                      title="Copy Address"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
                  <span className="text-gray-400 text-sm sm:text-base font-medium">Synq Payment Code</span>
                  <div className="flex items-center justify-between sm:justify-end gap-3 bg-gray-800/50 border border-gray-700/50 px-3 py-2.5 rounded-lg font-mono text-xs sm:text-sm w-full sm:w-auto max-w-full sm:max-w-[320px] transition-colors hover:border-gray-600">
                    <span className="truncate text-gray-200 select-all">
                      {currentUser.username}
                    </span>
                    <button
                      className="text-gray-400 hover:text-white transition-colors flex-shrink-0 p-1 hover:bg-gray-700 rounded"
                      onClick={() => copyItem(currentUser.username)}
                      title="Copy Payment Code"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Balance Card */}
          <div className="">
            <h2 className="font-space-grotesk font-bold text-xl mb-4">Wallet Balance</h2>
            <div className="bg-black border border-gray-700 rounded-lg py-8 p-6 flex flex-col md:flex-row justify-between items-start pb-8 mb-6">
              <div className="flex flex-col mb-4 md:mb-0">
                <span className="text-gray-400 text-sm mb-2">Quai</span>
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
                      <small className="text-md text-gray-400 ml-1">QUAI</small>
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
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-100">Quick Action</h3>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="col-span-2">
                <button 
                  onClick={() => router.push('/dashboard/social')} 
                  className="group w-full h-20 flex flex-row items-center justify-center gap-3 px-4 rounded-lg bg-[#b12c5b] hover:bg-[#c9356b] text-gray-50 font-medium transition-all active:scale-[0.98]"
                >
                  <PostIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white/90 group-hover:text-white transition-colors" />
                  <span className="text-base sm:text-lg font-semibold">Create Post</span>
                </button>
              </div>
              <div className="col-span-1">
                <button 
                  onClick={() => router.push('/dashboard/bridge')} 
                  className="group w-full h-20 flex flex-row items-center justify-center gap-2 px-3 rounded-lg bg-black border border-gray-800 hover:border-gray-600 text-gray-50 font-medium transition-all active:scale-[0.98]"
                >
                  <BridgeIcon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-300 group-hover:text-white transition-colors" />
                  <span className="text-base sm:text-lg font-semibold">Bridge</span>
                </button>
              </div>
              <div className="col-span-1">
                <button 
                  onClick={() => router.push('/qns/profile')} 
                  className="group w-full h-20 flex flex-row items-center justify-center gap-2 px-3 rounded-lg bg-[#3366ff] hover:bg-[#4775ff] text-gray-50 font-medium transition-all active:scale-[0.98]"
                >
                  <BuyIcon className="w-6 h-6 mt-2 sm:w-7 sm:h-7 text-white/90 group-hover:text-white transition-colors" />
                  <span className="text-base sm:text-lg font-semibold">Get QNS</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* My QNS Domains Section */}
        <div className="mt-8">
          {/* HEADER: Stack on mobile, Row on Desktop */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <h3 className="text-lg md:text-xl font-space-grotesk font-semibold flex items-center gap-2">
              <DomainIcon className="w-5 h-5 md:w-6 md:h-6" /> My QNS Domains
            </h3>

            {/* HEADER BUTTONS: Full width on mobile, auto on desktop */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <button
                onClick={() => {
                  setDomainsLoaded(false);
                  loadDomains();
                }}
                disabled={loadingDomains}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-700 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 w-full sm:w-auto"
              >
                {loadingDomains ? "Loading..." : "Refresh"}
              </button>
              <button
                onClick={() => router.push('/qns/namesearch')}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90 transition-opacity w-full sm:w-auto"
              >
                <BuyIcon className="w-5 h-5 mt-2" /> Buy Domain
              </button>
            </div>
          </div>

          {/* MAIN CONTAINER: Responsive Padding (p-4 -> p-6) */}
          <div className="bg-black border border-gray-700 rounded-xl p-4 md:p-6">
            {loadingDomains ? (
              <div className="text-center py-8 md:py-12 text-gray-400">
                <div className="animate-spin inline-block w-6 h-6 md:w-8 md:h-8 border-4 border-gray-600 border-t-primary rounded-full mb-2"></div>
                <p className="text-sm md:text-base">Loading your domains...</p>
              </div>
            ) : myDomains.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <div className="text-4xl md:text-6xl mb-4">🌐</div>
                <p className="text-gray-400 mb-4 text-sm md:text-base">You don't own any QNS domains yet</p>
                <button onClick={() => router.push('/qns/namesearch')} className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm md:text-base">
                  Get Your First Domain
                </button>
              </div>
            ) : (
              /* GRID: 1 col (mobile) -> 2 col (tablet) -> 3 col (desktop) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {myDomains.map((domain, index) => (
                  <div key={index} className="border border-gray-700 rounded-lg p-3 md:p-4 hover:border-primary transition-colors flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <DomainIcon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                        {/* Truncate ensures long names don't break the card */}
                        <span className="font-space-grotesk font-bold text-text-primary truncate text-sm md:text-base">{domain}</span>
                      </div>
                      <span className="text-[10px] md:text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded flex-shrink-0">Active</span>
                    </div>

                    {/* ACTION BUTTONS: 3-Column Grid ensures they are equal width */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <button
                        onClick={() => copyItem(domain)}
                        className="flex items-center justify-center gap-1 px-2 py-2 text-xs bg-gray-800 hover:bg-gray-700 rounded transition-colors text-gray-300"
                        title="Copy Name"
                      >
                        <CopyIcon className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden xl:inline">Copy</span>
                      </button>
                      <button
                        onClick={() => alert('Transfer feature coming soon!')}
                        className="flex items-center justify-center gap-1 px-2 py-2 text-xs bg-gray-800 hover:bg-gray-700 rounded transition-colors text-gray-300"
                        title="Transfer Domain"
                      >
                        <SendIcon className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden xl:inline">Send</span>
                      </button>
                      <button
                        onClick={() => alert('Domain settings coming soon!')}
                        className="flex items-center justify-center gap-1 px-2 py-2 text-xs bg-gray-800 hover:bg-primary/20 rounded transition-colors text-gray-300"
                        title="Settings"
                      >
                        <SettingsIcon className="w-3 h-3 md:w-4 md:h-4" />
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
          {/* HEADER: Stacked on mobile, Row on tablet+ */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3 sm:gap-4">
            <h3 className="text-xl font-semibold">Social Activity</h3>

            {/* BUTTON: Full width on mobile for better touch target, auto on desktop */}
            <button
              onClick={() => router.push('/dashboard/social')}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-pink-700 text-gray-50 font-medium w-full sm:w-auto transition-transform active:scale-95"
            >
              <PostIcon className="w-5 h-5" /> Post
            </button>
          </div>

          {/* FEED CONTAINER: Responsive padding */}
          <div className="bg-black border border-gray-700 rounded-xl p-4 sm:p-6 md:p-8 recent-posts-feed">
            <h4 className="text-sm sm:text-base text-gray-100 font-medium mb-6 sm:mb-10">Recent Posts</h4>

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
                const timeAgo = formatTimeAgo(post.createdAt);
                const authorName = post.author.displayName || post.author.qnsName || `${post.author.address.slice(0, 6)}...${post.author.address.slice(-4)}`;

                return (
                  <div className="flex gap-3 sm:gap-4 items-start pb-6 mb-6 last:mb-0 last:pb-0 last:border-b-0 border-b border-gray-700" key={post.id}>

                    {/* AVATAR: Responsive sizing (8->10->12) */}
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gray-500 flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/profile/${post.author.address}`);
                      }}
                    >
                      <img src={getImageUrl(post.author.avatarUrl)} alt={authorName} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col flex-1 min-w-0"> {/* min-w-0 ensures text truncation works */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/profile/${post.author.address}`);
                            }}
                            className="font-bold text-sm sm:text-base text-gray-50 hover:text-white transition-colors cursor-pointer hover:underline truncate"
                          >
                            {authorName}
                          </button>
                          <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">{timeAgo}</span>
                        </div>

                        {/* Follow Button Container */}
                        <div className="ml-2 flex-shrink-0">
                          <FollowButton
                            targetAddress={post.author.address}
                            currentUserAddress={currentUser.address || ''}
                          />
                        </div>
                      </div>

                      <div
                        className="cursor-pointer"
                        onClick={() => router.push(`/dashboard/post/${post.id}`)}
                      >
                        {/* TEXT: Added break-words and responsive text size */}
                        <p className="text-gray-300 leading-relaxed text-sm md:text-base break-words whitespace-pre-wrap">
                          {post.textPreview}
                        </p>
                      </div>
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

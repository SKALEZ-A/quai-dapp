"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLeaderboard } from '@/hooks/useLeaderboard';

// SVG Icons
const TrophyIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 22h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21l-1 .42A2 2 0 0 1 6 16.5v-1.84" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 14.66V17c0 .55.47.98.97 1.21l1 .42A2 2 0 0 0 18 16.5v-1.84" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const MedalIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="2"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ArrowLeftIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const LeaderboardPage = () => {
  const router = useRouter();
  const { leaderboard, isLoading, error, refreshLeaderboard } = useLeaderboard(50);

  // Handle IPFS URLs for image display
  const getImageUrl = (url?: string | null): string => {
    // Handle null, undefined, or empty string
    if (!url || url.trim() === '') return '/assets/avatars/default-avatar.png';
    
    // If already a full URL or relative path, return as-is
    if (url.startsWith('http') || url.startsWith('/')) return url;
    
    // IPFS CID - convert to Pinata gateway URL
    return `https://gateway.pinata.cloud/ipfs/${url}`;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-sm">
          🥇
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-black font-bold text-sm">
          🥈
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold text-sm">
          🥉
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold text-sm">
          #{rank}
        </div>
      );
    }
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'text-yellow-400';
    if (rank <= 10) return 'text-blue-400';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen text-gray-100 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-yellow-400">
              <TrophyIcon />
            </div>
            <h1 className="text-2xl font-bold">Leaderboard</h1>
          </div>
        </div>

        {/* Leaderboard Content */}
        <div className="bg-black border border-gray-700 rounded-xl p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                  <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  <div className="flex-grow">
                    <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-600 rounded w-1/4"></div>
                  </div>
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 text-lg font-medium mb-4">Failed to load leaderboard</div>
              <div className="text-gray-400 text-sm mb-6">{error}</div>
              <button 
                onClick={refreshLeaderboard}
                className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 text-gray-600 mx-auto mb-4">
                <TrophyIcon />
              </div>
              <div className="text-gray-400 text-lg mb-2">No users yet</div>
              <div className="text-gray-500 text-sm">Be the first to post and climb the leaderboard!</div>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.rank} 
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/profile/${entry.profile.address}`)}
                >
                  {/* Rank Badge */}
                  {getRankBadge(entry.rank)}
                  
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gray-600 overflow-hidden flex-shrink-0">
                    <img 
                      src={getImageUrl(entry.profile.avatarUrl)} 
                      className="w-full h-full object-cover" 
                      alt={`${entry.profile.displayName || entry.profile.qnsName || 'User'} Profile`} 
                    />
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-grow min-w-0">
                    <div className="font-medium text-white truncate">
                      {entry.profile.displayName || entry.profile.qnsName || 
                       `${entry.profile.address.slice(0, 6)}...${entry.profile.address.slice(-4)}`}
                    </div>
                    <div className="text-sm text-gray-400">
                      {entry.postCount} posts • {Math.round(entry.engagementScore)} points
                    </div>
                  </div>
                  
                  {/* Engagement Score */}
                  <div className="text-right">
                    <div className={`font-bold text-lg ${getRankColor(entry.rank)}`}>
                      {Math.round(entry.engagementScore)}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {leaderboard.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black border border-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{leaderboard.length}</div>
              <div className="text-sm text-gray-400">Total Users</div>
            </div>
            <div className="bg-black border border-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {leaderboard.reduce((sum, entry) => sum + entry.postCount, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Posts</div>
            </div>
            <div className="bg-black border border-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {Math.round(leaderboard.reduce((sum, entry) => sum + entry.engagementScore, 0))}
              </div>
              <div className="text-sm text-gray-400">Total Points</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;

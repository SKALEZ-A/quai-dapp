"use client";

import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { useProfile } from "./useProfile";
import { formatDomainName } from "@/lib/qns";

export type CurrentUser = {
  name: string;
  username: string;
  address: string | null;
  short_address: string;
  profileImg: string;
  coverImg: string;
  about: string;
  date_joined: string;
  followers: number;
  following: number;
};

const DEFAULT_PROFILE_IMG = "/assets/avatars/alice-chen.png";
const DEFAULT_COVER_IMG = "/assets/pattern.png";

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);
const API_BASE_URL = isLocalhost ? '/api/proxy' : (process.env.NEXT_PUBLIC_API_URL || 'https://api-production-af00.up.railway.app');

// Helper function to convert IPFS CIDs to full URLs
const getImageUrl = (url?: string | null): string => {
  // Handle null, undefined, or empty string
  if (!url || url.trim() === '') return DEFAULT_PROFILE_IMG;
  // If already a full URL or relative path, return as-is
  if (url.startsWith('http') || url.startsWith('/')) {
    return url;
  }
  // If it's an IPFS CID, use Pinata gateway
  return `https://gateway.pinata.cloud/ipfs/${url}`;
};

export function useCurrentUser(): CurrentUser & { refreshProfile: () => void } {
  const { address } = useAccount();
  const { fetchProfile } = useProfile();
  const [profileData, setProfileData] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const finalAddress = address || '0xe2f92e8f706997b021919a092437372b268a432d';
  
  const refreshProfile = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  useEffect(() => {
    const loadProfile = async () => {
      if (!finalAddress) return;
      
      try {
        console.log('🔄 Loading profile for address:', finalAddress);
        setIsLoading(true);
        const profile = await fetchProfile(finalAddress);
        console.log('✅ Profile loaded:', profile);
        
        // Auto-sync QNS domains if profile doesn't have qnsName
        if (profile && !profile.qnsName && finalAddress) {
          try {
            console.log('🔄 Auto-syncing QNS domains for address:', finalAddress);
            const syncResponse = await fetch(`${API_BASE_URL}/profiles/sync-qns`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ address: finalAddress })
            });
            
            const syncData = await syncResponse.json();
            if (syncData.success && syncData.profile) {
              console.log('✅ QNS domains synced:', syncData.domains);
              // Update profile with synced QNS
              profile.qnsName = syncData.profile.qnsName;
            } else {
              console.log('ℹ️  No QNS domains found for this address');
            }
          } catch (syncError) {
            console.warn('⚠️  QNS sync failed (non-critical):', syncError);
            // Don't fail the entire profile load if QNS sync fails
          }
        }
        
        const profileImgUrl = getImageUrl(profile.avatarUrl);
        const coverImgUrl = getImageUrl(profile.coverUrl) || DEFAULT_COVER_IMG;
        
        const userData = {
          name: profile.displayName || "Quai User",
          username: profile.qnsName ? formatDomainName(profile.qnsName) : `${finalAddress.slice(2, 8)}.quai`,
          address: finalAddress,
          short_address: `${finalAddress.slice(0, 6)}...${finalAddress.slice(-4)}`,
          profileImg: profileImgUrl,
          coverImg: coverImgUrl,
          about: profile.bio || "Exploring Quai Network and the Synq Superapp.",
          date_joined: "Joined Sep 2025",
          followers: profile._count?.followers || 0,
          following: profile._count?.following || 0,
        };
        
        setProfileData(userData);
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Fallback to default data
        setProfileData({
          name: "Quai User",
          username: "Quai User",
          address: finalAddress,
          short_address: `${finalAddress.slice(0, 6)}...${finalAddress.slice(-4)}`,
          profileImg: DEFAULT_PROFILE_IMG,
          coverImg: DEFAULT_COVER_IMG,
          about: "Exploring Quai Network and the Synq Superapp.",
          date_joined: "Joined Sep 2025",
          followers: 0,
          following: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Add debouncing to prevent rapid API calls
    const timeoutId = setTimeout(() => {
      loadProfile();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [finalAddress, fetchProfile, refreshTrigger]);

  // Return loading state while fetching data
  if (isLoading || !profileData) {
    return {
      name: "Loading...",
      username: "Loading...",
      address: finalAddress,
      short_address: `${finalAddress.slice(0, 6)}...${finalAddress.slice(-4)}`,
      profileImg: DEFAULT_PROFILE_IMG,
      coverImg: DEFAULT_COVER_IMG,
      about: "Loading profile...",
      date_joined: "Loading...",
      followers: 0,
      following: 0,
      refreshProfile,
    };
  }

  return { ...profileData, refreshProfile };
}
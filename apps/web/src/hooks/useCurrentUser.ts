"use client";

import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { useProfile } from "./useProfile";

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
        setIsLoading(true);
        const profile = await fetchProfile(finalAddress);
        
        setProfileData({
          name: profile.displayName || "Quai User",
          username: profile.qnsName || `${finalAddress.slice(2, 8)}.quai`,
          address: finalAddress,
          short_address: `${finalAddress.slice(0, 6)}...${finalAddress.slice(-4)}`,
          profileImg: profile.avatarUrl || DEFAULT_PROFILE_IMG,
          coverImg: profile.coverUrl || DEFAULT_COVER_IMG,
          about: profile.bio || "Exploring Quai Network and the Synq Superapp.",
          date_joined: "Joined Sep 2025",
          followers: profile._count?.followers || 0,
          following: profile._count?.following || 0,
        });
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
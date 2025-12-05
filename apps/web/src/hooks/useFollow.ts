import { useState, useCallback } from 'react';

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.includes('localhost')
);
const API_BASE_URL = isLocalhost ? '/api/proxy' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

export interface FollowUser {
  id: string;
  address: string;
  displayName?: string;
  avatarUrl?: string;
  qnsName?: string;
}

export interface FollowCounts {
  followers: number;
  following: number;
}

export function useFollow() {
  const [isLoading, setIsLoading] = useState(false);

  const followUser = useCallback(async (followerAddress: string, followingAddress: string): Promise<FollowCounts> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/follows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerAddress,
          followingAddress,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to follow user: ${response.statusText}`);
      }

      const result = await response.json();
      return result.counts;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unfollowUser = useCallback(async (followerAddress: string, followingAddress: string): Promise<FollowCounts> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/follows/${followingAddress}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerAddress,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to unfollow user: ${response.statusText}`);
      }

      const result = await response.json();
      return result.counts;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFollowers = useCallback(async (address: string): Promise<{ followers: FollowUser[]; count: number }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/follows/followers/${address}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch followers: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching followers:', error);
      throw error;
    }
  }, []);

  const getFollowing = useCallback(async (address: string): Promise<{ following: FollowUser[]; count: number }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/follows/following/${address}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch following: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching following:', error);
      throw error;
    }
  }, []);

  const checkFollowStatus = useCallback(async (followerAddress: string, followingAddress: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/follows/status/${followerAddress}/${followingAddress}`);

      if (!response.ok) {
        throw new Error(`Failed to check follow status: ${response.statusText}`);
      }

      const result = await response.json();
      return result.isFollowing;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }, []);

  return {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    checkFollowStatus,
    isLoading,
  };
}

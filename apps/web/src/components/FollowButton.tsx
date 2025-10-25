"use client";

import React, { useState, useEffect } from 'react';
import { useFollow } from '@/hooks/useFollow';

interface FollowButtonProps {
  targetAddress: string;
  currentUserAddress: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ 
  targetAddress, 
  currentUserAddress,
  onFollowChange 
}) => {
  const { followUser, unfollowUser, checkFollowStatus, isLoading } = useFollow();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check initial follow status
  useEffect(() => {
    const checkStatus = async () => {
      if (currentUserAddress && targetAddress && currentUserAddress !== targetAddress) {
        setIsChecking(true);
        try {
          const status = await checkFollowStatus(currentUserAddress, targetAddress);
          setIsFollowing(status);
        } catch (error) {
          console.error('Error checking follow status:', error);
        } finally {
          setIsChecking(false);
        }
      } else {
        setIsChecking(false);
      }
    };

    checkStatus();
  }, [currentUserAddress, targetAddress, checkFollowStatus]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(currentUserAddress, targetAddress);
        setIsFollowing(false);
        onFollowChange?.(false);
      } else {
        await followUser(currentUserAddress, targetAddress);
        setIsFollowing(true);
        onFollowChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      // Optionally show error toast
    }
  };

  // Don't show button if viewing own profile
  if (currentUserAddress === targetAddress) {
    return null;
  }

  // Show loading state while checking
  if (isChecking) {
    return (
      <button
        disabled
        className="bg-gray-700 text-gray-400 rounded-full py-2 px-6 text-sm font-medium cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={`rounded-full py-2 px-6 text-sm font-medium transition-all duration-200 ${
        isFollowing
          ? 'bg-transparent border-2 border-white text-white hover:bg-red-600 hover:border-red-600 hover:text-white'
          : 'bg-white text-black hover:bg-gray-200'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton;

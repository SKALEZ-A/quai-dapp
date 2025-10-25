import { useState, useCallback } from 'react';

export interface ProfileData {
  id: string;
  address: string;
  qnsName?: string;
  displayName?: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    followers: number;
    following: number;
  };
}

export interface UpdateProfileData {
  displayName?: string;
  qnsName?: string;
  bio?: string;
  avatarFile?: File;
  coverFile?: File;
  avatarCid?: string;
  coverCid?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useProfile() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = useCallback(async (address: string): Promise<ProfileData> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${address}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Profile doesn't exist yet, return default data
          return {
            id: '',
            address,
            displayName: 'Quai User',
            bio: 'Exploring Quai Network and the Synq Superapp.',
            avatarUrl: '/assets/avatars/alice-chen.png',
            coverUrl: '/assets/pattern.png',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _count: {
              followers: 0,
              following: 0,
            },
          };
        }
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const profile = await response.json();
      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Return default data if API is not available
      return {
        id: '',
        address,
        displayName: 'Quai User',
        bio: 'Exploring Quai Network and the Synq Superapp.',
        avatarUrl: '/assets/avatars/alice-chen.png',
        coverUrl: '/assets/pattern.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
          followers: 0,
          following: 0,
        },
      };
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  const uploadImageToPinata = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/profiles/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to Pinata');
    }

    const result = await response.json();
    return result.cid;
  };

  const updateProfile = async (data: UpdateProfileData, address: string): Promise<ProfileData> => {
    setIsLoading(true);
    try {
      // Upload images to Pinata if new files are provided
      let avatarCid = data.avatarCid;
      let coverCid = data.coverCid;

      if (data.avatarFile) {
        avatarCid = await uploadImageToPinata(data.avatarFile);
      }

      if (data.coverFile) {
        coverCid = await uploadImageToPinata(data.coverFile);
      }

      // Send update request WITHOUT signature
      const response = await fetch(`${API_BASE_URL}/profiles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          displayName: data.displayName,
          qnsName: data.qnsName,
          bio: data.bio,
          avatarCid,
          coverCid,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }

      const updatedProfile = await response.json();
      
      console.log('✅ Profile updated successfully (signature-free):', updatedProfile);
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchProfile,
    updateProfile,
    isLoading,
  };
}
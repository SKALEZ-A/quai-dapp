"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar as faCalendarRegular } from '@fortawesome/free-regular-svg-icons';
import FollowButton from '@/components/FollowButton';
import ImageWithLoading from '@/components/ImageWithLoading';
import { PostSkeletonList } from '@/components/PostSkeleton';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSocial } from '@/hooks/useSocial';
import { useProfile } from '@/hooks/useProfile';

const CommentIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const RepostIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const LikeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ShareIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8m-4-6-4-4-4 4m4-4v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

interface UserProfileData {
  name: string;
  username: string;
  address: string;
  short_address: string;
  profileImg: string;
  coverImg: string;
  about: string;
  date_joined: string;
  followers: number;
  following: number;
}

const UserProfilePage: React.FC = () => {
  const params = useParams();
  const targetAddress = params.address as string;
  const currentUser = useCurrentUser();
  const { posts, isLoading: postsLoading, fetchPosts } = useSocial();
  const { fetchProfile } = useProfile();
  
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media' | 'likes'>('posts');

  // Handle IPFS URLs for image display
  const getImageUrl = (url: string) => {
    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }
    // If it's an IPFS CID, use Pinata gateway
    return `https://gateway.pinata.cloud/ipfs/${url}`;
  };

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!targetAddress) return;
      
      setIsLoading(true);
      try {
        const profile = await fetchProfile(targetAddress);
        setUserProfile({
          name: profile.displayName || "Quai User",
          username: profile.qnsName || `${targetAddress.slice(2, 8)}.quai`,
          address: targetAddress,
          short_address: `${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}`,
          profileImg: profile.avatarUrl || '/default-profile.png',
          coverImg: profile.coverUrl || '/default-cover.png',
          about: profile.bio || "Exploring Quai Network and the Synq Superapp.",
          date_joined: "Joined Sep 2025",
          followers: profile._count?.followers || 0,
          following: profile._count?.following || 0,
        });
      } catch (error) {
        console.error('Failed to load user profile:', error);
        // Set fallback data
        setUserProfile({
          name: "Unknown User",
          username: `${targetAddress.slice(2, 8)}.quai`,
          address: targetAddress,
          short_address: `${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}`,
          profileImg: '/default-profile.png',
          coverImg: '/default-cover.png',
          about: "User profile not found.",
          date_joined: "Unknown",
          followers: 0,
          following: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [targetAddress, fetchProfile]);

  const handleFollowChange = (isFollowing: boolean) => {
    // Refresh user profile to update follower counts
    if (userProfile) {
      setUserProfile(prev => prev ? {
        ...prev,
        followers: isFollowing ? prev.followers + 1 : prev.followers - 1
      } : null);
    }
  };

  const getImageGridClasses = (imageCount: number) => {
    switch (imageCount) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-2 grid-rows-2 [&>*:first-child]:col-span-2';
      case 4: return 'grid-cols-2 grid-rows-2';
      default: return 'grid-cols-1';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 mt-[-20px]">
        <main className="flex flex-col gap-4 pr-6 lg:pr-0 relative">
          <div className="bg-black rounded-lg overflow-hidden relative">
            <div className="h-28 bg-gray-700 animate-pulse"></div>
            <div className="relative px-6 py-6">
              <div className="absolute -top-10 left-6 w-20 h-20 rounded-full bg-gray-700 animate-pulse"></div>
              <div className="mt-6 space-y-2">
                <div className="h-6 bg-gray-700 rounded animate-pulse w-32"></div>
                <div className="h-4 bg-gray-700 rounded animate-pulse w-24"></div>
                <div className="h-4 bg-gray-700 rounded animate-pulse w-40"></div>
              </div>
            </div>
          </div>
          <PostSkeletonList count={3} />
        </main>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 mt-[-20px]">
        <main className="flex flex-col gap-4 pr-6 lg:pr-0 relative">
          <div className="bg-black rounded-lg overflow-hidden relative p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">User Not Found</h2>
            <p className="text-gray-400">This user profile could not be loaded.</p>
          </div>
        </main>
      </div>
    );
  }

  // Filter posts by this user
  const userPosts = posts.filter(post => post.author === targetAddress);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 mt-[-20px]">
      <main className="flex flex-col gap-4 pr-6 lg:pr-0 relative">
        <div className="bg-black rounded-lg overflow-hidden relative">
          <div className="h-28 bg-white rounded-t-lg overflow-hidden">
            <img src={getImageUrl(userProfile.coverImg)} className="w-full h-auto transform translate-y-[-40%]" alt="Cover" />
          </div>

          <div className="relative px-6 py-6">
            <div className="absolute -top-10 left-6 w-20 h-20 rounded-full bg-purple-700 border-2 border-background shadow-md overflow-hidden">
              <img src={getImageUrl(userProfile.profileImg)} className="w-auto h-full" alt="Profile" />
            </div>

            <div className="mt-6">
              <h3 className="font-bold text-xl">{userProfile.name}</h3>
              <p className="text-sm text-gray-400">{userProfile.username}</p>
              <p className="text-sm mt-5">{userProfile.about}</p>
              <p className="text-xs text-gray-400 mt-2"><FontAwesomeIcon icon={faCalendarRegular} className="text-white font-bold"/><span className="mx-1">{userProfile.date_joined}</span></p>
              <div className="flex gap-3">
                <p className="text-xs text-gray-400 mt-2"><span className="font-extrabold text-white">{userProfile.followers}</span><span className="mx-1">Followers</span></p>
                <p className="text-xs text-gray-400 mt-2"><span className="font-extrabold text-white">{userProfile.following}</span><span className="mx-1">Following</span></p>
              </div>
            </div>
            
            {/* Follow Button */}
            <div className="absolute top-5 right-5">
              <FollowButton 
                targetAddress={targetAddress}
                currentUserAddress={currentUser.address || ''}
                onFollowChange={handleFollowChange}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {(['posts', 'replies', 'media', 'likes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {postsLoading ? (
            <PostSkeletonList count={3} />
          ) : userPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No posts found for this user.</p>
            </div>
          ) : (
            userPosts.map((post) => (
              <div key={post.id} className="bg-black rounded-lg p-4 border border-gray-700">
                <div className="flex items-start gap-3">
                  <img
                    src={getImageUrl(userProfile.profileImg)}
                    alt={userProfile.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{userProfile.name}</span>
                      <span className="text-gray-400 text-sm">{userProfile.username}</span>
                      <span className="text-gray-500 text-sm">•</span>
                      <span className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-white mb-3">{post.content}</p>
                    
                    {/* Post Images */}
                    {post.imageCids && post.imageCids.length > 0 && (
                      <div className={`grid ${getImageGridClasses(post.imageCids.length)} gap-2 mb-3`}>
                        {post.imageCids.map((cid, index) => (
                          <div key={index} className="relative">
                            <ImageWithLoading
                              src={`https://gateway.pinata.cloud/ipfs/${cid}`}
                              alt={`Post image ${index + 1}`}
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-6 text-gray-400">
                      <button className="flex items-center gap-2 hover:text-white transition-colors">
                        <CommentIcon />
                        <span className="text-sm">{post.commentCount || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-white transition-colors">
                        <RepostIcon />
                        <span className="text-sm">{post.repostCount || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-white transition-colors">
                        <LikeIcon />
                        <span className="text-sm">{post.likeCount || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-white transition-colors">
                        <ShareIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;

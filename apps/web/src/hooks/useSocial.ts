"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { generatePostSignature, generateCommentSignature, generateNonce } from '@/lib/signatures';
import { useAccount } from 'wagmi';

export interface SocialPost {
  id: string;
  textPreview?: string;
  cid: string;
  imageCids?: string[];
  author: {
    id: string;
    address: string;
    qnsName?: string;
    displayName?: string;
    avatarUrl?: string;
  };
  createdAt: string;
  likes?: Array<{ 
    id: string; 
    profileId: string; 
    postId: string;
    profile?: {
      id: string;
      address: string;
      qnsName?: string;
      displayName?: string;
      avatarUrl?: string;
    }
  }>;
  comments?: Array<{ id: string; textPreview?: string; authorId: string; postId: string }>;
  zone?: string;
}

export interface CreatePostData {
  text: string;
  zone?: string;
  images?: File[];
}

export function useSocial(filterByFollowing: boolean = false, currentUserAddress?: string) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [allPosts, setAllPosts] = useState<SocialPost[]>([]);
  const [followingAddresses, setFollowingAddresses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  // Fetch following list
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!currentUserAddress) return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api-production-af00.up.railway.app'}/follows/following/${currentUserAddress}`);
        if (response.ok) {
          const data = await response.json();
          const addresses = data.following?.map((f: any) => f.following.address.toLowerCase()) || [];
          setFollowingAddresses(addresses);
        }
      } catch (err) {
        console.error('Failed to fetch following list:', err);
      }
    };
    fetchFollowing();
  }, [currentUserAddress]);

  // Apply filter to posts
  useEffect(() => {
    if (filterByFollowing) {
      if (followingAddresses.length > 0) {
        const filtered = allPosts.filter(post => 
          followingAddresses.includes(post.author.address.toLowerCase())
        );
        console.log('📊 Following filter active:', {
          totalPosts: allPosts.length,
          filteredPosts: filtered.length,
          followingCount: followingAddresses.length
        });
        setPosts(filtered);
      } else {
        // No following addresses yet, show empty
        console.log('📊 Following tab but no following addresses yet');
        setPosts([]);
      }
    } else {
      console.log('📊 For You tab - showing all posts:', allPosts.length);
      setPosts(allPosts);
    }
  }, [filterByFollowing, followingAddresses, allPosts]);

  // Fetch posts from API with retry logic
  const fetchPosts = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching posts... (attempt:', retryCount + 1, ')');
      const response = await api.getPosts(20);
      
      if (response && response.posts) {
        console.log('✅ Posts loaded successfully:', response.posts.length);
        setAllPosts(response.posts);
        // Initial set of posts (will be filtered by useEffect)
        setPosts(response.posts);
      } else {
        console.warn('⚠️ No posts in response:', response);
        setPosts([]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch posts:', err);
      
      // Retry once if it's a network error
      if (retryCount === 0 && err instanceof Error && (
        err.message.includes('Failed to fetch') || 
        err.message.includes('NetworkError') ||
        err.message.includes('fetch')
      )) {
        console.log('🔄 Retrying fetch after network error...');
        setTimeout(() => fetchPosts(1), 1000);
        return;
      }
      
      setError(`Failed to load posts: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new post
  const createPost = async (postData: CreatePostData, authorAddress: string) => {
    try {
      setIsCreatingPost(true);
      setError(null);

      console.log('Creating post with data:', {
        text: postData.text,
        hasImages: !!postData.images?.length,
        imageCount: postData.images?.length || 0,
        authorAddress
      });

      // Validate post data
      if (!postData.text.trim() && (!postData.images || postData.images.length === 0)) {
        throw new Error('Post must contain text or at least one image');
      }

      if (postData.images && postData.images.length > 4) {
        throw new Error('Maximum 4 images allowed per post');
      }

      // Generate EIP-712 signature for the post
      const issuedAt = Date.now();
      const nonce = generateNonce();
      
      // Generate proper signature using our utility
      const signature = await generatePostSignature(
        {
          author: authorAddress,
          text: postData.text,
          zone: postData.zone || 'cyprus-1',
          issuedAt,
          nonce,
        },
        authorAddress,
        undefined // TODO: Pass wagmi signer when available
      );

      const response = await api.createPost({
        authorAddress,
        text: postData.text,
        zone: postData.zone,
        issuedAt,
        nonce,
        signature,
        images: postData.images
      });

      // Refresh posts after creating
      await fetchPosts();
      
      return response;
    } catch (err) {
      console.error('Failed to create post:', err);
      
      // Handle specific error types
      let errorMessage = 'Failed to create post';
      if (err instanceof Error) {
        if (err.message.includes('rate limit')) {
          errorMessage = 'Too many posts created. Please wait a moment before posting again.';
        } else if (err.message.includes('image')) {
          errorMessage = err.message;
        } else if (err.message.includes('signature')) {
          errorMessage = 'Authentication failed. Please reconnect your wallet.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Like a post with optimistic UI update
  const likePost = async (profileAddress: string, postId: string) => {
    try {
      // Optimistic update: immediately update the UI before API call
      const updatePosts = (currentPosts: SocialPost[]) => {
        return currentPosts.map(post => {
          if (post.id === postId) {
            // Check if already liked
            const alreadyLiked = post.likes?.some(like => 
              like.profile?.address?.toLowerCase() === profileAddress.toLowerCase()
            );
            
            if (alreadyLiked) {
              // Unlike: remove the like
              return {
                ...post,
                likes: post.likes?.filter(like => 
                  like.profile?.address?.toLowerCase() !== profileAddress.toLowerCase()
                ) || []
              };
            } else {
              // Like: add new like with optimistic data
              return {
                ...post,
                likes: [
                  ...(post.likes || []),
                  {
                    id: `temp-${Date.now()}`,
                    profileId: profileAddress,
                    postId: postId,
                    profile: {
                      id: profileAddress,
                      address: profileAddress,
                      qnsName: undefined,
                      displayName: undefined,
                      avatarUrl: undefined
                    }
                  }
                ]
              };
            }
          }
          return post;
        });
      };
      
      // Update both posts arrays optimistically
      setPosts(prevPosts => updatePosts(prevPosts));
      setAllPosts(prevPosts => updatePosts(prevPosts));
      
      // Then make the API call
      await api.likePost(profileAddress, postId);
      
      // Wait a bit for the backend to process the like before refreshing
      // This prevents overwriting the optimistic update with stale data
      setTimeout(() => {
        fetchPosts();
      }, 1000);
    } catch (err) {
      console.error('Failed to like post:', err);
      setError('Failed to like post');
      // Revert optimistic update on error
      await fetchPosts();
    }
  };

  // Comment on a post
  const commentOnPost = async (authorAddress: string, postId: string, text: string) => {
    try {
      const issuedAt = Date.now();
      const nonce = generateNonce();
      
      // Generate proper signature for comment
      const signature = await generateCommentSignature(
        {
          author: authorAddress,
          postId,
          text,
          issuedAt,
          nonce,
        },
        authorAddress,
        undefined // TODO: Pass wagmi signer when available
      );
      
      await api.commentOnPost({
        authorAddress,
        postId,
        text,
        signature,
        issuedAt,
        nonce,
      });
      
      // Refresh posts to get updated comment count
      await fetchPosts();
    } catch (err) {
      console.error('Failed to comment on post:', err);
      setError('Failed to comment on post');
    }
  };

  // Load posts on mount and when address changes
  useEffect(() => {
    console.log('🔄 useSocial: Loading posts, address:', address);
    fetchPosts();
  }, [address, fetchPosts]);

  // Refresh posts when page becomes visible (user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && address) {
        fetchPosts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [address, fetchPosts]);

  return {
    posts,
    isLoading,
    isCreatingPost,
    error,
    fetchPosts,
    createPost,
    likePost,
    commentOnPost,
  };
}


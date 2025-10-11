"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { api } from '@/lib/api';
import { generateCommentSignature, generateNonce } from '@/lib/signatures';
import ImageLightbox from '@/components/ImageLightbox';
import { Post, Comment, Like } from '@/lib/api';

// Icons
const CommentIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const RepostIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const LikeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ShareIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8m-4-6-4-4-4 4m4-4v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ArrowLeftIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

export default function DashboardPostDetailPage({ params }: { params: { postId: string } }) {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.getPostById(params.postId);
        setPost(response.post);
        setComments(response.post.comments || []);
        setLikes(response.post.likes || []);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [params.postId]);

  const getImageGridClasses = (imageCount: number) => {
    switch (imageCount) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-2 grid-rows-2 [&>*:first-child]:col-span-2 [&>*:first-child]:row-span-1';
      case 4: return 'grid-cols-2 grid-rows-2';
      default: return 'grid-cols-1';
    }
  };

  const getImageHeightClass = (imageCount: number) => {
    switch (imageCount) {
      case 1: return 'h-80';
      case 2: return 'h-52';
      case 3: return 'h-52';
      case 4: return 'h-52';
      default: return 'h-52';
    }
  };

  const openImageLightbox = (images: string[], index: number = 0) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeImageLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxImages([]);
    setLightboxIndex(0);
  };

  const handleLike = async () => {
    if (!post || isLiking) return;
    
    // Use fallback address if no wallet connected
    const userAddress = currentUser.address || '0xe2f92e8f706997b021919a092437372b268a432d';

    try {
      setIsLiking(true);
      
      // Check if user already liked this post
      const userLiked = likes.some(like => 
        like.profile?.address?.toLowerCase() === userAddress.toLowerCase()
      );

      if (userLiked) {
        // Unlike the post
        await api.unlikePost(userAddress, post.id);
        setLikes(prev => prev.filter(like => 
          like.profile?.address?.toLowerCase() !== userAddress.toLowerCase()
        ));
      } else {
        // Like the post
        await api.likePost(userAddress, post.id);
        const newLike: Like = {
          id: `temp_${Date.now()}`,
          profileId: `temp_${Date.now()}`,
      postId: post.id,
          profile: {
            id: `temp_${Date.now()}`,
            address: userAddress,
            qnsName: null,
            displayName: null,
            avatarUrl: null,
            bio: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        };
        setLikes(prev => [...prev, newLike]);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !post || isCommenting) return;
    
    // Use fallback address if no wallet connected
    const userAddress = currentUser.address || '0xe2f92e8f706997b021919a092437372b268a432d';

    try {
      setIsCommenting(true);
      
      const issuedAt = Date.now();
      const nonce = generateNonce();
      
      // Generate signature for comment
      const signature = await generateCommentSignature(
        {
          author: userAddress,
          postId: post.id,
          text: newCommentText.trim(),
          issuedAt,
          nonce,
        },
        userAddress,
        undefined // TODO: Pass wagmi signer when available
      );

      const response = await api.commentOnPost({
        authorAddress: userAddress,
        postId: post.id,
        text: newCommentText.trim(),
        signature,
        issuedAt,
        nonce,
      });

      // Add comment to local state
      setComments(prev => [...prev, response.comment]);
    setNewCommentText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsCommenting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white mb-4">
          <ArrowLeftIcon />
        </button>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading post...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white mb-4">
          <ArrowLeftIcon />
        </button>
        <div className="text-red-400">{error || 'Post not found'}</div>
      </div>
    );
  }

  const userAddress = currentUser.address || '0xe2f92e8f706997b021919a092437372b268a432d';
  const userLiked = likes.some(like => 
    like.profile?.address?.toLowerCase() === userAddress.toLowerCase()
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 h-[calc(100vh-60px)] mt-[-20px]">
      <main className="flex flex-col gap-4 pr-6 lg:pr-0">
        <div className="flex items-center gap-4 bg-black p-4 rounded-lg top-0 z-10">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
            <ArrowLeftIcon />
          </button>
          <h2 className="text-xl font-bold">Post</h2>
        </div>

        <div className="flex flex-col bg-black p-6 rounded-lg gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden"></div>
            <div>
              <span className="font-bold block">
                {post.author.qnsName || post.author.displayName || 
                 `${post.author.address.slice(0, 6)}...${post.author.address.slice(-4)}`}
              </span>
              <span className="text-gray-400 text-sm">
                {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
          
          <p className="leading-relaxed whitespace-pre-line text-lg mb-4">
            {post.textPreview}
          </p>
          
          {post.imageCids && post.imageCids.length > 0 && (
            <div className={`grid ${getImageGridClasses(post.imageCids.length)} gap-2 rounded-xl overflow-hidden mb-4`}>
              {post.imageCids.map((cid, index) => {
                const imageUrl = cid.startsWith('local_') 
                  ? `/api/placeholder?text=Image&cid=${cid}`
                  : `https://${cid}.ipfs.nftstorage.link`;
                
                return (
                  <img 
                    key={index} 
                    src={imageUrl}
                    alt={`Post image ${index + 1}`} 
                    className={`w-full object-cover cursor-pointer hover:opacity-90 transition-opacity ${getImageHeightClass(post.imageCids.length)}`}
                    onClick={() => openImageLightbox(
                      post.imageCids!.map(c => c.startsWith('local_') 
                        ? `/api/placeholder?text=Image&cid=${c}` 
                        : `https://${c}.ipfs.nftstorage.link`
                      ),
                      index
                    )}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `/api/placeholder?text=Image+Not+Available&cid=${cid}`;
                    }}
                  />
                );
              })}
            </div>
          )}

          <div className="flex justify-around border-y border-gray-700 py-3 text-gray-400 my-4">
            <span className="flex items-center gap-1">
              <span className="font-bold text-white">{likes.length}</span> Likes
            </span>
            <span className="flex items-center gap-1">
              <span className="font-bold text-white">0</span> Reposts
            </span>
            <span className="flex items-center gap-1">
              <span className="font-bold text-white">{comments.length}</span> Comments
            </span>
          </div>

          <div className="flex justify-around text-gray-400">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200 ${
                userLiked ? 'text-red-500' : 'hover:text-red-500'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <LikeIcon />
            </button>
            <button className="flex items-center gap-2 hover:text-green-500 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
              <RepostIcon />
            </button>
            <button className="flex items-center gap-2 hover:text-blue-500 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
              <CommentIcon />
            </button>
            <button className="flex items-center hover:text-blue-500 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
              <ShareIcon />
            </button>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-black p-4 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden mt-3">
            <img src={currentUser.profileImg} className="w-auto h-full" alt="Your Profile" />
          </div>
          <div className="flex-grow flex flex-col relative">
            <textarea
              className="w-[87%] p-2 bg-transparent text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none scrollbar-hide"
              rows={2}
              placeholder="Post your reply!"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              disabled={isCommenting}
            />
            <div className="absolute top-3 right-2">
              <button 
                onClick={handleAddComment} 
                disabled={!newCommentText.trim() || isCommenting}
                className="bg-gradient-to-r from-[#8B1E3F] to-[#6C3B9E] text-white py-2 px-5 rounded-full font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCommenting ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-px bg-gray-700 rounded-lg overflow-hidden mb-4">
          {comments.length > 0 ? (
            comments.map(comment => (
              <div className="flex gap-4 bg-black p-6" key={comment.id}>
                <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden">
                  <img 
                    src={comment.author?.avatarUrl || '/assets/avatars/alice-chen.png'} 
                    className="w-auto h-full" 
                    alt={`${comment.author?.qnsName || comment.author?.address || 'User'}'s profile`} 
                  />
                </div>
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">
                      {comment.author?.qnsName || comment.author?.displayName || 
                       `${comment.author?.address.slice(0, 6)}...${comment.author?.address.slice(-4)}`}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(comment.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="leading-relaxed text-gray-300">
                    {comment.textPreview}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-black p-6 text-center text-gray-500">
              No comments yet. Be the first to reply!
            </div>
          )}
        </div>
      </main>

      <aside className="hidden lg:flex flex-col gap-6 overflow-y-auto h-full scrollbar-hide bg-black rounded-xl p-6">
        <div>
          <h4 className="text-xl mb-6">Trending</h4>
          <ul className="list-none border border-gray-700 rounded-xl p-6">
            {[{ tag: '#quai', count: '50 posts' }, { tag: '#qns.domain', count: '10 posts' }].map((item, i) => (
              <li key={i} className="flex justify-between mb-4 last:mb-0">
                <span className="font-medium">{item.tag}</span>
                <span className="text-gray-400">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={closeImageLightbox}
      />
    </div>
  );
}
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSocial } from '@/hooks/useSocial';
import CreatePostModal from '@/components/CreatePostModal';
import ImageLightbox from '@/components/ImageLightbox';
import ImageWithLoading from '@/components/ImageWithLoading';
import { PostSkeletonList } from '@/components/PostSkeleton';

// SVG Icons
const ImageIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="m21 15-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CommentIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const RepostIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const LikeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ShareIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8m-4-6-4-4-4 4m4-4v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const AddIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ProfileIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;



const leaderboard = [
    { rank: 1, name: 'alice.quai', score: '300 posts' },
    { rank: 2, name: 'alice.quai', score: '300 posts' },
    { rank: 3, name: 'alice.quai', score: '300 posts' },
    { rank: 4, name: 'alice.quai', score: '300 posts' },
    { rank: 5, name: 'alice.quai', score: '300 posts' },
    { rank: 6, name: 'alice.quai', score: '300 posts' },
    { rank: 7, name: 'alice.quai', score: '300 posts' },
    { rank: 8, name: 'alice.quai', score: '300 posts' },
];

const trending = [
    { tag: '#quai', count: '50 posts' }, 
    { tag: '#qns.domain', count: '10 posts' },
    { tag: '@alice.quai', count: '8 mentions' }, 
    { tag: '#quai', count: '50 posts' },
];

const SocialActivity = () => {
    const [activeTab, setActiveTab] = useState('For You');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const router = useRouter();
    const currentUser = useCurrentUser();
    const { posts, isLoading, isCreatingPost, error, createPost, likePost, commentOnPost } = useSocial();

    const handleCreatePost = async (content: string, images?: File[]) => {
        // Use fallback address if no wallet connected
        const userAddress = currentUser.address || '0xe2f92e8f706997b021919a092437372b268a432d';

        try {
            await createPost(
                { text: content, zone: 'cyprus-1', images },
                userAddress
            );
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to create post:', err);
            // Error message is already set in useSocial hook, just show modal stays open
        }
    };

    const getImageGridClasses = (imageCount: number) => {
        switch (imageCount) {
            case 1:
                return "grid-cols-1"; // Single image takes full width
            case 2:
                return "grid-cols-2"; // Two images, side-by-side
            case 3:
                return "grid-cols-2 grid-rows-2 [&>*:first-child]:col-span-2 [&>*:first-child]:row-span-1"; // First image full width on top, others below
            case 4:
                return "grid-cols-2 grid-rows-2"; // Four images in a 2x2 grid
            default:
                return "grid-cols-1"; // Fallback for unexpected counts
        }
    };

    const getImageHeightClass = (imageCount: number) => {
        switch (imageCount) {
            case 1:
                return "h-80";
            case 2:
                return "h-52"; 
            case 3:
                return "h-52";
            case 4:
                return "h-52";
            default:
                return "h-52";
        }
    }

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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 h-[calc(100vh-60px)] mt-[-20px]">
            <main className="flex flex-col gap-4 overflow-y-scroll pr-6 lg:pr-0 scrollbar-hide relative">
                <div className="flex border-b border-gray-700">
                    <button 
                        className={`py-4 px-6 text-base font-medium relative ${activeTab === 'For You' ? 'text-white' : 'text-gray-400'}`} 
                        onClick={() => setActiveTab('For You')}
                    >
                        For You
                        {activeTab === 'For You' && <span className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-primary"></span>}
                    </button>
                    <button 
                        className={`py-4 px-6 text-base font-medium relative ${activeTab === 'Following' ? 'text-white' : 'text-gray-400'}`} 
                        onClick={() => setActiveTab('Following')}
                    >
                        Following
                        {activeTab === 'Following' && <span className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-primary"></span>}
                    </button>
                </div>
                
                <div className="flex items-center gap-4 bg-black p-4 rounded-lg cursor-pointer" onClick={() => setIsModalOpen(true)}>
                            <div className="w-12 h-12 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden">
                                <img src={currentUser.profileImg} className="w-auto h-full" alt="Your Profile Image" />
                            </div>
                    <div className="flex-grow flex items-center rounded-lg px-2">
                       <span className="py-3 text-gray-400 text-base">Got an Alpha?</span>
                       <div className="ml-auto text-gray-400">
                           <ImageIcon />
                       </div>
                    </div>
                    <button className="bg-gradient-to-r from-[#8B1E3F] to-[#6C3B9E] text-white py-2 px-5 rounded-full font-medium text-sm">Post</button>
                </div>

                <div className="flex flex-col gap-px bg-gray-700 rounded-lg overflow-y-scroll scrollbar-hide">
                    {isLoading ? (
                        <PostSkeletonList count={3} />
                    ) : error ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="text-red-400 text-center">
                                <div className="text-lg font-medium mb-2">Error</div>
                                <div>{error}</div>
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="text-gray-400">No posts yet. Be the first to post!</div>
                        </div>
                    ) : (
                        posts.map(post => (
                            <div className="flex gap-4 bg-black p-6 cursor-pointer" key={post.id} onClick={() => router.push(`/dashboard/post/${post.id}`)}>
                                <div className="w-12 h-12 rounded-full bg-gray-600 flex-shrink-0"></div>
                                <div className="w-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold">{post.author.name || `${post.author.address.slice(0, 6)}...${post.author.address.slice(-4)}`}</span>
                                        <span className="text-gray-400 text-sm">{new Date(post.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="leading-relaxed mb-4">{post.textPreview}</p>
                                    {post.imageCids && post.imageCids.length > 0 && (
                                        <div className={`grid ${getImageGridClasses(post.imageCids.length)} gap-2 rounded-xl overflow-hidden mb-4`}>
                                            {post.imageCids.map((cid, index) => {
                                                // Handle both IPFS CIDs and local fallback CIDs
                                                const imageUrl = cid.startsWith('local_') 
                                                    ? `/api/placeholder?text=Image&cid=${cid}` // Fallback for local CIDs
                                                    : `https://gateway.pinata.cloud/ipfs/${cid}`;
                                                
                                                return (
                                                    <ImageWithLoading
                                                        key={index}
                                                        src={imageUrl}
                                                        alt={`Post image ${index + 1}`}
                                                        className={`w-full object-cover cursor-pointer hover:opacity-90 transition-opacity ${getImageHeightClass(post.imageCids!.length)}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openImageLightbox(
                                                                post.imageCids!.map(c => c.startsWith('local_') 
                                                                    ? `/api/placeholder?text=Image&cid=${c}` 
                                                                    : `https://gateway.pinata.cloud/ipfs/${c}`
                                                                ),
                                                                index
                                                            );
                                                        }}
onError={(e) => {
                                                            // Try multiple IPFS gateways as fallback
                                                            const target = e.target as HTMLImageElement;
                                                            const currentSrc = target.src;
                                                            
                                                            // Skip if it's already a local placeholder
                                                            if (currentSrc.includes('placeholder') || cid.startsWith('local_')) {
                                                                return; // Let component show error state
                                                            }
                                                            
                                                            // Try fallback gateways
                                                            if (currentSrc.includes('pinata.cloud')) {
                                                                target.src = `https://ipfs.io/ipfs/${cid}`;
                                                            } else if (currentSrc.includes('ipfs.io')) {
                                                                target.src = `https://cloudflare-ipfs.com/ipfs/${cid}`;
                                                            } else if (currentSrc.includes('cloudflare-ipfs.com')) {
                                                                target.src = `https://dweb.link/ipfs/${cid}`;
                                                            }
                                                            // If dweb.link fails, don't set new src - let component show error state
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="flex gap-6 text-gray-400">
                                        <button 
                                            className="flex items-center gap-2 hover:text-red-500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (currentUser.address) {
                                                    likePost(currentUser.address, post.id);
                                                }
                                            }}
                                        >
                                            <LikeIcon /> {post.likes?.length || 0}
                                        </button>
                                        <button className="flex items-center gap-2 hover:text-green-500"><RepostIcon /> 0</button>
                                        <button className="flex items-center gap-2 hover:text-blue-500"><CommentIcon /> {post.comments?.length || 0}</button>
                                        <button className="flex items-center hover:text-blue-500"><ShareIcon /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
            
            <aside className="hidden lg:flex flex-col gap-6 overflow-y-auto h-full scrollbar-hide bg-black rounded-xl">
                <div className="p-6">
                    <h4 className="text-xl mb-6">User Leaderboard</h4>
                    <ul className="list-none">
                        {leaderboard.map((user, i) => (
                            <li key={i} className="flex items-center gap-3 mb-4 last:mb-0">
                                <span className="text-[#BE8200] font-bold w-4 text-sm">#{user.rank}</span>
                                <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                                <span className="flex-grow">{user.name}</span>
                                <span className="text-primary font-medium text-sm">{user.score}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-end gap-4 mt-6 text-sm">
                        <button className="text-gray-400 hover:text-white">&lt; Next</button>
                        <button className="text-gray-400 hover:text-white">Prev &gt;</button>
                    </div>
                </div>

                <div className="p-6">
                    <h4 className="text-xl mb-6">Trending</h4>
                    <ul className="list-none border border-gray-700 rounded-xl p-6">
                        {trending.map((item, i) => (
                            <li key={i} className="flex justify-between mb-4 last:mb-0">
                                <span className="font-medium">{item.tag}</span>
                                <span className="text-gray-400">{item.count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
            
            <div className={`fixed bottom-6 right-12 flex flex-col-reverse items-center gap-4 ${isFabOpen ? 'open' : ''}`}>
                 <div className={`flex flex-col-reverse gap-4 transition-all duration-300 ease-in-out ${isFabOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'}`}>
                    <button className="w-12 h-12 rounded-full bg-gray-800 text-white border border-gray-700 flex items-center justify-center shadow-lg hover:bg-gray-700" title="Create Post" onClick={() => { setIsModalOpen(true); setIsFabOpen(false); }}>
                        <AddIcon />
                    </button>
                    <button className="w-12 h-12 rounded-full bg-gray-800 text-white border border-gray-700 flex items-center justify-center shadow-lg hover:bg-gray-700" title="View Profile" onClick={() => router.push('/dashboard/profile')}>
                        <ProfileIcon />
                    </button>
                </div>
                <button className={`w-14 h-14 rounded-full bg-gradient-to-r from-[#8B1E3F] to-[#6C3B9E] text-white flex items-center justify-center shadow-xl transition-transform duration-200 ease-in-out ${isFabOpen ? 'rotate-45 scale-105' : 'scale-100'}`} onClick={() => setIsFabOpen(!isFabOpen)}>
                    <AddIcon />
                </button>
            </div>

            {isModalOpen && <CreatePostModal onClose={() => setIsModalOpen(false)} onCreatePost={handleCreatePost} />}
            
            {/* Image Lightbox */}
            <ImageLightbox
                images={lightboxImages}
                currentIndex={lightboxIndex}
                isOpen={isLightboxOpen}
                onClose={closeImageLightbox}
            />
        </div>
    );
};

export default SocialActivity;

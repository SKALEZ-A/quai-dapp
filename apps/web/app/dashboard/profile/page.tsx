"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar as faCalendarRegular } from '@fortawesome/free-regular-svg-icons';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import CreatePostModal from '@/components/CreatePostModal';
import EditProfileModal from '@/components/EditProfileModal';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const CommentIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const RepostIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const LikeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ShareIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8m-4-6-4-4-4 4m4-4v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const initialPosts = [
  { id: 1, time: '2m', content: 'just.minted the @alex.quai domain.....rate it 1-10!!', images: [] as string[], likes: 300, comments: 22, reposts: 150 },
  { id: 2, time: '3h', content: "In 2019, this guy tricked 4 US companies into sending him $18M.\n\nThen he spent it on a Rolls Royce Cullinan, a Lamborghini Urus, and one Mercedes Benz G-Class AMG G55.\n\nFor months, he didn't get caught.\n\nUntil one tiny detail brought him down", images: [
      'https://static0.makeuseofimages.com/wordpress/wp-content/uploads/2024/08/some-3d-social-media-icons.jpg',
      'https://static0.makeuseofimages.com/wordpress/wp-content/uploads/2024/08/some-3d-social-media-icons.jpg',
      'https://static0.makeuseofimages.com/wordpress/wp-content/uploads/2024/08/some-3d-social-media-icons.jpg',
    ], likes: 300, comments: 22, reposts: 150 },
];

const SocialProfile: React.FC = () => {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const [activeTab, setActiveTab] = useState<'Posts' | 'Media' | 'Likes'>('Posts');
  const currentUser = useCurrentUser();
  const router = useRouter();

  const handleCreatePost = (content: string, imageUrl?: string) => {
    const newPost = {
      id: posts.length + 1,
      time: 'Just now',
      content,
      images: imageUrl ? [imageUrl] : [],
      likes: 0,
      comments: 0,
      reposts: 0,
    };
    setPosts(prev => [newPost, ...prev]);
    setIsCreatePostModalOpen(false);
  };

  const handleSaveProfile = (updatedProfile: { name: string; username: string; about: string; profileImg: string; coverImg: string; }) => {
    // TODO: wire to backend/state
    console.log('Saving profile', updatedProfile);
    setIsEditProfileModalOpen(false);
  };

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 mt-[-20px]">
      <main className="flex flex-col gap-4 pr-6 lg:pr-0 relative">
        <div className="bg-black rounded-lg overflow-hidden relative">
          <div className="h-28 bg-white rounded-t-lg overflow-hidden">
            <img src={currentUser.coverImg} className="w-full h-auto transform translate-y-[-40%]" alt="Your Cover" />
          </div>

          <div className="relative px-6 py-6">
            <div className="absolute -top-10 left-6 w-20 h-20 rounded-full bg-purple-700 border-2 border-background shadow-md overflow-hidden">
              <img src={currentUser.profileImg} className="w-auto h-full" alt="Your Profile" />
            </div>

            <div className="mt-6">
              <h3 className="font-bold text-xl">{currentUser.name}</h3>
              <p className="text-sm text-gray-400">{currentUser.username}</p>
              <p className="text-sm mt-5">{currentUser.about}</p>
              <p className="text-xs text-gray-400 mt-2"><FontAwesomeIcon icon={faCalendarRegular} className="text-white font-bold"/><span className="mx-1">{currentUser.date_joined}</span></p>
              <div className="flex gap-3">
                <p className="text-xs text-gray-400 mt-2"><span className="font-extrabold text-white">{currentUser.followers}</span><span className="mx-1">Followers</span></p>
                <p className="text-xs text-gray-400 mt-2"><span className="font-extrabold text-white">{currentUser.following}</span><span className="mx-1">Following</span></p>
              </div>
            </div>
            <button className="bg-primary bg-opacity-20 border border-white absolute top-5 right-5 rounded-full py-1.5 px-4 text-sm" onClick={() => setIsEditProfileModalOpen(true)}>
              <FontAwesomeIcon icon={faPen} className="text-xs mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {(['Posts','Media','Likes'] as const).map(tab => (
            <button key={tab} className={`py-4 px-6 text-base font-medium relative ${activeTab === tab ? 'text-white' : 'text-gray-400'}`} onClick={() => setActiveTab(tab)}>
              {tab}
              {activeTab === tab && <span className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-primary"></span>}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="flex flex-col gap-px bg-gray-700 rounded-lg overflow-y-scroll scrollbar-hide">
          {posts.map(post => (
            <div className="flex gap-4 bg-black p-6 cursor-pointer" key={post.id} onClick={() => router.push(`/dashboard/post/${post.id}`)}>
              <div className="w-12 h-12 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden">
                <img src={currentUser.profileImg} className="w-auto h-full" alt="Your Profile" />
              </div>
              <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold">{currentUser.username}</span>
                  <span className="text-gray-400 text-sm">{post.time}</span>
                </div>
                <p className="leading-relaxed mb-4 whitespace-pre-line">{post.content}</p>
                {post.images.length > 0 && (
                  <div className={`grid ${getImageGridClasses(post.images.length)} gap-2 rounded-xl overflow-hidden mb-4`}>
                    {post.images.map((imageUrl, index) => (
                      <img key={index} src={imageUrl} alt={`Post image ${index + 1}`} className={`w-full object-cover ${getImageHeightClass(post.images.length)}`} />
                    ))}
                  </div>
                )}
                <div className="flex gap-6 text-gray-400">
                  <button className="flex items-center gap-2 hover:text-red-500"><LikeIcon /> {post.likes}</button>
                  <button className="flex items-center gap-2 hover:text-green-500"><RepostIcon /> {post.reposts}</button>
                  <button className="flex items-center gap-2 hover:text-blue-500"><CommentIcon /> {post.comments}</button>
                  <button className="flex items-center hover:text-blue-500"><ShareIcon /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <aside className="hidden lg:flex flex-col gap-6 overflow-y-auto h-full scrollbar-hide bg-black rounded-xl p-6">
        <div>
          <h4 className="text-xl mb-6">About</h4>
          <p className="text-gray-400 text-sm">{currentUser.about}</p>
        </div>
        <div>
          <button onClick={() => setIsCreatePostModalOpen(true)} className="w-full py-3 rounded-lg bg-gradient-to-r from-[#8B1E3F] to-[#6C3B9E] text-white text-sm font-medium">Create Post</button>
        </div>
      </aside>

      {isCreatePostModalOpen && (
        <CreatePostModal onClose={() => setIsCreatePostModalOpen(false)} onCreatePost={handleCreatePost} />
      )}

      {isEditProfileModalOpen && (
        <EditProfileModal onClose={() => setIsEditProfileModalOpen(false)} onSave={handleSaveProfile} />
      )}
    </div>
  );
};

export default SocialProfile;

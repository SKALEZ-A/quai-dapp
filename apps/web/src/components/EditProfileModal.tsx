"use client";

// src/components/EditProfileModal.tsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCamera } from '@fortawesome/free-solid-svg-icons';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface EditProfileModalProps {
    onClose: () => void;
    onSave: (updatedProfile: {
        name: string;
        username: string;
        about: string;
        profileImg: string;
        coverImg: string;
    }) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose, onSave }) => {
    const currentUser = useCurrentUser();

    const [name, setName] = useState(currentUser.name);
    const [username, setUsername] = useState(currentUser.username);
    const [about, setAbout] = useState(currentUser.about);
    const [profileImg, setProfileImg] = useState(currentUser.profileImg);
    const [coverImg, setCoverImg] = useState(currentUser.coverImg);
    
    useEffect(() => {
        setName(currentUser.name);
        setUsername(currentUser.username);
        setAbout(currentUser.about);
        setProfileImg(currentUser.profileImg);
        setCoverImg(currentUser.coverImg);
    }, [currentUser]);

    const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImg(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImg(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onSave({ name, username, about, profileImg, coverImg });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Cover Image Section */}
                    <div className="relative h-40 bg-gray-700 rounded-lg mb-16 overflow-hidden">
                        <img src={coverImg} alt="Cover" className="w-full h-full object-cover" />
                        <label htmlFor="cover-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <FontAwesomeIcon icon={faCamera} size="2x" />
                            <input
                                id="cover-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCoverImageUpload}
                            />
                        </label>
                    </div>

                    {/* Profile Image Section */}
                    <div className="relative w-32 h-32 rounded-full border-4 border-gray-800 bg-gray-600 -mt-24 ml-6 overflow-hidden">
                        <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                        <label htmlFor="profile-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <FontAwesomeIcon icon={faCamera} size="lg" />
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfileImageUpload}
                            />
                        </label>
                    </div>

                    {/* Profile Details Form */}
                    <div className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="about" className="block text-sm font-medium text-gray-300 mb-1">About</label>
                            <textarea
                                id="about"
                                value={about}
                                onChange={(e) => setAbout(e.target.value)}
                                rows={4}
                                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-primary focus:border-primary resize-none"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-700 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="bg-primary text-white font-bold py-2 px-6 rounded-full hover:bg-primary-dark transition-colors duration-200"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;

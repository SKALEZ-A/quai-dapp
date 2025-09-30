"use client";

import React, { useState, useRef, useLayoutEffect } from 'react';

// SVG Icon for image upload
const ImageIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="m21 15-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

interface CreatePostModalProps {
  onClose: () => void;
  onCreatePost: (content: string, image?: string) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onCreatePost }) => {
  const [postContent, setPostContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePost = () => {
    if (postContent.trim() || imagePreview) {
      onCreatePost(postContent, imagePreview || undefined);
    }
  };
  
  // Auto-resize textarea height
  useLayoutEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = 'inherit';
      textArea.style.height = `${textArea.scrollHeight}px`;
    }
  }, [postContent]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-start pt-[20vh]"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-xl p-6 space-y-5 overflow-y-auto max-h-[80vh] scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image preview */}
        {imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Selected preview"
              className="w-full max-h-[350px] object-cover rounded-lg border border-border"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 w-8 h-8 bg-black/70 text-white text-xl rounded-full flex items-center justify-center hover:bg-black transition"
              aria-label="Remove image"
            >
              &times;
            </button>
          </div>
        )}

        {/* Post input row */}
        <div className="flex items-start gap-4">
          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-border transition"
          >
            <ImageIcon />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/png, image/jpeg, image/gif"
            className="hidden"
          />

          {/* Textarea */}
          <textarea
            ref={textAreaRef}
            className="flex-grow bg-transparent border-none text-text-primary text-base font-manrope resize-none py-2 placeholder:text-text-secondary focus:outline-none"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="What's happening?"
            rows={1}
            autoFocus
          />

          {/* Post button */}
          <button
            onClick={handlePost}
            disabled={!postContent.trim() && !imagePreview}
            className="px-5 py-2.5 bg-gradient-primary text-text-primary rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );

};

export default CreatePostModal;

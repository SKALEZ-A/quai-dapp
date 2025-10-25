"use client";

import React, { useState, useRef, useLayoutEffect } from 'react';

// SVG Icon for image upload
const ImageIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="m21 15-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

interface CreatePostModalProps {
  onClose: () => void;
  onCreatePost: (content: string, images?: File[]) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onCreatePost }) => {
  const [postContent, setPostContent] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGES = 4;

  const handlePost = () => {
    if (postContent.trim() || imageFiles.length > 0) {
      const images = imageFiles.length > 0 ? imageFiles : undefined;
      onCreatePost(postContent, images);
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
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, MAX_IMAGES - imageFiles.length);
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      
      setImageFiles(prev => [...prev, ...newFiles]);
    }
    
    // Reset input value to allow selecting the same file again
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getImageGridClasses = () => {
    const count = imagePreviews.length;
    switch (count) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-2 grid-rows-2 [&>*:first-child]:col-span-2';
      case 4: return 'grid-cols-2 grid-rows-2';
      default: return 'grid-cols-1';
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
        {/* Multiple image previews */}
        {imagePreviews.length > 0 && (
          <div className={`grid ${getImageGridClasses()} gap-2`}>
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-52 object-cover rounded-lg border border-border"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/70 text-white text-xl rounded-full flex items-center justify-center hover:bg-black transition opacity-0 group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  &times;
                </button>
              </div>
            ))}
            
            {/* Add more images button (show if less than MAX_IMAGES) */}
            {imagePreviews.length < MAX_IMAGES && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-52 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-text-secondary transition text-text-secondary hover:text-text-primary"
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="mt-2 text-sm">Add Image ({imagePreviews.length}/{MAX_IMAGES})</span>
              </button>
            )}
          </div>
        )}

        {/* Post input row */}
        <div className="flex items-start gap-4">
          {/* Upload button (only show if no images yet) */}
          {imagePreviews.length === 0 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-border transition"
            >
              <ImageIcon />
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/png, image/jpeg, image/gif"
            multiple
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
            disabled={!postContent.trim() && imagePreviews.length === 0}
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

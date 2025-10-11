"use client";

import React from 'react';

const PostSkeleton: React.FC = () => {
  return (
    <div className="flex gap-4 bg-black p-6 animate-pulse">
      {/* Avatar skeleton */}
      <div className="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0"></div>
      
      <div className="w-full">
        {/* Header skeleton */}
        <div className="flex items-center gap-2 mb-2">
          <div className="h-4 bg-gray-700 rounded w-32"></div>
          <div className="h-3 bg-gray-700 rounded w-20"></div>
        </div>
        
        {/* Text content skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
        
        {/* Image placeholder skeleton */}
        <div className="w-full h-80 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-xl mb-4 relative overflow-hidden">
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-600/20 to-transparent"></div>
        </div>
        
        {/* Action buttons skeleton */}
        <div className="flex gap-6">
          <div className="h-5 bg-gray-700 rounded w-12"></div>
          <div className="h-5 bg-gray-700 rounded w-12"></div>
          <div className="h-5 bg-gray-700 rounded w-12"></div>
          <div className="h-5 bg-gray-700 rounded w-12"></div>
        </div>
      </div>
    </div>
  );
};

// Multiple skeleton loaders for initial load
export const PostSkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </>
  );
};

export default PostSkeleton;


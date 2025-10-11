"use client";

import React, { useState, useEffect } from 'react';

interface ImageWithLoadingProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const ImageWithLoading: React.FC<ImageWithLoadingProps> = ({ 
  src, 
  alt, 
  className = '', 
  onClick,
  onError 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [errorCount, setErrorCount] = useState(0);

  // Reset loading state when src changes (for gateway fallback retries)
  useEffect(() => {
    if (src !== currentSrc) {
      setIsLoading(true);
      setHasError(false);
      setCurrentSrc(src);
      setErrorCount(0);
    }
  }, [src, currentSrc]);

  // Timeout to show error if loading takes too long (fallback for gateway failures)
  useEffect(() => {
    if (isLoading && !hasError) {
      const timeout = setTimeout(() => {
        // If still loading after 15 seconds, show error
        if (isLoading) {
          setIsLoading(false);
          setHasError(true);
        }
      }, 15000);
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading, hasError]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setErrorCount(0);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const newErrorCount = errorCount + 1;
    setErrorCount(newErrorCount);

    if (onError) {
      // Store current src to detect if parent changes it
      const oldSrc = (e.target as HTMLImageElement).src;
      onError(e);
      
      // Check after a brief delay if src changed (parent tried new gateway)
      setTimeout(() => {
        const newSrc = (e.target as HTMLImageElement).src;
        if (oldSrc === newSrc || newErrorCount >= 4) {
          // Src didn't change OR we've tried 4+ times = all gateways failed
          setIsLoading(false);
          setHasError(true);
        }
        // Otherwise keep loading state (trying next gateway)
      }, 100);
    } else {
      // No error handler, show error immediately
      setIsLoading(false);
      setHasError(true);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Loading Skeleton */}
      {isLoading && (
        <div className={`absolute inset-0 ${className}`}>
          <div className="w-full h-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              {/* Loading Spinner */}
              <div className="w-10 h-10 border-4 border-gray-600 border-t-primary rounded-full animate-spin"></div>
              <span className="text-gray-400 text-sm font-medium">Loading image...</span>
              <span className="text-gray-500 text-xs">IPFS Gateway</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onClick={onClick}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      
      {/* Error State */}
      {hasError && !isLoading && (
        <div className={`absolute inset-0 ${className} bg-gray-800 flex flex-col items-center justify-center`}>
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-500 mb-2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="m21 15-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-gray-500 text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default ImageWithLoading;


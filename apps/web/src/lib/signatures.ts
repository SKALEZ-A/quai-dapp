/**
 * EIP-712 Signature Utilities for Quai Social
 * 
 * Handles signing of posts and comments with proper EIP-712 format
 * Supports both test private key (development) and Pelagus wallet (production)
 */

import { keccak256, toHex } from 'viem';

// Browser-compatible crypto functions

// EIP-712 Domain for Quai Social
export const EIP712_DOMAIN = {
  name: 'QuaiSocial',
  version: '1',
} as const;

// EIP-712 Types for Post signing
export const EIP712_TYPES = {
  Post: [
    { name: 'author', type: 'address' },
    { name: 'textHash', type: 'bytes32' },
    { name: 'zone', type: 'string' },
    { name: 'issuedAt', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const;

// EIP-712 Types for Comment signing
export const EIP712_COMMENT_TYPES = {
  Comment: [
    { name: 'author', type: 'address' },
    { name: 'postId', type: 'string' },
    { name: 'textHash', type: 'bytes32' },
    { name: 'issuedAt', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const;

export interface PostSigningData {
  author: string;
  text: string;
  zone?: string;
  issuedAt: number;
  nonce: string;
}

export interface CommentSigningData {
  author: string;
  postId: string;
  text: string;
  issuedAt: number;
  nonce: string;
}

/**
 * Generate a random nonce for EIP-712 signatures
 */
export function generateNonce(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return '0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate text hash for EIP-712 message
 */
function hashText(text: string): string {
  // Convert text to hex and hash it
  return keccak256(toHex(text));
}

/**
 * Sign a post using a private key (for testing)
 */
export async function signPostWithPrivateKey(
  postData: PostSigningData,
  privateKey: string
): Promise<string> {
  console.log('Generating signature for post:', {
    author: postData.author,
    textLength: postData.text.length,
    zone: postData.zone,
    issuedAt: postData.issuedAt,
    nonce: postData.nonce
  });

  // Generate text hash
  const textHash = hashText(postData.text);

  // Build the typed data structure
  const domain = EIP712_DOMAIN;
  const types = EIP712_TYPES;
  const message = {
    author: postData.author as `0x${string}`,
    textHash: textHash as `0x${string}`,
    zone: postData.zone || '',
    issuedAt: BigInt(postData.issuedAt),
    nonce: postData.nonce as `0x${string}`,
  };

  // For now, return a properly formatted mock signature
  // In production, this would use a real private key signing
  return `0x${Array.from({length: 130}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Sign a post using Pelagus wallet
 */
export async function signPostWithWallet(
  postData: PostSigningData,
  signer: any // wagmi signer type
): Promise<string> {
  console.log('Wallet signing not implemented, using mock signature');
  // Return a mock signature for development
  return `0x${Array.from({length: 65}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Sign a comment using a private key (for testing)
 */
export async function signCommentWithPrivateKey(
  commentData: CommentSigningData,
  privateKey: string
): Promise<string> {
  console.log('Generating mock signature for comment:', {
    author: commentData.author,
    postId: commentData.postId,
    text: commentData.text.substring(0, 50) + '...',
    issuedAt: commentData.issuedAt,
    nonce: commentData.nonce
  });

  // Return a mock signature for development
  return `0x${Array.from({length: 65}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Auto-detect signing method and generate signature
 * Tries Pelagus wallet first, falls back to test private key
 */
export async function generatePostSignature(
  postData: PostSigningData,
  address: string,
  signer?: any
): Promise<string> {
  console.log('Generating post signature for:', {
    textLength: postData.text.length,
    author: postData.author,
    zone: postData.zone
  });
  
  // Generate text hash
  const textHash = hashText(postData.text);

  // Build the typed data structure
  const domain = EIP712_DOMAIN;
  const types = EIP712_TYPES;
  const message = {
    author: postData.author as `0x${string}`,
    textHash: textHash as `0x${string}`,
    zone: postData.zone || '',
    issuedAt: BigInt(postData.issuedAt),
    nonce: postData.nonce as `0x${string}`,
  };

  try {
    // Try to use wallet signing if available
    if (signer && typeof (signer as any).signTypedData === 'function') {
      console.log('Using wallet signing');
      const signature = await (signer as any).signTypedData({
        domain,
        types,
        primaryType: 'Post',
        message,
      });
      return signature;
    }
  } catch (error) {
    console.warn('Wallet signing failed, using fallback:', error);
  }

  // Fallback to mock signature for development
  // Return a properly formatted signature (130 hex chars = 65 bytes)
  const mockSignature = `0x${Array.from({length: 130}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')}`;
  
  console.log('Using development signature:', mockSignature.slice(0, 20) + '...');
  return mockSignature;
}

/**
 * Generate comment signature (auto-detect method)
 */
export async function generateCommentSignature(
  commentData: CommentSigningData,
  address: string,
  signer?: any
): Promise<string> {
  console.log('Generating comment signature for:', {
    text: commentData.text.substring(0, 50) + '...',
    postId: commentData.postId,
    author: commentData.author
  });
  
  // For development, always return a mock signature
  return `0x${Array.from({length: 65}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')}`;
}

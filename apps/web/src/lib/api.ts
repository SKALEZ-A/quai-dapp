/**
 * API Client for Quai Social Backend
 * 
 * This module provides functions to interact with the backend API
 * for social features (posts, likes, comments)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Types
export interface Profile {
  id: string;
  address: string;
  qnsName?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface Post {
  id: string;
  cid: string;
  textPreview?: string;
  zone?: string;
  createdAt: string;
  author: Profile;
  likes?: Like[];
  comments?: Comment[];
}

export interface Like {
  id: string;
  profileId: string;
  postId: string;
}

export interface Comment {
  id: string;
  cid: string;
  textPreview?: string;
  authorId: string;
  postId: string;
  createdAt: string;
  author?: Profile;
}

export interface CreatePostData {
  authorAddress: string;
  text: string;
  zone?: string;
  issuedAt: number;
  nonce: string;
  signature: string;
  images?: File[]; // Optional array of image files
}

/**
 * Check API health
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

/**
 * Get posts feed
 */
export async function getPosts(params?: {
  limit?: number;
  cursor?: string;
  authorAddress?: string;
}): Promise<{ posts: Post[]; nextCursor: string | null }> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.cursor) queryParams.set('cursor', params.cursor);
  if (params?.authorAddress) queryParams.set('authorAddress', params.authorAddress);

  const url = `${API_URL}/posts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new post (requires EIP-712 signature)
 */
export async function createPost(data: CreatePostData): Promise<{ post: Post }> {
  console.log('API createPost called with:', {
    hasImages: !!data.images?.length,
    imageCount: data.images?.length || 0,
    textLength: data.text.length,
    authorAddress: data.authorAddress
  });

  // Use FormData if images are present
  if (data.images && data.images.length > 0) {
    console.log('Using FormData for image upload');
    const formData = new FormData();
    formData.append('authorAddress', data.authorAddress);
    formData.append('text', data.text);
    if (data.zone) formData.append('zone', data.zone);
    formData.append('issuedAt', data.issuedAt.toString());
    formData.append('nonce', data.nonce);
    formData.append('signature', data.signature);
    
    // Append all images
    data.images.forEach((image, index) => {
      console.log(`Appending image ${index}:`, {
        name: image.name,
        size: image.size,
        type: image.type
      });
      formData.append('images', image);
    });

    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Post creation failed:', error);
      throw new Error(error.error || 'Failed to create post');
    }

    return response.json();
  }

  // No images - use JSON
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create post');
  }

  return response.json();
}

/**
 * Like a post
 */
export async function likePost(profileAddress: string, postId: string): Promise<{ like: Like }> {
  const response = await fetch(`${API_URL}/engagements/likes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ profileAddress, postId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to like post');
  }

  return response.json();
}

/**
 * Comment on a post
 */
export async function commentOnPost(data: {
  authorAddress: string;
  postId: string;
  text: string;
  signature: string;
  issuedAt: number;
  nonce: string;
}): Promise<{ comment: Comment }> {
  const response = await fetch(`${API_URL}/engagements/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to comment on post');
  }

  return response.json();
}

/**
 * GraphQL query for feed (alternative to REST)
 */
export async function queryFeed(variables: {
  limit?: number;
  cursor?: string;
  authorAddress?: string;
}): Promise<{ feed: Post[] }> {
  const query = `
    query Feed($limit: Int, $cursor: ID, $authorAddress: String) {
      feed(limit: $limit, cursor: $cursor, authorAddress: $authorAddress) {
        id
        cid
        textPreview
        zone
        createdAt
        author {
          id
          address
          qnsName
          displayName
          avatarUrl
        }
      }
    }
  `;

  const response = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error('Failed to query feed');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get IPFS content by CID
 */
export async function getIpfsContent(cid: string): Promise<any> {
  try {
    const response = await fetch(`https://${cid}.ipfs.w3s.link`);
    if (!response.ok) {
      throw new Error('Failed to fetch IPFS content');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching IPFS content:', error);
    throw error;
  }
}

/**
 * Helper: Generate random nonce for EIP-712 signature
 */
export function generateNonce(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return '0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Helper: Get EIP-712 domain for post signing
 */
export function getPostSigningDomain() {
  return {
    name: 'QuaiSocial',
    version: '1',
  };
}

/**
 * Helper: Get EIP-712 types for post signing
 */
export function getPostSigningTypes() {
  return {
    Post: [
      { name: 'author', type: 'address' },
      { name: 'textHash', type: 'bytes32' },
      { name: 'zone', type: 'string' },
      { name: 'issuedAt', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
    ],
  };
}

/**
 * Get a single post by ID
 */
export async function getPostById(postId: string): Promise<{ post: Post }> {
  const response = await fetch(`${API_URL}/posts/${postId}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Post not found');
    }
    throw new Error(`Failed to fetch post: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Unlike a post
 */
export async function unlikePost(profileAddress: string, postId: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/engagements/likes`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ profileAddress, postId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to unlike post');
  }

  return response.json();
}

/**
 * API client object (for compatibility with useSocial hook)
 */
export const api = {
  getPosts: async (limit = 20, cursor?: string, authorAddress?: string) => {
    return getPosts({ limit, cursor, authorAddress });
  },
  getPostById,
  createPost,
  likePost,
  unlikePost,
  commentOnPost,
  getApiHealth: checkApiHealth,
};

